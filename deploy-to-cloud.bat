@echo off
echo ========================================
echo DSVI Cloud Database Setup Script
echo ========================================

echo.
echo STEP 1: Switching to production environment...
echo Please make sure you have the Supabase CLI installed and are logged in.
echo.

REM Switch to the production project
supabase link --project-ref rzfilfpjxfinxxfldzuv

echo.
echo STEP 2: Deploying Edge Functions...
echo.

REM Deploy the Edge Function
supabase functions deploy create-school-admin

echo.
echo STEP 3: Database setup instructions...
echo.
echo *** MANUAL STEPS REQUIRED ***
echo 1. Go to your Supabase Cloud Dashboard: https://supabase.com/dashboard/project/rzfilfpjxfinxxfldzuv
echo 2. Go to SQL Editor
echo 3. Copy and paste the contents of 'reset-cloud-database.sql' and run it
echo 4. Copy and paste the contents of 'complete-cloud-schema.sql' and run it
echo.

echo STEP 4: Update environment variables...
echo.

REM Update .env.local to use production
echo # Production Supabase Environment > .env.local
echo VITE_SUPABASE_URL=https://rzfilfpjxfinxxfldzuv.supabase.co >> .env.local
echo VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ6ZmlsZnBqeGZpbnh4ZmxkenV2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgzMjA0NzMsImV4cCI6MjA2Mzg5NjQ3M30.6Wf8vIJ2Bo1QS0Ie_16xqHZQhCdfsXDmNATPLT3sAfg >> .env.local
echo. >> .env.local
echo # Local Supabase (commented out) >> .env.local
echo # VITE_SUPABASE_URL=http://127.0.0.1:54321 >> .env.local
echo # VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0 >> .env.local

echo.
echo ========================================
echo DEPLOYMENT COMPLETED!
echo ========================================
echo.
echo Your app is now configured to use Supabase Cloud!
echo Don't forget to run the SQL scripts in your Supabase dashboard.
echo.
pause
