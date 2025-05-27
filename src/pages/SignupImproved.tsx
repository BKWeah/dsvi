import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { School, Shield, AlertTriangle, CheckCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export default function SignupImproved() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [searchParams] = useSearchParams();
  const { signup } = useAuth();
  const navigate = useNavigate();

  // Check for school-specific signup parameters
  const schoolId = searchParams.get('school_id');
  const schoolName = searchParams.get('school_name');
  const inviteRole = searchParams.get('role');
  const isValidInvite = schoolId && schoolName && inviteRole === 'SCHOOL_ADMIN';

  // Verify admin assignment after signup
  const verifyAdminAssignment = async (userId: string) => {
    setVerifying(true);
    try {
      // Wait a moment for the database trigger to process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const { data, error } = await supabase
        .from('schools')
        .select('*')
        .eq('id', schoolId)
        .eq('admin_user_id', userId)
        .single();

      if (error) {
        console.warn('Verification query error:', error);
        return false;
      }

      return !!data;
    } catch (error) {
      console.error('Verification error:', error);
      return false;
    } finally {
      setVerifying(false);
    }
  };