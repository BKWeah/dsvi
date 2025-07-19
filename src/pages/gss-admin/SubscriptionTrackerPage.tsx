import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Package, DollarSign, Clock, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

interface School {
  id: string;
  name: string;
  package_type: string;
  subscription_start: string;
  subscription_end: string;
  subscription_status: string;
  auto_renewal: boolean;
  subscription_notes: string | null;
}

interface SubscriptionStats {
  total_schools: number;
  active_subscriptions: number;
  expiring_subscriptions: number;
  inactive_subscriptions: number;
  standard_packages: number;
  advanced_packages: number;
}

export default function SubscriptionTrackerPage() {
  const [schools, setSchools] = useState<School[]>([]);
  const [stats, setStats] = useState<SubscriptionStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null);
  const [showRenewDialog, setShowRenewDialog] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch schools with subscription info
      const { data: schoolsData, error: schoolsError } = await supabase
        .from('schools')
        .select('id,name,package_type,subscription_start,subscription_end,subscription_status,auto_renewal,subscription_notes')
        .order('subscription_end', { ascending: true });

      if (schoolsError) throw schoolsError;
      setSchools(schoolsData || []);

      // Fetch subscription statistics
      const { data: statsData, error: statsError } = await supabase
        .rpc('get_subscription_stats');
      
      if (statsError) {
        console.warn('Stats function not available yet, calculating manually');
        // Calculate stats manually if function doesn't exist
        const manualStats = calculateStats(schoolsData || []);
        setStats(manualStats);
      } else {
        setStats(statsData?.[0] || null);
      }
    } catch (error) {
      console.error('Error fetching subscription data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch subscription data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (schoolsData: School[]): SubscriptionStats => {
    return {
      total_schools: schoolsData.length,
      active_subscriptions: schoolsData.filter(s => s.subscription_status === 'active').length,
      expiring_subscriptions: schoolsData.filter(s => s.subscription_status === 'expiring').length,
      inactive_subscriptions: schoolsData.filter(s => s.subscription_status === 'inactive').length,
      standard_packages: schoolsData.filter(s => s.package_type === 'standard').length,
      advanced_packages: schoolsData.filter(s => s.package_type === 'advanced').length,
    };
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case 'expiring':
        return <Badge className="bg-yellow-100 text-yellow-800">Expiring Soon</Badge>;
      case 'inactive':
        return <Badge className="bg-red-100 text-red-800">Inactive</Badge>;
      case 'trial':
        return <Badge className="bg-blue-100 text-blue-800">Trial</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getPackageBadge = (packageType: string) => {
    switch (packageType) {
      case 'advanced':
        return <Badge className="bg-purple-100 text-purple-800">Advanced</Badge>;
      case 'standard':
      default:
        return <Badge variant="outline">Standard</Badge>;
    }
  };

  const formatDaysUntilExpiry = (endDate: string) => {
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
  };

  const filteredSchools = schools.filter(school => {
    const matchesSearch = school.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || school.subscription_status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleRenewSubscription = async (school: School) => {
    try {
      const today = new Date();
      const newStart = today.toISOString().split('T')[0];
      const newEnd = new Date(today);
      newEnd.setFullYear(today.getFullYear() + 1);

      const { error } = await supabase
        .from('schools')
        .update({
          subscription_start: newStart,
          subscription_end: newEnd.toISOString().split('T')[0],
          subscription_status: 'active'
        })
        .eq('id', school.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Subscription renewed for ${school.name}`,
      });

      fetchData();
      setShowRenewDialog(false);
    } catch (error) {
      console.error('Error renewing subscription:', error);
      toast({
        title: "Error",
        description: "Failed to renew subscription",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Subscription Tracker</h1>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Subscription Tracker</h1>
        <p className="text-muted-foreground">Monitor and manage school subscriptions</p>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Schools</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_schools}</div>
              <p className="text-xs text-muted-foreground">
                {stats.standard_packages} Standard, {stats.advanced_packages} Advanced
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.active_subscriptions}</div>
              <p className="text-xs text-muted-foreground">
                {Math.round((stats.active_subscriptions / stats.total_schools) * 100)}% of total
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Expiring Soon</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.expiring_subscriptions}</div>
              <p className="text-xs text-muted-foreground">
                Need renewal within 14 days
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search schools..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="expiring">Expiring Soon</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
            <SelectItem value="trial">Trial</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Subscriptions Table */}
      <Card>
        <CardHeader>
          <CardTitle>School Subscriptions</CardTitle>
          <CardDescription>
            {filteredSchools.length} schools found
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>School Name</TableHead>
                <TableHead>Package</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>End Date</TableHead>
                <TableHead>Days Until Expiry</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSchools.map((school) => (
                <TableRow key={school.id}>
                  <TableCell className="font-medium">{school.name}</TableCell>
                  <TableCell>{getPackageBadge(school.package_type)}</TableCell>
                  <TableCell>{getStatusBadge(school.subscription_status)}</TableCell>
                  <TableCell>
                    {new Date(school.subscription_start).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {new Date(school.subscription_end).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <span className={
                      school.subscription_status === 'expiring' ? 'text-yellow-600 font-medium' :
                      school.subscription_status === 'inactive' ? 'text-red-600 font-medium' :
                      'text-muted-foreground'
                    }>
                      {formatDaysUntilExpiry(school.subscription_end)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedSchool(school);
                        setShowRenewDialog(true);
                      }}
                    >
                      Renew
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Renewal Dialog */}
      <Dialog open={showRenewDialog} onOpenChange={setShowRenewDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Renew Subscription</DialogTitle>
            <DialogDescription>
              Renew subscription for {selectedSchool?.name}
            </DialogDescription>
          </DialogHeader>
          {selectedSchool && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Current Package</Label>
                  <div className="mt-1">{getPackageBadge(selectedSchool.package_type)}</div>
                </div>
                <div>
                  <Label>Current Status</Label>
                  <div className="mt-1">{getStatusBadge(selectedSchool.subscription_status)}</div>
                </div>
              </div>
              <div>
                <Label>Current End Date</Label>
                <p className="text-sm text-muted-foreground mt-1">
                  {new Date(selectedSchool.subscription_end).toLocaleDateString()}
                </p>
              </div>
              <div>
                <Label>New Start Date</Label>
                <p className="text-sm text-muted-foreground mt-1">
                  {new Date().toLocaleDateString()}
                </p>
              </div>
              <div>
                <Label>New End Date</Label>
                <p className="text-sm text-muted-foreground mt-1">
                  {new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toLocaleDateString()}
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRenewDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={() => selectedSchool && handleRenewSubscription(selectedSchool)}
              className="bg-green-600 hover:bg-green-700"
            >
              Renew for 1 Year
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
