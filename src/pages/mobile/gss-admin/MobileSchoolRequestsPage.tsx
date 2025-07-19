import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { CheckCircle, XCircle, Clock, Search, Filter } from 'lucide-react';
import { MobileCard } from '@/components/mobile/MobileCard';
import { useToast } from '@/hooks/use-toast';

interface SchoolRequest {
  id: string;
  school_name: string;
  contact_name: string;
  contact_email: string;
  phone?: string;
  school_type?: string;
  student_count?: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  message?: string;
}

export default function MobileSchoolRequestsPage() {
  const [requests, setRequests] = useState<SchoolRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<SchoolRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const { toast } = useToast();

  useEffect(() => {
    fetchRequests();
  }, []);

  useEffect(() => {
    let filtered = requests;
    
    if (searchQuery) {
      filtered = filtered.filter(request =>
        request.school_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        request.contact_name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    if (statusFilter !== 'all') {
      filtered = filtered.filter(request => request.status === statusFilter);
    }
    
    setFilteredRequests(filtered);
  }, [requests, searchQuery, statusFilter]);

  const fetchRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('school_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRequests(data || []);
    } catch (error) {
      console.error('Error fetching requests:', error);
      toast({
        title: "Error",
        description: "Failed to fetch school requests",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateRequestStatus = async (id: string, status: 'approved' | 'rejected') => {
    try {
      const { error } = await supabase
        .from('school_requests')
        .update({ status })
        .eq('id', id);

      if (error) throw error;
      
      await fetchRequests();
      toast({
        title: "Success",
        description: `Request ${status} successfully`,
      });
    } catch (error) {
      console.error('Error updating request:', error);
      toast({
        title: "Error",
        description: "Failed to update request",
        variant: "destructive",
      });
    }
  };
