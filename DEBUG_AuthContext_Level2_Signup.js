// DEBUG LEVEL 2 ADMIN SIGNUP
// Add this to your AuthContext.tsx to debug the signup process

// Replace the existing Level 2 admin signup section with this debug version:

// Check if this is a Level 2 admin signup based on invite token
if (role === 'DSVI_ADMIN' && metadata?.inviteToken) {
  try {
    console.log('🔄 [DEBUG] Processing Level 2 admin signup with invite token:', metadata.inviteToken);
    console.log('🔄 [DEBUG] User data:', { id: data.user.id, email: data.user.email });
    
    const pendingAdmins = JSON.parse(localStorage.getItem('pendingLevel2Admins') || '[]');
    console.log('🔄 [DEBUG] Found pending admins in localStorage:', pendingAdmins.length);
    console.log('🔄 [DEBUG] Pending admins:', pendingAdmins.map(admin => ({ 
      email: admin.email, 
      token: admin.inviteToken 
    })));
    
    const pendingAdmin = pendingAdmins.find((admin: any) => 
      admin.inviteToken === metadata.inviteToken
    );
    
    if (pendingAdmin) {
      console.log('✅ [DEBUG] Found matching Level 2 admin invitation:', pendingAdmin);
      
      // Verify the email matches the invitation (security check)
      if (pendingAdmin.email.toLowerCase() !== email.toLowerCase()) {
        console.warn('❌ [DEBUG] Email mismatch in Level 2 admin signup');
        console.warn('❌ [DEBUG] Expected:', pendingAdmin.email.toLowerCase());
        console.warn('❌ [DEBUG] Received:', email.toLowerCase());
        return { error };
      }
      
      // Check if invitation hasn't expired
      const now = new Date();
      const expiresAt = new Date(pendingAdmin.expiresAt);
      
      console.log('🔄 [DEBUG] Checking expiration:', { now, expiresAt, expired: now > expiresAt });
      
      if (now > expiresAt) {
        console.warn('❌ [DEBUG] Invitation has expired');
        return { error };
      }
      
      console.log('🚀 [DEBUG] Creating Level 2 admin profile using comprehensive function...');
      
      const functionParams = {
        p_user_id: data.user.id,
        p_email: email,
        p_name: metadata?.name || pendingAdmin.name || email.split('@')[0],
        p_created_by: pendingAdmin.createdBy,
        p_permissions: pendingAdmin.permissions || [],
        p_school_ids: pendingAdmin.schools || [],
        p_notes: pendingAdmin.notes || `Level 2 admin created from invitation on ${new Date().toLocaleDateString()}`
      };
      
      console.log('🚀 [DEBUG] Function parameters:', functionParams);
      
      // Use the debug function for better error visibility
      const { data: createResult, error: createError } = await supabase.rpc('debug_create_level2_admin_complete', functionParams) as { data: any, error: any };

      console.log('🔄 [DEBUG] Function response:', { createResult, createError });

      if (createError) {
        console.error('❌ [DEBUG] Supabase RPC error:', createError);
        console.warn('⚠️ [DEBUG] Admin creation failed with RPC error, but user signup succeeded.');
      } else if (!createResult?.success) {
        console.error('❌ [DEBUG] Function returned failure:', createResult);
        console.warn('⚠️ [DEBUG] Admin creation failed with function error, but user signup succeeded.');
      } else {
        console.log('✅ [DEBUG] Level 2 admin created successfully:', createResult);
        // Set admin level immediately after successful creation
        setAdminLevel(2);
        
        // Remove from pending list (mark as used)
        const updatedPending = pendingAdmins.filter((admin: any) => 
          admin.inviteToken !== metadata.inviteToken
        );
        localStorage.setItem('pendingLevel2Admins', JSON.stringify(updatedPending));
        
        console.log('🎉 [DEBUG] Level 2 admin setup completed successfully');
        console.log('🎉 [DEBUG] Updated pending list:', updatedPending.length, 'remaining');
        
        // Dispatch event to notify useAdmin hook to refresh
        window.dispatchEvent(new CustomEvent('adminLevelChanged'));
      }
    } else {
      console.log('❌ [DEBUG] No matching invitation found for token:', metadata.inviteToken);
      console.log('❌ [DEBUG] Available tokens:', pendingAdmins.map(admin => admin.inviteToken));
    }
  } catch (adminError) {
    console.error('❌ [DEBUG] Failed to apply Level 2 admin configuration:', adminError);
    console.error('❌ [DEBUG] Error stack:', adminError.stack);
  }
}