# Cleanup script for DSVI project
# This moves old debug/fix files to trash folder

# Files to move to trash (old debug/fix/test files)
FILES_TO_TRASH=(
    "check_columns.sql"
    "check_foreign_key.sql" 
    "check_user_profiles_structure.sql"
    "COMPLETE_LEVEL2_ADMIN_FIX_PART1.sql"
    "COMPLETE_SYSTEM_PART1.sql"
    "COMPLETE_SYSTEM_PART2.sql"
    "COMPREHENSIVE_DIAGNOSTIC.sql"
    "COMPREHENSIVE_INVITATION_FIX_GUIDE.md"
    "COMPREHENSIVE_LEVEL2_ADMIN_FLOW_TEST.sql"
    "CORRECTED_EMERGENCY_FIX.sql"
    "CREATE_DATABASE_INVITATION_SYSTEM.sql"
    "CREATE_LIST_FUNCTION.sql"
    "CRITICAL_FIX_MISSING_FUNCTION.sql"
    "debug_admin_creation.sql"
    "DEBUG_AuthContext_Level2_Signup.js"
    "debug_invitations.sql"
    "debug_level2_admin_creation.sql"
    "DEBUG_LOCALSTORAGE.js"
    "debug_step1.sql"
    "DIAGNOSTIC_CHECK_INVITATIONS.sql"
    "EMERGENCY_FIX_MISSING_FUNCTIONS.sql"
    "emergency_fix_user_profiles.sql"
    "FALLBACK_SIMPLE_FUNCTION.sql"
    "find_real_error.sql"
    "FIXED_PendingInvitations.tsx"
    "fixed_quick_test_part1.sql"
    "fixed_quick_test_part2.sql"
    "fixed_quick_test_part3.sql"
    "fixed_quick_test_part4.sql"
    "fixed_quick_test_part5.sql"
    "IMMEDIATE_ACTION_PLAN.md"
    "ISSUE_FIX_SUMMARY.md"
    "LEVEL2_ADMIN_DEBUG_GUIDE.md"
    "LEVEL2_ADMIN_FIX_GUIDE.md"
    "LEVEL2_ADMIN_SOLUTION.md"
    "MANUAL_ADMIN_CREATION.sql"
    "OPTIONAL_LEVEL2_EDGE_FUNCTION.ts"
    "PROPER_INVITATION_SYSTEM_GUIDE.md"
    "quick_debug.sql"
    "QUICK_DIAGNOSTIC.sql"
    "QUICK_FIX_ADMIN_INVITATION.sql"
    "QUICK_FIX_ADMIN_INVITATION_SIMPLE.sql"
    "QUICK_FIX_CURRENT_USER.sql"
    "QUICK_FIX_SUMMARY.md"
    "quick_fix_test.sql"
    "quick_flow_check.sql"
    "quick_test_level2_admin.sql"
    "simple_invitation_check.sql"
    "SIMPLE_VERIFICATION.sql"
    "test_admin_functions.sql"
    "TEST_DATABASE_INVITATION_SYSTEM.sql"
    "TEST_WITH_REAL_USERS.sql"
    "UPDATED_ADMIN_MANAGEMENT.js"
    "UPDATED_AUTH_CONTEXT.js"
    "URGENT_FIX_MISSING_FUNCTION.sql"
    "URGENT_FIX_SUMMARY.md"
    "VERIFICATION_DATABASE_SYSTEM.sql"
    "VERIFICATION_TEST.sql"
    "verify_and_migrate_admin.sql"
    "verify_and_migrate_admin_FIXED.sql"
    "verify_fix.sql"
)

# Documentation to keep clean
DOCS_TO_TRASH=(
    "ADMIN_SYSTEM_CONSOLIDATION_GUIDE.md"
    "FRONTEND_UPDATES_COMPLETE.md"
)

echo "Moving old debug/fix files to trash..."
for file in "${FILES_TO_TRASH[@]}"; do
    if [ -f "$file" ]; then
        mv "$file" "trash/"
        echo "✅ Moved $file"
    fi
done

echo "Moving old documentation to trash..."
for file in "${DOCS_TO_TRASH[@]}"; do
    if [ -f "$file" ]; then
        mv "$file" "trash/"
        echo "✅ Moved $file"
    fi
done

# Move the entire FIX_LEVEL2_ADMIN directory
if [ -d "FIX_LEVEL2_ADMIN" ]; then
    mv "FIX_LEVEL2_ADMIN" "trash/"
    echo "✅ Moved FIX_LEVEL2_ADMIN directory"
fi

echo "🎉 Cleanup completed!"
