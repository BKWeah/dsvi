// Messaging System Types
export type MessageType = 'email' | 'in_app' | 'sms';
export type MessageStatus = 'pending' | 'sent' | 'delivered' | 'failed' | 'bounced';
export type DeliveryStatus = 'pending' | 'sent' | 'delivered' | 'failed' | 'bounced' | 'opened' | 'clicked';
export type TemplateType = 'welcome' | 'expiry_warning' | 'expired' | 'renewal_success' | 'payment_overdue' | 'update_alert' | 'custom';
export type RecipientType = 'school_admin' | 'dsvi_admin' | 'external';
export type EmailProvider = 'sendgrid' | 'ses' | 'resend' | 'smtp' | 'brevo';
export type TriggerType = 'subscription_expiry' | 'payment_overdue' | 'welcome' | 'renewal_success';

export interface MessageTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  template_type: TemplateType;
  variables: string[];
  is_active: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  sender_id: string;
  subject: string;
  body: string;
  message_type: MessageType;
  template_id: string | null;
  status: MessageStatus;
  scheduled_at: string | null;
  sent_at: string | null;
  delivery_provider: string | null;
  delivery_id: string | null;
  delivery_response: any;
  error_message: string | null;
  total_recipients: number;
  successful_deliveries: number;
  failed_deliveries: number;
  created_at: string;
  updated_at: string;
  // Relations
  template?: MessageTemplate;
  recipients?: MessageRecipient[];
}

// New interface for messages with relations from Supabase query
export interface MessageWithRelations extends Message {
  template?: MessageTemplate; // This is already in Message, but explicit for clarity
  recipients_count?: { count: number }[]; // Supabase returns count as an array of objects
}

export interface MessageRecipient {
  id: string;
  message_id: string;
  school_id: string | null;
  recipient_email: string;
  recipient_name: string | null;
  recipient_type: RecipientType;
  delivery_status: DeliveryStatus;
  sent_at: string | null;
  delivered_at: string | null;
  opened_at: string | null;
  clicked_at: string | null;
  bounce_reason: string | null;
  error_message: string | null;
  delivery_attempts: number;
  last_attempt_at: string | null;
  created_at: string;
  // Relations
  message?: Message;
  school?: {
    id: string;
    name: string;
  };
}

// New interface for admin school assignment query result
export interface AdminSchoolAssignmentResult {
  school: {
    id: string;
    name: string;
  } | null;
}

export interface EmailSettings {
  id: string;
  provider: EmailProvider;
  api_key: string | null;
  api_secret: string | null;
  smtp_host: string | null;
  smtp_port: number | null;
  smtp_username: string | null;
  smtp_password: string | null;
  from_email: string;
  from_name: string;
  reply_to_email: string | null;
  is_active: boolean;
  test_mode: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface AutomatedMessaging {
  id: string;
  trigger_type: TriggerType;
  template_id: string;
  trigger_days_before: number | null;
  is_active: boolean;
  last_run_at: string | null;
  next_run_at: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  // Relations
  template?: MessageTemplate;
}

export interface MessagingStats {
  total_messages: number;
  sent_messages: number;
  pending_messages: number;
  failed_messages: number;
  total_templates: number;
  active_templates: number;
}

export interface CreateMessageRequest {
  subject: string;
  body: string;
  message_type?: MessageType;
  template_id?: string;
  recipients: {
    school_ids?: string[];
    all_schools?: boolean;
    external_emails?: {
      email: string;
      name?: string;
    }[];
  };
  scheduled_at?: string;
}

export interface CreateTemplateRequest {
  name: string;
  subject: string;
  body: string;
  template_type: TemplateType;
  variables?: string[];
  is_active?: boolean;
}

export interface UpdateTemplateRequest extends Partial<CreateTemplateRequest> {
  id: string;
}

export interface SendMessageResponse {
  message_id: string;
  total_recipients: number;
  status: 'success' | 'partial' | 'failed';
  delivery_provider?: string;
  delivery_id?: string;
  errors?: string[];
}

export interface EmailConfig {
  provider: EmailProvider;
  from_email: string;
  from_name: string;
  reply_to_email?: string;
  // Provider-specific configs
  sendgrid?: {
    api_key: string;
  };
  ses?: {
    access_key_id: string;
    secret_access_key: string;
    region: string;
  };
  resend?: {
    api_key: string;
  };
  brevo?: {
    api_key: string;
  };
  smtp?: {
    host: string;
    port: number;
    username: string;
    password: string;
    secure?: boolean;
  };
}

export interface MessageFilters {
  status?: MessageStatus;
  message_type?: MessageType;
  template_id?: string;
  sender_id?: string;
  date_from?: string;
  date_to?: string;
  search?: string;
}

export interface RecipientFilters {
  delivery_status?: DeliveryStatus;
  school_id?: string;
  recipient_type?: RecipientType;
  message_id?: string;
}

// Template variable substitution
export interface TemplateVariables {
  // School-related variables
  school_name?: string;
  school_url?: string;
  admin_email?: string;
  admin_password?: string;
  admin_portal_url?: string;
  
  // Subscription-related variables
  package_type?: string;
  subscription_start?: string;
  subscription_end?: string;
  expiry_date?: string;
  days_until_expiry?: number;
  amount_paid?: string;
  new_expiry_date?: string;
  
  // System variables
  current_date?: string;
  support_email?: string;
  support_phone?: string;
  company_name?: string;
  
  // Custom variables
  [key: string]: any;
}

export const DEFAULT_TEMPLATE_VARIABLES: TemplateVariables = {
  support_email: 'support@dsvi.org',
  support_phone: '+1 (555) 123-4567',
  company_name: 'Digital School Visibility Initiative',
  admin_portal_url: window.location.origin + '/school-admin'
};

export const TEMPLATE_TYPE_LABELS: Record<TemplateType, string> = {
  welcome: 'Welcome Email',
  expiry_warning: 'Subscription Expiry Warning',
  expired: 'Subscription Expired',
  renewal_success: 'Renewal Success',
  payment_overdue: 'Payment Overdue',
  update_alert: 'System Update Alert',
  custom: 'Custom Template'
};

export const MESSAGE_STATUS_LABELS: Record<MessageStatus, string> = {
  pending: 'Pending',
  sent: 'Sent',
  delivered: 'Delivered',
  failed: 'Failed',
  bounced: 'Bounced'
};

export const DELIVERY_STATUS_LABELS: Record<DeliveryStatus, string> = {
  pending: 'Pending',
  sent: 'Sent',
  delivered: 'Delivered',
  failed: 'Failed',
  bounced: 'Bounced',
  opened: 'Opened',
  clicked: 'Clicked'
};
