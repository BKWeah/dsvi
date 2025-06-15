import { supabase } from '@/integrations/supabase/client';
import { simpleEmailService } from './simple-email-service';
import { 
  EmailConfig, 
  SendMessageResponse, 
  Message, 
  MessageRecipient,
  EmailProvider,
  EmailSettings,
  AutomatedMessaging,
  TriggerType
} from './messaging-types';
import {
  MessageTemplate,
  CreateMessageRequest,
  CreateTemplateRequest,
  UpdateTemplateRequest,
  TemplateVariables,
  DEFAULT_TEMPLATE_VARIABLES,
  MessagingStats,
  MessageFilters,
  MessageType, // Import MessageType
  MessageStatus, // Import MessageStatus
  RecipientType, // Import RecipientType
  TemplateType, // Import TemplateType
  DeliveryStatus, // Import DeliveryStatus
  MessageWithRelations, // Import MessageWithRelations
  AdminSchoolAssignmentResult // Import AdminSchoolAssignmentResult
} from './messaging-types';

/**
 * Messaging Service - Simplified
 */
export class MessagingService {
  /**
   * Get all message templates
   */
  async getTemplates(): Promise<MessageTemplate[]> {
    const { data, error } = await supabase
      .from('message_templates')
      .select('*')
      .order('name');

    if (error) throw error;
    // Add type assertion for template_type and variables
    return data.map(template => ({
      ...template,
      template_type: template.template_type as TemplateType,
      variables: (template.variables || []) as string[] // Ensure variables is an array of strings
    })) || [];
  }

  /**
   * Get active message templates
   */
  async getActiveTemplates(): Promise<MessageTemplate[]> {
    const { data, error } = await supabase
      .from('message_templates')
      .select('*')
      .eq('is_active', true)
      .order('name');

    if (error) throw error;
    // Add type assertion for template_type and variables
    return data.map(template => ({
      ...template,
      template_type: template.template_type as TemplateType,
      variables: (template.variables || []) as string[] // Ensure variables is an array of strings
    })) || [];
  }

  /**
   * Create new message template
   */
  async createTemplate(template: CreateTemplateRequest): Promise<MessageTemplate> {
    const { data: currentUser } = await supabase.auth.getUser();
    
    const { data, error } = await supabase
      .from('message_templates')
      .insert({
        ...template,
        variables: template.variables || [],
        is_active: template.is_active !== false,
        created_by: currentUser.user?.id
      })
      .select()
      .single();

    if (error) throw error;
    // Add type assertion for template_type and variables
    return {
      ...data,
      template_type: data.template_type as TemplateType,
      variables: (data.variables || []) as string[] // Ensure variables is an array of strings
    };
  }

