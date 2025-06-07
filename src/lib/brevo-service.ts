import { Message, MessageRecipient, SendMessageResponse } from './messaging-types';

export interface BrevoConfig {
  api_key: string;
  from_email: string;
  from_name: string;
  reply_to_email?: string;
}

export class BrevoService {
  private config: BrevoConfig;
  private baseUrl: string;

  constructor(config: BrevoConfig) {
    this.config = config;
    
    // Determine the base URL based on environment
    if (import.meta.env.VITE_BREVO_WORKER_URL) {
      // Use custom worker URL if provided
      this.baseUrl = import.meta.env.VITE_BREVO_WORKER_URL;
    } else if (import.meta.env.DEV) {
      // Local development - use Cloudflare Worker local dev server
      this.baseUrl = 'http://localhost:8787/api/brevo';
    } else {
      // Production - use relative path (will be handled by Cloudflare Worker route)
      this.baseUrl = '/api/brevo';
    }
  }

  /**
   * Make API request through the Worker
   */
  private async makeRequest(endpoint: string, method: string = 'GET', body?: any) {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': this.config.api_key
      },
      body: body ? JSON.stringify(body) : undefined
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(error.message || `API request failed: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Send email using Brevo API via Worker
   */
  async sendEmail(message: Message, recipients: MessageRecipient[]): Promise<SendMessageResponse> {
    try {
      const emailData = {
        sender: {
          name: this.config.from_name,
          email: this.config.from_email
        },
        to: recipients.map(recipient => ({
          email: recipient.recipient_email,
          name: recipient.recipient_name || undefined
        })),
        subject: message.subject,
        htmlContent: message.body,
        tags: ['dsvi-admin', message.message_type || 'email']
      };

      // Add reply-to if provided
      if (this.config.reply_to_email) {
        emailData['replyTo'] = {
          email: this.config.reply_to_email
        };
      }

      const response = await this.makeRequest('/smtp/email', 'POST', emailData);
      
      return {
        message_id: message.id,
        total_recipients: recipients.length,
        status: 'success',
        delivery_provider: 'brevo',
        delivery_id: response.messageId || undefined
      };

    } catch (error) {
      console.error('Brevo email sending failed:', error);
      
      return {
        message_id: message.id,
        total_recipients: recipients.length,
        status: 'failed',
        delivery_provider: 'brevo',
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  /**
   * Test Brevo connection via Worker
   */
  async testConnection(): Promise<{ success: boolean; error?: string }> {
    try {
      // Test by getting account info
      await this.makeRequest('/account');
      
      return { success: true };
    } catch (error) {
      console.error('Brevo connection test failed:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * Get account information via Worker
   */
  async getAccountInfo(): Promise<any> {
    try {
      const response = await this.makeRequest('/account');
      return response;
    } catch (error) {
      console.error('Failed to get Brevo account info:', error);
      throw error;
    }
  }

  /**
   * Send test email via Worker
   */
  async sendTestEmail(testEmail: string): Promise<{ success: boolean; error?: string }> {
    try {
      const testMessage: Message = {
        id: 'test-' + Date.now(),
        sender_id: 'system',
        subject: 'DSVI Email Test - Brevo Integration',
        body: `
          <html>
            <body>
              <h2>Email Test Successful!</h2>
              <p>This is a test email from your DSVI admin panel using Brevo.</p>
              <p><strong>Configuration:</strong></p>
              <ul>
                <li>Provider: Brevo (via Cloudflare Worker)</li>
                <li>From: ${this.config.from_name} &lt;${this.config.from_email}&gt;</li>
                <li>Test sent at: ${new Date().toISOString()}</li>
              </ul>
              <p>If you received this email, your Brevo integration is working correctly!</p>
            </body>
          </html>
        `,
        message_type: 'email',
        template_id: null,
        status: 'pending',
        scheduled_at: null,
        sent_at: null,
        delivery_provider: null,
        delivery_id: null,
        delivery_response: null,
        error_message: null,
        total_recipients: 1,
        successful_deliveries: 0,
        failed_deliveries: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const testRecipient: MessageRecipient = {
        id: 'test-recipient-' + Date.now(),
        message_id: testMessage.id,
        school_id: null,
        recipient_email: testEmail,
        recipient_name: 'Test Recipient',
        recipient_type: 'external',
        delivery_status: 'pending',
        sent_at: null,
        delivered_at: null,
        opened_at: null,
        clicked_at: null,
        bounce_reason: null,
        error_message: null,
        delivery_attempts: 0,
        last_attempt_at: null,
        created_at: new Date().toISOString()
      };

      const result = await this.sendEmail(testMessage, [testRecipient]);
      
      return {
        success: result.status === 'success',
        error: result.errors ? result.errors.join(', ') : undefined
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}
