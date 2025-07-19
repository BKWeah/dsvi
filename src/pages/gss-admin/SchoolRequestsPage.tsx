import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { logActivity } from '@/lib/database';
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
        })
        .eq('id', request.id);

      if (updateError) {
        throw updateError;
      }

      // Log the approval activity
      const { data: currentUser } = await supabase.auth.getUser();
      if (currentUser.user) {
        await logActivity(
          currentUser.user.id,
          schoolData.id,
          'SCHOOL_REQUEST_APPROVED',
          { 
            request_id: request.id,
            school_name: request.school_name,
            contact_email: request.contact_email,
            admin_notes: adminNotes
          }
        );
      }

      toast({
        title: "Success",
        description: `School "${request.school_name}" has been approved and created.`,
      });

      // Refresh the requests list
      await fetchRequests();
      setSelectedRequest(null);
    } catch (error) {
      console.error('Error approving request:', error);
      toast({
        title: "Error",
        description: "Failed to approve school request.",
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
        })
        .eq('id', request.id);

      if (error) {
        throw error;
      }

      // Log the rejection activity
      const { data: currentUser } = await supabase.auth.getUser();
      if (currentUser.user) {
        await logActivity(
          currentUser.user.id,
          null, // No school created for rejection
          'SCHOOL_REQUEST_REJECTED',
          { 
            request_id: request.id,
            school_name: request.school_name,
            contact_email: request.contact_email,
            admin_notes: adminNotes
          }
        );
      }

      toast({
        title: "Success",
        description: `School request "${request.school_name}" has been rejected.`,
      });

      // Refresh the requests list
      await fetchRequests();
      setSelectedRequest(null);
    } catch (error) {
      console.error('Error rejecting request:', error);
      toast({
        title: "Error",
        description: "Failed to reject school request.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800">Approved</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>;
      default:
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
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
            <>
              {/* Desktop Table View */}
              <div className="hidden md:block">
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
                  </TableHeader>
                  <TableBody>
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
                                <RequestDetailsContent
                                  request={selectedRequest}
                                  adminNotes={adminNotes}
                                  setAdminNotes={setAdminNotes}
                                  onApprove={() => handleApprove(selectedRequest)}
                                  onReject={() => handleReject(selectedRequest)}
                                  isProcessing={isProcessing}
                                />
                              )}
                            </DialogContent>
                          </Dialog>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              {/* Mobile Card View */}
              <div className="block md:hidden space-y-4">
                {requests.map((request) => (
                  <Card key={request.id} className="border border-gray-200 shadow-sm">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg text-gray-900 mb-1">
                            {request.school_name}
                          </h3>
                          <div className="flex items-center gap-2 mb-2">
                            {getStatusBadge(request.status)}
                            {request.school_type && (
                              <Badge variant="secondary" className="text-xs">
                                {request.school_type.replace('_', ' ').toUpperCase()}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-2 text-sm">
                          <Mail className="h-4 w-4 text-gray-400 flex-shrink-0" />
                          <div>
                            <div className="font-medium">{request.contact_name}</div>
                            <div className="text-gray-500">{request.contact_email}</div>
                          </div>
                        </div>
                        
                        {request.phone && (
                          <div className="flex items-center gap-2 text-sm">
                            <Phone className="h-4 w-4 text-gray-400 flex-shrink-0" />
                            <span className="text-gray-600">{request.phone}</span>
                          </div>
                        )}
                        
                        {request.address && (
                          <div className="flex items-center gap-2 text-sm">
                            <MapPin className="h-4 w-4 text-gray-400 flex-shrink-0" />
                            <span className="text-gray-600">{request.address}</span>
                          </div>
                        )}
                        
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="h-4 w-4 text-gray-400 flex-shrink-0" />
                          <span className="text-gray-500">Submitted {formatDate(request.created_at)}</span>
                        </div>
                      </div>
                      
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full"
                            onClick={() => {
                              setSelectedRequest(request);
                              setAdminNotes(request.admin_notes || '');
                            }}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            Review Request
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>Review School Request</DialogTitle>
                            <DialogDescription>
                              School registration request from {request.contact_name}
                            </DialogDescription>
                          </DialogHeader>
                          
                          {selectedRequest && (
                            <RequestDetailsContent
                              request={selectedRequest}
                              adminNotes={adminNotes}
                              setAdminNotes={setAdminNotes}
                              onApprove={() => handleApprove(selectedRequest)}
                              onReject={() => handleReject(selectedRequest)}
                              isProcessing={isProcessing}
                            />
                          )}
                        </DialogContent>
                      </Dialog>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
// Helper component for request details dialog content
const RequestDetailsContent: React.FC<{
  request: SchoolRequest;
  adminNotes: string;
  setAdminNotes: (notes: string) => void;
  onApprove: () => void;
  onReject: () => void;
  isProcessing: boolean;
}> = ({ request, adminNotes, setAdminNotes, onApprove, onReject, isProcessing }) => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <h4 className="font-semibold text-gray-900 mb-2">School Information</h4>
        <div className="space-y-2 text-sm">
          <div><strong>Name:</strong> {request.school_name}</div>
          <div><strong>Type:</strong> {request.school_type || 'Not specified'}</div>
          <div><strong>Students:</strong> {request.student_count || 'Not specified'}</div>
          {request.website && (
            <div><strong>Website:</strong> {request.website}</div>
          )}
        </div>
      </div>
      
      <div>
        <h4 className="font-semibold text-gray-900 mb-2">Contact Information</h4>
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-gray-400" />
            {request.contact_email}
          </div>
          {request.phone && (
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-gray-400" />
              {request.phone}
            </div>
          )}
          {request.address && (
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-gray-400" />
              {request.address}
            </div>
          )}
        </div>
      </div>
    </div>
    
    {request.message && (
      <div>
        <h4 className="font-semibold text-gray-900 mb-2">Additional Message</h4>
        <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md">
          {request.message}
        </p>
      </div>
    )}
    
    <div>
      <Label htmlFor="adminNotes">Admin Notes</Label>
      <Textarea
        id="adminNotes"
        value={adminNotes}
        onChange={(e) => setAdminNotes(e.target.value)}
        placeholder="Add notes for this request..."
        className="mt-2"
        rows={3}
      />
    </div>
    
    {request.status === 'pending' && (
      <div className="flex gap-2 pt-4">
        <Button
          onClick={onApprove}
          disabled={isProcessing}
          className="flex-1"
        >
          <CheckCircle className="h-4 w-4 mr-2" />
          Approve & Create School
        </Button>
        <Button
          variant="destructive"
          onClick={onReject}
          disabled={isProcessing}
          className="flex-1"
        >
          <XCircle className="h-4 w-4 mr-2" />
          Reject Request
        </Button>
      </div>
    )}
  </div>
);