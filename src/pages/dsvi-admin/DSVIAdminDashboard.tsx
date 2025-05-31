import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  School, 
  Users, 
  AlertCircle, 
  TrendingUp, 
  Package, 
  Calendar,
  DollarSign,
  Clock
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';

interface DashboardStats {
  totalSchools: number;
  activeSchools: number;
  expiringSchools: number;
  inactiveSchools: number;
  pendingRequests: number;
  standardPackages: number;
  advancedPackages: number;
  totalRevenue: number;
}

interface RecentActivity {
  id: string;
  school_name: string;
  action: string;
  created_at: string;
}

export default function DSVIAdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalSchools: 0,
    activeSchools: 0,
    expiringSchools: 0,
    inactiveSchools: 0,
    pendingRequests: 0,
    standardPackages: 0,
    advancedPackages: 0,
    totalRevenue: 0
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch school statistics
      const { data: schools, error: schoolsError } = await supabase
        .from('schools')
        .select('subscription_status, package_type');

      if (schoolsError) throw schoolsError;

      // Fetch pending requests
      const { data: requests, error: requestsError } = await supabase
        .from('school_requests')
        .select('id')
        .eq('status', 'pending');

      if (requestsError) throw requestsError;

      // Calculate statistics
      const totalSchools = schools?.length || 0;
      const activeSchools = schools?.filter(s => s.subscription_status === 'active').length || 0;
      const expiringSchools = schools?.filter(s => s.subscription_status === 'expiring').length || 0;
      const inactiveSchools = schools?.filter(s => s.subscription_status === 'inactive').length || 0;
      const standardPackages = schools?.filter(s => s.package_type === 'standard').length || 0;
      const advancedPackages = schools?.filter(s => s.package_type === 'advanced').length || 0;
      const totalRevenue = (standardPackages * 100) + (advancedPackages * 200);

      setStats({
        totalSchools,
        activeSchools,
        expiringSchools,
        inactiveSchools,
        pendingRequests: requests?.length || 0,
        standardPackages,
        advancedPackages,
        totalRevenue
      });

      // Fetch recent subscription history for activity
      const { data: history, error: historyError } = await supabase
        .from('subscription_history')
        .select('id,action,created_at,schools(name)')
        .order('created_at', { ascending: false })
        .limit(5);

      if (!historyError && history) {
        const activities = history.map(h => ({
          id: h.id,
          school_name: h.schools?.name || 'Unknown School',
          action: h.action,
          created_at: h.created_at
        }));
        setRecentActivity(activities);
      }

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch dashboard data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatActionText = (action: string) => {
    switch (action) {
      case 'created': return 'School created';
      case 'renewed': return 'Subscription renewed';
      case 'expired': return 'Subscription expired';
      case 'upgraded': return 'Package upgraded';
      case 'downgraded': return 'Package downgraded';
      default: return action;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">DSVI Admin Dashboard</h1>
        <p className="text-muted-foreground">Overview of schools and subscriptions</p>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Schools</CardTitle>
            <School className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSchools}</div>
            <p className="text-xs text-muted-foreground">
              {stats.activeSchools} active, {stats.inactiveSchools} inactive
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expiring Soon</CardTitle>
            <AlertCircle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.expiringSchools}</div>
            <p className="text-xs text-muted-foreground">
              Need renewal within 14 days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingRequests}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting approval
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Annual Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              From active subscriptions
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Subscription Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Package Distribution
            </CardTitle>
            <CardDescription>
              Breakdown of school packages
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="outline">Standard</Badge>
                <span className="text-sm">$100/year</span>
              </div>
              <div className="text-right">
                <div className="font-medium">{stats.standardPackages} schools</div>
                <div className="text-xs text-muted-foreground">
                  ${(stats.standardPackages * 100).toLocaleString()} revenue
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge className="bg-purple-100 text-purple-800">Advanced</Badge>
                <span className="text-sm">$200/year</span>
              </div>
              <div className="text-right">
                <div className="font-medium">{stats.advancedPackages} schools</div>
                <div className="text-xs text-muted-foreground">
                  ${(stats.advancedPackages * 200).toLocaleString()} revenue
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Recent Activity
            </CardTitle>
            <CardDescription>
              Latest subscription changes
            </CardDescription>
          </CardHeader>
          <CardContent>
            {recentActivity.length === 0 ? (
              <p className="text-sm text-muted-foreground">No recent activity</p>
            ) : (
              <div className="space-y-3">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-center justify-between text-sm">
                    <div>
                      <span className="font-medium">{activity.school_name}</span>
                      <span className="text-muted-foreground ml-2">
                        {formatActionText(activity.action)}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(activity.created_at).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button asChild className="w-full">
              <Link to="/dsvi-admin/schools">
                <School className="h-4 w-4 mr-2" />
                Manage Schools
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link to="/dsvi-admin/requests">
                <Users className="h-4 w-4 mr-2" />
                Review Requests ({stats.pendingRequests})
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link to="/dsvi-admin/subscriptions">
                <Calendar className="h-4 w-4 mr-2" />
                Subscription Tracker
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            {stats.expiringSchools > 0 ? (
              <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <AlertCircle className="h-4 w-4 text-yellow-600" />
                <div className="text-sm">
                  <div className="font-medium text-yellow-800">
                    {stats.expiringSchools} subscriptions expiring soon
                  </div>
                  <div className="text-yellow-600">
                    Review and send renewal reminders
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No alerts at this time</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">System Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Platform Status</span>
                <Badge className="bg-green-100 text-green-800">Operational</Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Total Schools</span>
                <span className="font-medium">{stats.totalSchools}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Active Rate</span>
                <span className="font-medium">
                  {stats.totalSchools > 0 ? Math.round((stats.activeSchools / stats.totalSchools) * 100) : 0}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
