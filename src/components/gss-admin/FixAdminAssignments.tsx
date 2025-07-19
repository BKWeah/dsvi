// Quick Fix Component - Add this to your SchoolsPage.tsx temporarily

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { RefreshCw } from 'lucide-react';

export function FixAdminAssignments() {
  const [fixing, setFixing] = useState(false);
  const { toast } = useToast();

  const fixAssignments = async () => {
    setFixing(true);
    try {
      // First check if we can access the schools table
      const { data: testData, error: testError } = await supabase
        .from('schools')
        .select('id')
        .limit(1);

      if (testError) {
        toast({
          title: "Database Access Error",
          description: "Run emergency-access-fix.sql in Supabase SQL Editor first",
          variant: "destructive",
        });
        return;
      }

      // Call the manual assignment function
      const { data, error } = await supabase.rpc('fix_all_unassigned_school_admins');
      
      if (error) {
        console.error('RPC error:', error);
        toast({
          title: "Error",
          description: "Run manual-assignment-function.sql in Supabase SQL Editor first",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success",
        description: data || "Admin assignments processed!",
      });
      
      // Refresh page to see changes
      setTimeout(() => window.location.reload(), 1000);
    } catch (error) {
      console.error('Fix error:', error);
      toast({
        title: "Error",
        description: "Check console for details. Run SQL scripts manually if needed.",
        variant: "destructive",
      });
    } finally {
      setFixing(false);
    }
  };

  return (
    <Card className="mb-4 border-orange-200 bg-orange-50">
      <CardHeader>
        <CardTitle className="text-orange-800">Admin Assignment Fix</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-orange-700 mb-3">
          If schools show "No Admin" but admins can actually access their schools, click to fix the assignments.
          <br />
          <strong>Also use this after any new admin signup to link them to their school.</strong>
        </p>
        <Button onClick={fixAssignments} disabled={fixing} variant="outline">
          <RefreshCw className={`h-4 w-4 mr-2 ${fixing ? 'animate-spin' : ''}`} />
          {fixing ? 'Fixing...' : 'Fix Admin Assignments'}
        </Button>
        <p className="text-xs text-orange-600 mt-2">
          Run this after each new school admin signup to ensure proper assignment.
        </p>
      </CardContent>
    </Card>
  );
}