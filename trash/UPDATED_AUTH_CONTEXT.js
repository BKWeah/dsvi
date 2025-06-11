// UPDATED AUTH CONTEXT: Use Database Instead of localStorage
// Replace the Level 2 admin signup section in AuthContext.tsx

// Check if this is a Level 2 admin signup based on invite token
if (role === 'DSVI_ADMIN' && metadata?.inviteToken) {
  try {
    console.log('🔄 Processing Level 2 admin signup with database invitation...');
    console.log('🔄 Invite token:', metadata.inviteToken);
    console.log('🔄 User data:', { id: data.user.id, email: data.user.email });
    
    // Use the new database function instead of localStorage
    const { data: signupResult, error: signupError } = await supabase.rpc('process_level2_admin_signup', {
      p_user_id: data.user.id,
      p_email: email,
      p_invite_token: metadata.inviteToken
    });

    console.log('🔄 Database signup result:', signupResult);
    console.log('🔄 Database signup error:', signupError);

    if (signupError) {
      console.error('❌ Database Level 2 admin signup failed:', signupError);
      console.warn('⚠️ Admin creation failed, but user signup succeeded. Check invitation token and database.');
    } else if (!signupResult?.success) {
      console.error('❌ Level 2 admin signup returned failure:', signupResult);
      console.warn('⚠️ Admin creation failed:', signupResult?.message);
      
      // Log helpful debug info
      if (signupResult?.message?.includes('Invalid invitation')) {
        console.log('🔍 Debug: Check if invitation exists, is expired, or email matches');
        console.log('🔍 Expected email:', email);
        console.log('🔍 Invite token:', metadata.inviteToken);
      }
    } else {
      console.log('✅ Level 2 admin created successfully from database invitation!');
      console.log('✅ Creation details:', signupResult);
      
      // Set admin level immediately after successful creation
      setAdminLevel(2);
      
      console.log('🎉 Level 2 admin setup completed successfully');
      
      // Dispatch event to notify useAdmin hook to refresh
      window.dispatchEvent(new CustomEvent('adminLevelChanged'));
    }
  } catch (adminError) {
    console.error('❌ Failed to process Level 2 admin signup:', adminError);
    console.error('❌ Error details:', adminError);
  }
}
// Remove the localStorage fallback since we're now using database
else if (role === 'DSVI_ADMIN') {
  console.log('🔄 DSVI_ADMIN signup without invite token - regular admin account created');
}
