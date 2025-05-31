import { supabase } from '@/integrations/supabase/client';
import { 
  School, 
  SubscriptionHistory, 
  SubscriptionStats, 
  CreateSchoolWithSubscription,
  UpdateSubscription,
  RenewSubscription,
  PackageType,
  SubscriptionStatus,
  PACKAGE_CONFIGS
} from './subscription-types';

/**
 * Calculate subscription status based on end date
 */
export function calculateSubscriptionStatus(endDate: string | null): SubscriptionStatus {
  if (!endDate) return 'inactive';
  
  const end = new Date(endDate);
  const now = new Date();
  const daysUntilExpiry = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  
  if (daysUntilExpiry < 0) {
    return 'inactive';
  } else if (daysUntilExpiry <= 14) {
    return 'expiring';
  } else {
    return 'active';
  }
}

/**
 * Get subscription statistics
 */
export async function getSubscriptionStats(): Promise<SubscriptionStats | null> {
  try {
    const { data, error } = await supabase.rpc('get_subscription_stats');
    
    if (error) throw error;
    return data?.[0] || null;
  } catch (error) {
    console.error('Error fetching subscription stats:', error);
    return null;
  }
}

/**
 * Format days until expiry into human readable text
 */
export function formatDaysUntilExpiry(endDate: string | null): string {
  if (!endDate) return 'No expiry date';
  
  const end = new Date(endDate);
  const now = new Date();
  const daysUntilExpiry = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  
  if (daysUntilExpiry < 0) {
    return `Expired ${Math.abs(daysUntilExpiry)} days ago`;
  } else if (daysUntilExpiry === 0) {
    return 'Expires today';
  } else if (daysUntilExpiry === 1) {
    return 'Expires tomorrow';
  } else {
    return `Expires in ${daysUntilExpiry} days`;
  }
}
