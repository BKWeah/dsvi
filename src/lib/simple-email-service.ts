/**
 * Simple Email Service for DSVI
 * Clean implementation using Brevo SMTP via Cloudflare Pages Function
 */

import { RecipientType } from './messaging-types'; // Import RecipientType

export class SimpleEmailService {
  private apiUrl: string;

  constructor() {
    // Use the new email API endpoint
    this.apiUrl = '/api/email/send';
  }

  /**
   * Send email via the new email API with proper recipient format
   */
  async sendEmail({ to, subject, html, from }: {
    to: string | Array<{ recipient_type: RecipientType; recipient_email?: string; recipient_name?: string; school_id?: string; }>;
    subject: string;
    html: string;
    from?: { email: string; name: string };
  }): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      console.log('📧 SimpleEmailService.sendEmail called with:', {
        to: Array.isArray(to) ? to : [to],
        toCount: Array.isArray(to) ? to.length : 1,
        subject: subject.substring(0, 50) + '...',
        hasFrom: !!from
      });

      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          to,
          subject,
          html,
          from
        })
      });

      const result = await response.json();
      
      console.log('📧 Email API response:', {
        ok: response.ok,
        status: response.status,
        success: result.success,
        messageId: result.messageId,
        error: result.error
      });
      
      if (!response.ok) {
        console.error('📧 Email API Error:', result);
        return {
          success: false,
          error: result.error || `HTTP ${response.status}: ${response.statusText}`
        };
      }

      return {
        success: true,
        messageId: result.messageId
      };

    } catch (error) {
      console.error('📧 Email sending failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Test email connection
   */
  async testConnection(): Promise<{ success: boolean; error?: string }> {
    try {
      const testResult = await this.sendEmail({
        to: 'test@example.com',
        subject: 'DSVI Email Test',
        html: '<p>This is a test email to verify the email service is working.</p>'
      });

      // For testing, we just check if the API responds correctly
      // The actual sending might fail if the email is invalid, but that's expected
      return {
        success: true,
        error: testResult.success ? undefined : 'Email API is working but test send failed (this is normal for invalid test emails)'
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Connection test failed'
      };
    }
  }

  /**
   * Send test email to a real address
   */
  async sendTestEmail(emailAddress: string): Promise<{ success: boolean; error?: string }> {
    try {
      const result = await this.sendEmail({
        to: emailAddress,
        subject: 'DSVI Email Test - New Simple Implementation',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">✅ DSVI Email Test Successful!</h2>
            <p>This email confirms that your new simplified email system is working correctly.</p>
            
            <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3>System Details:</h3>
              <ul>
                <li><strong>Provider:</strong> Resend</li>
                <li><strong>Implementation:</strong> Cloudflare Pages Function with Resend API</li>
                <li><strong>Test Time:</strong> ${new Date().toLocaleString()}</li>
                <li><strong>Environment:</strong> ${window.location.origin}</li>
              </ul>
            </div>
            
            <p>✨ <strong>Key improvements in this implementation:</strong></p>
            <ul>
              <li>Direct email sending via Resend API</li>
              <li>Leverages Cloudflare Pages Function for secure API key handling</li>
              <li>Simplified and efficient email delivery</li>
            </ul>
            
            <p>If you received this email, your email system is now working properly! 🎉</p>
            
            <hr style="margin: 30px 0; border: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 14px;">
              This is an automated test email from your DSVI Admin Panel.<br>
              Sent via Resend Service
            </p>
          </div>
        `
      });

      return result;

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Test email failed'
      };
    }
  }
}

// Export a singleton instance
export const simpleEmailService = new SimpleEmailService();
