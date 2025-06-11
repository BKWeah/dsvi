// UPDATED ADMIN MANAGEMENT PAGE: Use Database Instead of localStorage
// Replace the createLevel2Admin function in AdminManagementPage.tsx

const createLevel2Admin = async () => {
  if (!newAdminEmail || !newAdminName) {
    toast({
      title: "Error",
      description: "Email and name are required",
      variant: "destructive",
    });
    return;
  }

  try {
    console.log('🔄 Creating Level 2 admin invitation in database...');
    
    // Use the new database function instead of localStorage
    const { data: invitationResult, error: invitationError } = await supabase.rpc('create_admin_invitation', {
      p_email: newAdminEmail,
      p_name: newAdminName,
      p_created_by: user?.id,
      p_permissions: selectedPermissions,
      p_school_ids: selectedSchools,
      p_notes: newAdminNotes,
      p_days_valid: 7
    });

    if (invitationError) {
      console.error('❌ Database invitation creation failed:', invitationError);
      toast({
        title: "Error",
        description: "Failed to create invitation in database",
        variant: "destructive",
      });
      return;
    }

    if (!invitationResult?.success) {
      console.error('❌ Invitation creation returned failure:', invitationResult);
      toast({
        title: "Error", 
        description: invitationResult?.message || "Failed to create invitation",
        variant: "destructive",
      });
      return;
    }

    console.log('✅ Database invitation created successfully:', invitationResult);

    // Prepare data for success dialog
    setLastInvitationData({
      email: newAdminEmail,
      name: newAdminName,
      signupLink: invitationResult.signup_link,
      permissions: selectedPermissions,
      schools: selectedSchools,
      tempPassword: invitationResult.temp_password,
      expiresAt: invitationResult.expires_at,
      inviteToken: invitationResult.invite_token
    });

    // Reset form
    setNewAdminEmail('');
    setNewAdminName('');
    setNewAdminNotes('');
    setSelectedPermissions([]);
    setSelectedSchools([]);
    setShowCreateDialog(false);

    // Show success dialog
    setShowSuccessDialog(true);

    // Copy link to clipboard automatically
    try {
      await navigator.clipboard.writeText(invitationResult.signup_link);
      toast({
        title: "Invitation Created!",
        description: "Signup link copied to clipboard and stored in database",
      });
    } catch (clipboardError) {
      toast({
        title: "Invitation Created!",
        description: "Invitation stored in database - use the dialog to copy the signup link",
      });
    }

    // Refresh data to show any newly created admins
    fetchData();

  } catch (error) {
    console.error('❌ Error creating database invitation:', error);
    toast({
      title: "Error",
      description: "Failed to create Level 2 admin invitation",
      variant: "destructive",
    });
  }
};
