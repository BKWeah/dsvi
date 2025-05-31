import { supabase } from '@/integrations/supabase/client';
import { 
  PackageType, 
  SubscriptionStatus, 
  SubscriptionHistory,
  RenewSubscription,
  UpdateSubscription
} from './subscription-types';

/**
 * Create school with subscription management
 */
export async function createSchoolWithSubscription(
  schoolData: {
    name: string;
    logo_url?: string;
    contact_info?: Record<string, any>;
    package_type: PackageType;
    subscription_duration_days?: number;
  }
): Promise<{ school: any; history: SubscriptionHistory } | null> {
  try {
    const slug = schoolData.name.toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '-');

    const durationDays = schoolData.subscription_duration_days || 365;
    const subscriptionStart = new Date();
    const subscriptionEnd = new Date();
    subscriptionEnd.setDate(subscriptionStart.getDate() + durationDays);

    // Create school
    const { data: school, error: schoolError } = await supabase
      .from('schools')
      .insert({
        name: schoolData.name,
        slug,
        logo_url: schoolData.logo_url,
        contact_info: schoolData.contact_info,
        package_type: schoolData.package_type,
        subscription_start: subscriptionStart.toISOString().split('T')[0],
        subscription_end: subscriptionEnd.toISOString().split('T')[0],
        subscription_status: 'active',
        auto_renewal: true,
      })
      .select()
      .single();

    if (schoolError) throw schoolError;

    // Create subscription history entry
    const { data: currentUser } = await supabase.auth.getUser();
    const { data: history, error: historyError } = await supabase
      .from('subscription_history')
      .insert({
        school_id: school.id,
        action: 'created',
        new_package: school.package_type,
        new_end_date: school.subscription_end,
        amount: school.package_type === 'advanced' ? 200 : 100,
        payment_method: 'initial_setup',
        notes: 'School created with initial subscription',
        created_by: currentUser.user?.id
      })
      .select()
      .single();

    if (historyError) throw historyError;

    return { school, history };
  } catch (error) {
    console.error('Error creating school with subscription:', error);
    return null;
  }
}

/**
 * Renew school subscription
 */
export async function renewSchoolSubscription(
  renewal: RenewSubscription
): Promise<SubscriptionHistory | null> {
  try {
    const durationDays = renewal.duration_days || 365;
    
    // Get current subscription info
    const { data: school, error: schoolError } = await supabase
      .from('schools')
      .select('subscription_end, package_type')
      .eq('id', renewal.school_id)
      .single();

    if (schoolError || !school) throw schoolError;

    // Calculate new end date
    const currentEnd = new Date(school.subscription_end || new Date());
    const newEnd = new Date(currentEnd);
    newEnd.setDate(currentEnd.getDate() + durationDays);

    // Update school subscription
    const { error: updateError } = await supabase
      .from('schools')
      .update({
        package_type: renewal.package_type || school.package_type,
        subscription_end: newEnd.toISOString().split('T')[0],
        subscription_status: 'active',
        updated_at: new Date().toISOString()
      })
      .eq('id', renewal.school_id);

    if (updateError) throw updateError;

    // Create history entry
    const { data: currentUser } = await supabase.auth.getUser();
    const { data: history, error: historyError } = await supabase
      .from('subscription_history')
      .insert({
        school_id: renewal.school_id,
        action: 'renewed',
        previous_end_date: school.subscription_end,
        new_end_date: newEnd.toISOString().split('T')[0],
        previous_package: school.package_type,
        new_package: renewal.package_type || school.package_type,
        amount: renewal.amount,
        payment_method: renewal.payment_method,
        notes: renewal.notes,
        created_by: currentUser.user?.id
      })
      .select()
      .single();

    if (historyError) throw historyError;
    return history;
  } catch (error) {
    console.error('Error renewing subscription:', error);
    return null;
  }
}

/**
 * Update subscription details
 */
export async function updateSchoolSubscription(
  schoolId: string,
  updates: UpdateSubscription
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('schools')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', schoolId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error updating subscription:', error);
    return false;
  }
}

/**
 * Get schools with expiring subscriptions
 */
export async function getExpiringSubscriptions(daysAhead: number = 14) {
  try {
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + daysAhead);

    const { data, error } = await supabase
      .from('schools')
      .select('id, name, subscription_end, package_type, contact_info')
      .lte('subscription_end', expiryDate.toISOString().split('T')[0])
      .eq('subscription_status', 'active')
      .order('subscription_end');

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching expiring subscriptions:', error);
    return [];
  }
}

/**
 * Send renewal reminder
 */
export async function sendRenewalReminder(
  schoolId: string,
  reminderType: 'expiry_warning' | 'expired' | 'renewal_success' | 'payment_overdue',
  messageContent: string
): Promise<boolean> {
  try {
    const { data: currentUser } = await supabase.auth.getUser();
    
    const { error } = await supabase
      .from('subscription_reminders')
      .insert({
        school_id: schoolId,
        reminder_type: reminderType,
        message_content: messageContent,
        sent_by: currentUser.user?.id,
        delivery_method: 'email'
      });

    if (error) throw error;

    // Update last reminder sent timestamp
    await supabase
      .from('schools')
      .update({ last_reminder_sent: new Date().toISOString() })
      .eq('id', schoolId);

    return true;
  } catch (error) {
    console.error('Error sending renewal reminder:', error);
    return false;
  }
}
