import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { CheckCircle, XCircle, Eye, Calendar, School, Mail, Phone, MapPin } from 'lucide-react';

interface SchoolRequest {
  id: string;
  school_name: string;
  contact_name: string;
  contact_email: string;
  phone: string | null;
  address: string | null;
  school_type: string | null;
  student_count: string | null;
  website: string | null;
  message: string | null;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
  reviewed_by: string | null;
  reviewed_at: string | null;
  admin_notes: string | null;
}

export default function SchoolRequestsPage() {
  const [requests, setRequests] = useState<SchoolRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<SchoolRequest | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('school_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setRequests(data || []);
    } catch (error) {
      console.error('Error fetching requests:', error);
      toast({
        title: "Error",
        description: "Failed to fetch school requests.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (request: SchoolRequest) => {
    setIsProcessing(true);
    
    try {
      // First, create the school
      const schoolSlug = request.school_name.toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .replace(/\s+/g, '-');

      const { data: schoolData, error: schoolError } = await supabase
        .from('schools')
        .insert({
          name: request.school_name,
          slug: schoolSlug,
          contact_info: {
            email: request.contact_email,
            phone: request.phone,
            address: request.address
          }
        })
        .select()
        .single();

      if (schoolError) {
        throw schoolError;
      }

      // Update the request status
      const { error: updateError } = await supabase
        .from('school_requests')
        .update({
          status: 'approved',
          admin_notes: adminNotes,
          reviewed_at: new Date().toISOString(),
          reviewed_by: (await supabase.auth.getUser()).data.user?.id
        })
        .eq('id', request.id);
      if (updateError) {
        throw updateError;
      }

      toast({
        title: "School Request Approved!",
        description: `School "${request.school_name}" has been created successfully. You can now invite a school administrator.`,
      });

      fetchRequests();
      setSelectedRequest(null);
      setAdminNotes('');
      
    } catch (error) {
      console.error('Error approving request:', error);
      toast({
        title: "Error",
        description: "Failed to approve school request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async (request: SchoolRequest) => {
    setIsProcessing(true);
    
    try {
      const { error } = await supabase
        .from('school_requests')
        .update({
          status: 'rejected',
          admin_notes: adminNotes,
          reviewed_at: new Date().toISOString(),
          reviewed_by: (await supabase.auth.getUser()).data.user?.id
        })
        .eq('id', request.id);

      if (error) {
        throw error;
      }

      toast({
        title: "School Request Rejected",
        description: "The school request has been rejected.",
      });

      fetchRequests();
      setSelectedRequest(null);
      setAdminNotes('');
      
    } catch (error) {
      console.error('Error rejecting request:', error);
      toast({
        title: "Error",
        description: "Failed to reject school request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700">Pending</Badge>;
      case 'approved':
        return <Badge variant="outline" className="bg-green-50 text-green-700">Approved</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-50 text-red-700">Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="p-8 text-center">
            <div className="text-lg">Loading school requests...</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <School className="h-6 w-6" />
            School Access Requests
          </CardTitle>
          <CardDescription>
            Manage and review school registration requests from the landing page
          </CardDescription>
        </CardHeader>
        <CardContent>
          {requests.length === 0 ? (
            <div className="text-center py-8">
              <School className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">No School Requests</h3>
              <p className="text-gray-500">All school requests will appear here when submitted.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>School Name</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>              <TableBody>
                {requests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell className="font-medium">{request.school_name}</TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-medium">{request.contact_name}</div>
                        <div className="text-sm text-gray-500">{request.contact_email}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {request.school_type ? (
                        <Badge variant="secondary">
                          {request.school_type.replace('_', ' ').toUpperCase()}
                        </Badge>
                      ) : (
                        <span className="text-gray-400">Not specified</span>
                      )}
                    </TableCell>
                    <TableCell>{getStatusBadge(request.status)}</TableCell>
                    <TableCell className="text-sm text-gray-500">
                      {formatDate(request.created_at)}
                    </TableCell>
                    <TableCell>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedRequest(request);
                              setAdminNotes(request.admin_notes || '');
                            }}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Review
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Review School Request</DialogTitle>
                            <DialogDescription>
                              School registration request from {request.contact_name}
                            </DialogDescription>
                          </DialogHeader>
                          
                          {selectedRequest && (
                            <div className="space-y-6">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <h4 className="font-semibold text-gray-900 mb-2">School Information</h4>
                                  <div className="space-y-2 text-sm">
                                    <div><strong>Name:</strong> {selectedRequest.school_name}</div>
                                    <div><strong>Type:</strong> {selectedRequest.school_type || 'Not specified'}</div>
                                    <div><strong>Students:</strong> {selectedRequest.student_count || 'Not specified'}</div>
                                    {selectedRequest.website && (
                                      <div><strong>Website:</strong> {selectedRequest.website}</div>
                                    )}
                                  </div>
                                </div>                                
                                <div>
                                  <h4 className="font-semibold text-gray-900 mb-2">Contact Information</h4>
                                  <div className="space-y-2 text-sm">
                                    <div className="flex items-center gap-2">
                                      <Mail className="h-4 w-4 text-gray-400" />
                                      {selectedRequest.contact_email}
                                    </div>
                                    {selectedRequest.phone && (
                                      <div className="flex items-center gap-2">
                                        <Phone className="h-4 w-4 text-gray-400" />
                                        {selectedRequest.phone}
                                      </div>
                                    )}
                                    {selectedRequest.address && (
                                      <div className="flex items-center gap-2">
                                        <MapPin className="h-4 w-4 text-gray-400" />
                                        {selectedRequest.address}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>

                              {selectedRequest.message && (
                                <div>
                                  <h4 className="font-semibold text-gray-900 mb-2">Additional Information</h4>
                                  <div className="bg-gray-50 p-3 rounded text-sm">
                                    {selectedRequest.message}
                                  </div>
                                </div>
                              )}

                              <div>
                                <Label htmlFor="adminNotes">Admin Notes</Label>
                                <Textarea
                                  id="adminNotes"
                                  value={adminNotes}
                                  onChange={(e) => setAdminNotes(e.target.value)}
                                  placeholder="Add notes about this request..."
                                  rows={3}
                                />
                              </div>

                              {selectedRequest.status === 'pending' && (
                                <div className="flex gap-2 pt-4">
                                  <Button
                                    onClick={() => handleApprove(selectedRequest)}
                                    disabled={isProcessing}
                                    className="bg-green-600 hover:bg-green-700"
                                  >
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    Approve & Create School
                                  </Button>
                                  <Button
                                    variant="destructive"
                                    onClick={() => handleReject(selectedRequest)}
                                    disabled={isProcessing}
                                  >
                                    <XCircle className="h-4 w-4 mr-2" />
                                    Reject Request
                                  </Button>
                                </div>
                              )}
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}