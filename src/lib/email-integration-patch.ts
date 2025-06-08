/**
 * Integration patch for existing email-service.ts
 * This replaces the complex Brevo implementation with the simple one
 */

import { simpleEmailService } from './simple-email-service';

// Add this import to the top of email-service.ts:
// import { simpleEmailService } from './simple-email-service';

// Replace the complex Brevo case in sendMessage method with this:
export const simplifiedBrevoSender = async (message: any, recipients: any[], config: any) => {
  try {
    // Convert recipients to simple format
    const emailRecipients = recipients.map(r => ({
      email: r.recipient_email,
      name: r.recipient_name || undefined
    }));
    
    // Send email using simple service
    const result = await simpleEmailService.sendEmail({
      to: emailRecipients,
      subject: message.subject,
      html: message.body,
      from: {
        email: config.from_email,
        name: config.from_name
      }
    });
    
    // Return in expected format
    return {
      message_id: message.id,
      total_recipients: recipients.length,
      status: result.success ? 'success' : 'failed',
      delivery_provider: 'brevo-simple',
      delivery_id: result.messageId,
      errors: result.success ? undefined : [result.error || 'Unknown error']
    };
    
  } catch (error) {
    console.error('Simple Brevo sender failed:', error);
    return {
      message_id: message.id,
      total_recipients: recipients.length,
      status: 'failed',
      delivery_provider: 'brevo-simple',
      errors: [error instanceof Error ? error.message : 'Unknown error']
    };
  }
};

// Test connection using simple service
export const simpleBrevoTestConnection = async (config: any) => {
  try {
    const result = await simpleEmailService.testConnection();
    return result.success;
  } catch (error) {
    console.error('Simple Brevo connection test failed:', error);
    return false;
  }
};
