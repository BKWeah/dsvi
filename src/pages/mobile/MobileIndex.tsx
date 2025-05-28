import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  GraduationCap, 
  Users, 
  Globe, 
  Palette, 
  Shield, 
  BarChart3, 
  CheckCircle, 
  ArrowRight,
  School,
  Star,
  Menu,
  X
} from 'lucide-react';

interface SchoolRequest {
  schoolName: string;
  contactEmail: string;
  contactName: string;
  phone: string;
  address: string;
  schoolType: string;
  studentCount: string;
  website: string;
  message: string;
}

export default function MobileIndex() {
  const { user, role, logout } = useAuth();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [formData, setFormData] = useState<SchoolRequest>({
    schoolName: '',
    contactEmail: '',
    contactName: '',
    phone: '',
    address: '',
    schoolType: '',
    studentCount: '',
    website: '',
    message: ''
  });

  const handleLogout = async () => {
    await logout();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