  /**
   * Update message template
   */
  async updateTemplate(update: UpdateTemplateRequest): Promise<MessageTemplate> {
    const { id, ...updateData } = update;
    
    const { data, error } = await supabase
      .from('message_templates')
      .update({
        ...updateData,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    // Add type assertion for template_type and variables
    return {
      ...data,
      template_type: data.template_type as TemplateType,
      variables: (data.variables || []) as string[] // Ensure variables is an array of strings
    };
  }

  /**
   * Delete message template
   */
  async deleteTemplate(templateId: string): Promise<void> {
    const { error } = await supabase
      .from('message_templates')
      .delete()
      .eq('id', templateId);

    if (error) throw error;
  }

  /**
   * Get messaging statistics
   */
  async getStats(): Promise<MessagingStats> {
    try {
      const { data, error } = await supabase.rpc('get_messaging_stats');
      if (error) throw error;
      
      return data?.[0] || {
        total_messages: 0,
        sent_messages: 0,
        pending_messages: 0,
        failed_messages: 0,
        total_templates: 0,
        active_templates: 0
      };
    } catch (error) {
      console.error('Failed to get messaging stats:', error);
      return {
        total_messages: 0,
        sent_messages: 0,
        pending_messages: 0,
        failed_messages: 0,
        total_templates: 0,
        active_templates: 0
      };
    }
  }

  /**
   * Get message history with filters
   */
  async getMessages(limit: number = 50, offset: number = 0, filters?: MessageFilters): Promise<Message[]> {
    let query = supabase
      .from('messages')
      .select(`
        id, sender_id, subject, body, message_type, template_id, status, scheduled_at, sent_at,
        delivery_provider, delivery_id, delivery_response, error_message, total_recipients,
        successful_deliveries, failed_deliveries, created_at, updated_at,
        template:message_templates(id, name, subject, body, template_type, variables, is_active, created_by, created_at, updated_at),
        recipients_count:message_recipients(count)
      `)
      .order('created_at', { ascending: false });

    // Apply filters
    if (filters?.status) {
      query = query.eq('status', filters.status);
    }
    if (filters?.search) {
      query = query.ilike('subject', `%${filters.search}%`);
    }

    query = query.range(offset, offset + limit - 1);

    const { data, error } = await query;
    if (error) throw error;

    // Explicitly cast data to MessageWithRelations[]
    const messagesWithRelations: MessageWithRelations[] = data as MessageWithRelations[];

    return messagesWithRelations.map(message => ({
      ...message,
      message_type: message.message_type as MessageType,
      status: message.status as MessageStatus,
      template: message.template ? { 
        ...message.template, 
        template_type: message.template.template_type as TemplateType,
        variables: (message.template.variables || []) as string[]
      } : undefined,
      // Extract the count from recipients_count array
      total_recipients: message.recipients_count?.[0]?.count || message.total_recipients,
      recipients: message.recipients || []
    })) || [];
  }

  /**
   * Get message count with filters
   */
  async getMessageCount(filters?: MessageFilters): Promise<number> {
    let query = supabase
      .from('messages')
      .select('id', { count: 'exact', head: true });

    // Apply filters
    if (filters?.status) {
      query = query.eq('status', filters.status);
    }
    if (filters?.search) {
      query = query.ilike('subject', `%${filters.search}%`);
    }

    const { count, error } = await query;
    if (error) throw error;
    return count || 0;
  }

  /**
   * Get message recipients
   */
  async getMessageRecipients(messageId: string): Promise<MessageRecipient[]> {
    const { data, error } = await supabase
      .from('message_recipients')
      .select(`
        *,
        school:schools(id, name)
      `)
      .eq('message_id', messageId)
      .order('created_at');

    if (error) throw error;
    // Add type assertion for recipient_type and delivery_status
    return data.map(recipient => ({
      ...recipient,
      recipient_type: recipient.recipient_type as RecipientType,
      delivery_status: recipient.delivery_status as DeliveryStatus,
    })) || [];
  }

  /**
   * Get schools that the current user can message (Level-based restrictions)
   */
  async getAccessibleSchools(): Promise<Array<{id: string, name: string}>> {
    try {
      const { data: currentUser } = await supabase.auth.getUser();
      if (!currentUser.user) throw new Error('Not authenticated');

      const userRole = currentUser.user.user_metadata?.role;

      if (userRole === 'DSVI_ADMIN') {
        // Level 1 Admins can message all schools
        const { data, error } = await supabase
          .from('schools')
          .select('id, name')
          .order('name');

        if (error) {
          console.error('Error fetching schools for DSVI admin:', error);
          throw error;
        }
        return data || [];
      } else if (userRole === 'SCHOOL_ADMIN') {
        // Level 2 Admins can only message their assigned schools
        try {
          // First try the assignment table
          const { data, error } = await supabase
            .from('admin_school_assignments' as any)
            .select(`
              school:schools(id, name)
            `)
            .eq('school_admin_id', currentUser.user.id);

          if (error) {
            console.error('Error with admin_school_assignments:', error);
            throw error;
          }

          // Explicitly cast data to AdminSchoolAssignmentResult[]
          const assignments: AdminSchoolAssignmentResult[] = data as unknown as AdminSchoolAssignmentResult[];
          const schools = assignments.map(item => item.school).filter((school): school is { id: string; name: string } => Boolean(school));
          
          if (schools.length === 0) {
            // Fallback: get schools where this user is the admin
            const { data: fallbackData, error: fallbackError } = await supabase
              .from('schools')
              .select('id, name')
              .eq('admin_user_id', currentUser.user.id)
              .order('name');
            
            if (fallbackError) throw fallbackError;
            return fallbackData || [];
          }
          
          return schools;
        } catch (assignmentError) {
          console.error('Assignment error, using fallback:', assignmentError);
          // Fallback: get schools where this user is the admin
          const { data: fallbackData, error: fallbackError } = await supabase
            .from('schools')
            .select('id, name')
            .eq('admin_user_id', currentUser.user.id)
            .order('name');
          
          if (fallbackError) throw fallbackError;
          return fallbackData || [];
        }
      }

      return [];
    } catch (error) {
      console.error('Failed to get accessible schools:', error);
      throw error;
    }
  }

  /**
   * Send message - SIMPLIFIED VERSION
   * Send email first, then save to database
   */
  async sendMessage(request: CreateMessageRequest): Promise<SendMessageResponse> {
    try {
      console.log('📧 Simplified sendMessage called with:', request);
      const { data: currentUser } = await supabase.auth.getUser();
      if (!currentUser.user) throw new Error('Not authenticated');

      // Build recipient email list in the format expected by the Cloudflare Pages Function
      let emailRecipients: Array<{
        recipient_type: RecipientType;
        recipient_email?: string;
        recipient_name?: string;
        school_id?: string;
      }> = [];

      // Add external emails directly
      if (request.recipients.external_emails) {
        for (const external of request.recipients.external_emails) {
          if (external.email && external.email.trim()) {
            emailRecipients.push({
              recipient_type: 'external',
              recipient_email: external.email.trim(),
              recipient_name: external.name || undefined
            });
          }
        }
      }

      // Handle school recipients - send school_ids to the API for resolution
      if (request.recipients.school_ids) {
        for (const schoolId of request.recipients.school_ids) {
          emailRecipients.push({
            recipient_type: 'school_admin',
            school_id: schoolId
          });
        }
      }
      if (request.recipients.all_schools) {
        // If all schools are selected, we need to fetch their IDs to send to the API
        // The API will then resolve their admin emails
        const accessibleSchools = await this.getAccessibleSchools();
        for (const school of accessibleSchools) {
          emailRecipients.push({
            recipient_type: 'school_admin',
            school_id: school.id
          });
        }
      }

      console.log('📧 Final email recipients:', emailRecipients);

      if (emailRecipients.length === 0) {
        throw new Error('No valid email recipients found. Please check that selected schools have admin emails configured and external emails are valid.');
      }

      // Resolve template variables if any
      let finalSubject = request.subject;
      let finalBody = request.body;

      // Basic template variable resolution (you can make this more sophisticated)
      const currentDate = new Date().toLocaleDateString();
      const replacements = {
        '{{update_type}}': 'System Update',
        '{{update_details}}': 'Please check your admin dashboard for the latest updates.',
        '{{school_name}}': 'Your School',
        '{{admin_name}}': 'Administrator',
        '{{date}}': currentDate
      };

      Object.entries(replacements).forEach(([placeholder, value]) => {
        finalSubject = finalSubject.replace(new RegExp(placeholder.replace(/[{}]/g, '\\$&'), 'g'), value);
        finalBody = finalBody.replace(new RegExp(placeholder.replace(/[{}]/g, '\\$&'), 'g'), value);
      });

      console.log('📧 Sending email with resolved content:', {
        subject: finalSubject,
        bodyLength: finalBody.length,
        recipientCount: emailRecipients.length
      });

      // Send email directly using the same service that works in tests
      const emailResult = await simpleEmailService.sendEmail({
        to: emailRecipients,
        subject: finalSubject,
        html: finalBody,
        from: {
          email: 'onboarding@libdsvi.com',
          name: 'DSVI Team'
        }
      });

      console.log('📧 Email result:', emailResult);

      if (!emailResult.success) {
        throw new Error(emailResult.error || 'Email sending failed');
      }

      // Save to database AFTER successful email sending
      const { data: messageData, error: messageError } = await supabase
        .from('messages')
        .insert({
          sender_id: currentUser.user.id,
          subject: finalSubject,
          body: finalBody,
          message_type: 'email',
          template_id: request.template_id || null,
          status: 'sent',
          sent_at: new Date().toISOString(),
          delivery_provider: 'resend',
          delivery_id: emailResult.messageId,
          total_recipients: emailRecipients.length,
          successful_deliveries: emailRecipients.length,
          failed_deliveries: 0
        })
        .select()
        .single();

      if (messageError) {
        console.warn('Failed to save message to database:', messageError);
        // Don't throw here since email was sent successfully
      }

      // Save recipients to database
      if (messageData) {
        const recipientRecords = emailRecipients.map(recipient => ({
          message_id: messageData.id,
          recipient_email: recipient.recipient_email || null,
          recipient_name: recipient.recipient_name || null,
          recipient_type: recipient.recipient_type,
          school_id: recipient.school_id || null, // Add school_id
          delivery_status: 'sent' as const,
          sent_at: new Date().toISOString()
        }));

        const { error: recipientError } = await supabase
          .from('message_recipients')
          .insert(recipientRecords);

        if (recipientError) {
          console.warn('Failed to save recipients to database:', recipientError);
        }
      }

      console.log('📧 Message sent and saved successfully!');

      return {
        message_id: messageData?.id || 'unknown',
        total_recipients: emailRecipients.length,
        status: 'success',
        delivery_provider: 'resend',
        delivery_id: emailResult.messageId
      };

    } catch (error) {
      console.error('📧 Failed to send message:', error);
      throw error;
    }
  }

  /**
   * Create default templates if none exist
   */
  async createDefaultTemplates(): Promise<void> {
    try {
      const existingTemplates = await this.getTemplates();
      if (existingTemplates.length > 0) {
        return; // Templates already exist
      }

      const defaultTemplates = [
        {
          name: 'Welcome Email',
          subject: 'Welcome to DSVI - Your School Website is Ready!',
          body: `Hello {{school_name}},

Welcome to the Digital School Visibility Initiative! We're excited to have you on board.

Your school website has been successfully created and is now live.

Next Steps:
1. Log in to your admin portal
2. Customize your school's content and branding
3. Add your school's information and photos

If you need any assistance, please don't hesitate to contact our support team.

Best regards,
The DSVI Team`,
          template_type: 'welcome' as const,
          variables: ['school_name']
        },
        {
          name: 'General Announcement',
          subject: 'Important Update from DSVI',
          body: `Hello {{school_name}},

We hope this message finds you well.

{{announcement_content}}

If you have any questions, please feel free to contact us.

Best regards,
The DSVI Team`,
          template_type: 'custom' as const,
          variables: ['school_name', 'announcement_content']
        },
        {
          name: 'Meeting Invitation',
          subject: 'Invitation: {{meeting_topic}} - {{meeting_date}}',
          body: `Hello {{school_name}},

You are invited to attend a meeting regarding {{meeting_topic}}.

Meeting Details:
- Date: {{meeting_date}}
- Time: {{meeting_time}}
- Location: {{meeting_location}}

Please confirm your attendance by replying to this email.

Best regards,
The DSVI Team`,
          template_type: 'custom' as const,
          variables: ['school_name', 'meeting_topic', 'meeting_date', 'meeting_time', 'meeting_location']
        }
      ];

      for (const template of defaultTemplates) {
        await this.createTemplate(template);
      }

      console.log('Default templates created successfully');
    } catch (error) {
      console.error('Failed to create default templates:', error);
    }
  }
}

// Singleton instance
export const messagingService = new MessagingService();
