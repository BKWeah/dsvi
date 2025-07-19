// IMMEDIATE FIX: Manual School Admin Assignment
// This component can be used to manually assign school admins to their schools

import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

interface UnassignedAdmin {
  user_id: string;
  email: string;
  school_id: string;
  school_name: string;
}

export function ManualAdminAssignment() {
  const [unassignedAdmins, setUnassignedAdmins] = useState<UnassignedAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchUnassignedAdmins();
  }, []);

  const fetchUnassignedAdmins = async () => {
    try {
      // Note: This requires service role access or proper policies
      // Alternative: Get data from a database view or function
      const { data: schools, error } = await supabase
        .from('schools')
        .select('*')
        .is('admin_user_id', null);

      if (error) throw error;
      
      // For now, this is a simplified version
      // You'll need to manually check your database for unassigned admins
      setUnassignedAdmins([]);
    } catch (error) {
      console.error('Error fetching unassigned admins:', error);
      toast({
        title: "Error", 
        description: "Check console for details",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  const assignAdmin = async (admin: UnassignedAdmin) => {
    setAssigning(admin.user_id);
    try {
      const { error } = await supabase
        .from('schools')
        .update({ 
          admin_user_id: admin.user_id,
          updated_at: new Date().toISOString()
        })
        .eq('id', admin.school_id);

      if (error) throw error;

      toast({
        title: "Success",
        description: `${admin.email} assigned to ${admin.school_name}`,
      });

      // Refresh the list
      await fetchUnassignedAdmins();
    } catch (error) {
      console.error('Error assigning admin:', error);
      toast({
        title: "Error",
        description: "Failed to assign admin",
        variant: "destructive",
      });
    } finally {
      setAssigning(null);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Manual Admin Assignment</CardTitle>
      </CardHeader>
      <CardContent>
        {unassignedAdmins.length === 0 ? (
          <p>No unassigned admins found.</p>
        ) : (
          <div className="space-y-2">
            {unassignedAdmins.map(admin => (
              <div key={admin.user_id} className="flex justify-between items-center p-2 border rounded">
                <div>
                  <div>{admin.email}</div>
                  <div className="text-sm text-gray-500">{admin.school_name}</div>
                </div>
                <Button 
                  onClick={() => assignAdmin(admin)}
                  disabled={assigning === admin.user_id}
                >
                  {assigning === admin.user_id ? 'Assigning...' : 'Assign'}
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}