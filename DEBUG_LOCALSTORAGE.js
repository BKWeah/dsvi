// DEBUGGING TOOL: Check and Fix localStorage Invitations
// Run this in browser console to debug the invitation token issue

console.log('🔍 DEBUGGING LEVEL 2 ADMIN INVITATIONS');

// 1. Check current localStorage state
console.log('📦 Current localStorage contents:');
console.log('pendingLevel2Admins:', localStorage.getItem('pendingLevel2Admins'));

try {
    const pendingAdmins = JSON.parse(localStorage.getItem('pendingLevel2Admins') || '[]');
    console.log('📋 Parsed pending admins:', pendingAdmins);
    console.log('📊 Count:', pendingAdmins.length);
    
    if (pendingAdmins.length > 0) {
        console.log('🎫 Available tokens:');
        pendingAdmins.forEach((admin, index) => {
            console.log(`  ${index + 1}. Email: ${admin.email}, Token: ${admin.inviteToken}`);
        });
    } else {
        console.log('❌ No pending invitations found in localStorage');
    }
} catch (error) {
    console.error('❌ Error parsing localStorage:', error);
}

// 2. Check URL parameters
const urlParams = new URLSearchParams(window.location.search);
const tokenFromUrl = urlParams.get('token');
const emailFromUrl = urlParams.get('eh');

console.log('🔗 URL Parameters:');
console.log('Token from URL:', tokenFromUrl);
console.log('Email hash from URL:', emailFromUrl);

// 3. If you need to manually add an invitation for testing
console.log('🛠️ To manually add an invitation for testing, run this:');
console.log(`
// MANUAL INVITATION CREATION (adjust email and details as needed)
const testInvitation = {
    email: 'olutao@yahoo.com', // Replace with actual email
    name: 'Admin Olu',
    inviteToken: '${tokenFromUrl || 'invite_174945147234_sgysfyrb'}', // Use URL token
    emailHash: '${emailFromUrl || btoa('olutao@yahoo.com')}',
    tempPassword: 'TempPass123',
    permissions: ['manage_schools', 'view_reports'],
    schools: [],
    createdBy: 'manual-creation',
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    notes: 'Manually created invitation for testing'
};

// Add to localStorage
const existingInvitations = JSON.parse(localStorage.getItem('pendingLevel2Admins') || '[]');
existingInvitations.push(testInvitation);
localStorage.setItem('pendingLevel2Admins', JSON.stringify(existingInvitations));

console.log('✅ Test invitation added to localStorage');
console.log('🔄 Now try the signup process again');
`);

// 4. Function to clear localStorage if needed
window.clearPendingInvitations = function() {
    localStorage.removeItem('pendingLevel2Admins');
    console.log('🧹 Cleared all pending invitations from localStorage');
};

console.log('🧹 To clear all invitations: clearPendingInvitations()');
