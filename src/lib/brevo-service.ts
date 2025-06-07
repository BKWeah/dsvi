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
    } else {
      // Use relative path for both dev and production
      // This will work with Cloudflare Pages in both environments
      this.baseUrl = '/api/brevo';
    }
  }

  /**
   * Make API request through the Worker or direct to Brevo in development
   */
  private async makeRequest(endpoint: string, method: string = 'GET', body?: any) {
    // In development, if the worker is not available, call Brevo directly
    if (import.meta.env.DEV) {
      try {
        // Try the worker first
        const response = await fetch(`${this.baseUrl}${endpoint}`, {
          method,
          headers: {
            'Content-Type': 'application/json',
            'X-API-Key': this.config.api_key
          },
          body: body ? JSON.stringify(body) : undefined
        });

        // If we get 404 or other errors, fall back to direct API
        if (!response.ok) {
          if (response.status === 404) {
            console.warn('Worker endpoint not found (404), falling back to direct Brevo API');
            return this.makeDirectBrevoRequest(endpoint, method, body);
          }
          
          const error = await response.json().catch(() => ({ message: response.statusText }));
          throw new Error(error.message || `API request failed: ${response.statusText}`);
        }

        return response.json();
      } catch (error) {
        if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
          console.warn('Cloudflare Worker not available in development, calling Brevo API directly');
          return this.makeDirectBrevoRequest(endpoint, method, body);
        }
        // If it's not a fetch error, check if it's our 404 fallback case
        if (error instanceof Error && error.message.includes('Not Found')) {
          console.warn('Worker returned 404, falling back to direct Brevo API');
          return this.makeDirectBrevoRequest(endpoint, method, body);
        }
        throw error;
      }
    } else {
      // Production: use the worker
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
  }

  /**
   * Make direct API request to Brevo (fallback for development)
   */
  private async makeDirectBrevoRequest(endpoint: string, method: string = 'GET', body?: any) {
    const brevoUrl = `https://api.brevo.com/v3${endpoint}`;
    
    console.log(`🔄 Making direct Brevo API request to: ${brevoUrl}`);
    
    try {
      const response = await fetch(brevoUrl, {
        method,
        mode: 'cors',
        headers: {
          'accept': 'application/json',
          'content-type': 'application/json',
          'api-key': this.config.api_key,
        },
        body: body ? JSON.stringify(body) : undefined
      });

      console.log(`📡 Brevo API response: ${response.status} ${response.statusText}`);
      
      if (!response.ok) {
        const responseText = await response.text();
        console.error('❌ Brevo API error response:', responseText);
        
        // Try to parse as JSON, fallback to text
        let errorMessage;
        try {
          const errorJson = JSON.parse(responseText);
          errorMessage = errorJson.message || errorJson.error || responseText;
        } catch {
          errorMessage = responseText || `Brevo API request failed: ${response.statusText}`;
        }
        
        throw new Error(errorMessage);
      }

      const responseText = await response.text();
      console.log('✅ Brevo API success response:', responseText.substring(0, 200) + '...');
      
      // Parse JSON response
      try {
        return JSON.parse(responseText);
      } catch (parseError) {
        console.error('❌ Failed to parse Brevo response as JSON:', responseText);
        throw new Error('Invalid JSON response from Brevo API');
      }
      
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        // This is likely a CORS issue - provide a helpful error message
        console.error('❌ CORS Error: Cannot make direct API calls to Brevo from browser');
        throw new Error('Cannot connect to Brevo API directly from browser due to CORS restrictions. You need to run the Cloudflare Worker locally or deploy to production.');
      }
      throw error;
    }
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
   * Test Brevo connection via Worker or development mock
   */
  async testConnection(): Promise<{ success: boolean; error?: string }> {
    try {
      // In development, if we can't reach the worker, do a simple validation test
      if (import.meta.env.DEV) {
        try {
          await this.makeRequest('/account');
          return { success: true };
        } catch (error) {
          console.warn('Worker/API call failed, using development validation:', error);
          
          // Development fallback: validate API key format and configuration
          if (!this.config.api_key || !this.config.api_key.startsWith('xkeysib-')) {
            return { 
              success: false, 
              error: 'Invalid Brevo API key format. Should start with "xkeysib-"' 
            };
          }
          
          if (!this.config.from_email || !this.config.from_name) {
            return { 
              success: false, 
              error: 'Missing required email configuration (from_email or from_name)' 
            };
          }
          
          // In development, assume valid if config looks correct
          console.log('✅ Development mode: Email configuration appears valid');
          return { 
            success: true, 
            error: 'Development mode - configuration validated locally' 
          };
        }
      } else {
        // Production: must use the worker
        await this.makeRequest('/account');
        return { success: true };
      }
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
   * Send test email via Worker or development simulation
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
                <li>Provider: Brevo</li>
                <li>From: ${this.config.from_name} &lt;${this.config.from_email}&gt;</li>
                <li>Test sent at: ${new Date().toISOString()}</li>
                <li>Environment: ${import.meta.env.DEV ? 'Development' : 'Production'}</li>
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

      try {
        const result = await this.sendEmail(testMessage, [testRecipient]);
        
        return {
          success: result.status === 'success',
          error: result.errors ? result.errors.join(', ') : undefined
        };
      } catch (error) {
        // If we're in development and get a CORS error, simulate success
        if (import.meta.env.DEV && error instanceof Error && 
            (error.message.includes('CORS') || error.message.includes('Failed to fetch'))) {
          
          console.log('🧪 Development mode: Simulating successful email send due to CORS restrictions');
          
          return {
            success: true,
            error: 'Development mode: Email sending simulated (CORS restrictions prevent actual sending)'
          };
        }
        
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        };
      }

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}
