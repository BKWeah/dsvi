import { supabase } from '@/integrations/supabase/client';
import { emailService } from './email-service';
import { messagingService } from './messaging-service';
import { AutomatedMessaging, TriggerType, TemplateVariables } from './messaging-types';

/**
 * Automated Messaging Service
 * Handles scheduled and triggered messaging
 */
export class AutomatedMessagingService {
  
  /**
   * Process all automated messaging triggers
   */
  async processAutomatedMessages(): Promise<number> {
    try {
      let processedCount = 0;
      
      // Process subscription expiry warnings
      processedCount += await this.processSubscriptionExpiryWarnings();
      
      // Process payment overdue notifications
      processedCount += await this.processPaymentOverdueNotifications();
      
      // Process welcome messages for new schools
      processedCount += await this.processWelcomeMessages();
      
      console.log(`Processed ${processedCount} automated messages`);
      return processedCount;
    } catch (error) {
      console.error('Failed to process automated messages:', error);
      return 0;
    }
  }
  /**
   * Process subscription expiry warnings (14, 7, 1 days before)
   */
  private async processSubscriptionExpiryWarnings(): Promise<number> {
    try {
      let processedCount = 0;
      
      // Get active automation rules for expiry warnings
      const { data: automations } = await supabase
        .from('automated_messaging')
        .select(`
          *,
          template:message_templates(*)
        `)
        .eq('trigger_type', 'subscription_expiry')
        .eq('is_active', true);

      if (!automations) return 0;

      for (const automation of automations) {
        const triggerDays = automation.trigger_days_before || 14;
        
        // Find schools that need warnings
        const targetDate = new Date();
        targetDate.setDate(targetDate.getDate() + triggerDays);
        
        const { data: schools } = await supabase
          .from('schools')
          .select(`
            id, name, subscription_end, contact_info
          `)
          .eq('subscription_end', targetDate.toISOString().split('T')[0])
          .eq('subscription_status', 'active');

        if (!schools?.length) continue;

        for (const school of schools) {
          // Prepare template variables
          const variables: TemplateVariables = {
            school_name: school.name,
            days_until_expiry: triggerDays,
            expiry_date: school.subscription_end,
            package_type: school.contact_info?.package_type || 'Standard'
          };

          // Send the message
          await this.sendAutomatedMessage(
            automation.template,
            school.contact_info?.email,
            school.name,
            school.id,
            variables
          );

          processedCount++;
        }
      }
      
      return processedCount;
    } catch (error) {
      console.error('Failed to process expiry warnings:', error);
      return 0;
    }
  }
  /**
   * Process payment overdue notifications
   */
  private async processPaymentOverdueNotifications(): Promise<number> {
    // Implementation for payment overdue logic
    return 0;
  }

  /**
   * Process welcome messages for new schools
   */
  private async processWelcomeMessages(): Promise<number> {
    // Implementation for welcome message logic
    return 0;
  }

  /**
   * Send an automated message
   */
  private async sendAutomatedMessage(
    template: any,
    email: string,
    name: string,
    schoolId: string,
    variables: TemplateVariables
  ): Promise<void> {
    try {
      // Replace template variables in subject and body
      const subject = this.replaceTemplateVariables(template.subject, variables);
      const body = this.replaceTemplateVariables(template.body, variables);

      // Use messaging service to send
      await messagingService.sendMessage({
        subject,
        body,
        template_id: template.id,
        recipients: {
          external_emails: [{
            email,
            name
          }]
        }
      });
    } catch (error) {
      console.error('Failed to send automated message:', error);
    }
  }

  /**
   * Replace template variables in text
   */
  private replaceTemplateVariables(text: string, variables: TemplateVariables): string {
    let result = text;
    
    Object.entries(variables).forEach(([key, value]) => {
      const placeholder = `{{${key}}}`;
      result = result.replace(new RegExp(placeholder, 'g'), String(value));
    });
    
    return result;
  }
}

// Singleton instance
export const automatedMessagingService = new AutomatedMessagingService();
