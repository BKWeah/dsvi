// Subscription Management Types
export type PackageType = 'standard' | 'advanced';
export type SubscriptionStatus = 'active' | 'expiring' | 'inactive' | 'trial';
export type PaymentStatus = 'paid' | 'pending' | 'overdue';

export interface School {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  admin_user_id: string | null;
  contact_info: Record<string, any> | null;
  theme_settings: Record<string, any> | null;
  custom_css: string | null;
  theme_version: number | null;
  package_type: PackageType;
  subscription_start: string | null;
  subscription_end: string | null;
  subscription_status: SubscriptionStatus;
  last_reminder_sent: string | null;
  payment_status: PaymentStatus;
  auto_renewal: boolean;
  subscription_notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface SubscriptionHistory {
  id: string;
  school_id: string;
  action: 'created' | 'renewed' | 'expired' | 'upgraded' | 'downgraded' | 'suspended';
  previous_package: PackageType | null;
  new_package: PackageType | null;
  previous_end_date: string | null;
  new_end_date: string | null;
  amount: number | null;
  payment_method: string | null;
  notes: string | null;
  created_by: string | null;
  created_at: string;
}

export interface SubscriptionReminder {
  id: string;
  school_id: string;
  reminder_type: 'expiry_warning' | 'expired' | 'renewal_success' | 'payment_overdue';
  sent_at: string;
  sent_by: string | null;
  message_content: string | null;
  delivery_method: 'email' | 'in_app' | 'sms';
}

export interface SubscriptionStats {
  total_schools: number;
  active_subscriptions: number;
  expiring_subscriptions: number;
  inactive_subscriptions: number;
  standard_packages: number;
  advanced_packages: number;
}

export interface PackageDetails {
  type: PackageType;
  name: string;
  price: number;
  duration: number; // days
  features: string[];
  description: string;
}

export const PACKAGE_CONFIGS: Record<PackageType, PackageDetails> = {
  standard: {
    type: 'standard',
    name: 'Standard Package',
    price: 100,
    duration: 365, // 1 year
    features: [
      'Basic website template',
      'Up to 5 pages',
      'Basic customization',
      'Email support',
      'Mobile responsive design'
    ],
    description: 'Perfect for small schools getting started with their digital presence'
  },
  advanced: {
    type: 'advanced',
    name: 'Advanced Package',
    price: 200,
    duration: 365, // 1 year
    features: [
      'Premium website templates',
      'Unlimited pages',
      'Advanced customization',
      'Priority support',
      'Mobile responsive design',
      'SEO optimization',
      'Analytics dashboard',
      'Custom domain support'
    ],
    description: 'Comprehensive solution for schools that want advanced features and customization'
  }
};

export interface CreateSchoolWithSubscription {
  name: string;
  slug?: string;
  logo_url?: string;
  contact_info?: Record<string, any>;
  package_type: PackageType;
  subscription_duration_days?: number;
  admin_email?: string;
  payment_amount?: number;
  payment_method?: string;
  notes?: string;
}

export interface UpdateSubscription {
  package_type?: PackageType;
  subscription_end?: string;
  subscription_status?: SubscriptionStatus;
  payment_status?: PaymentStatus;
  auto_renewal?: boolean;
  subscription_notes?: string;
}

export interface RenewSubscription {
  school_id: string;
  package_type?: PackageType;
  duration_days?: number;
  amount?: number;
  payment_method?: string;
  notes?: string;
}
