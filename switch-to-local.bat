@echo off
echo ========================================
echo Switch Back to Local Development
echo ========================================

echo.
echo Updating .env.local to use local Supabase...
echo.

REM Update .env.local to use local development
echo # Local Supabase Development Environment > .env.local
echo VITE_SUPABASE_URL=http://127.0.0.1:54321 >> .env.local
echo VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0 >> .env.local
echo. >> .env.local
echo # Production Supabase (commented out) >> .env.local
echo # VITE_SUPABASE_URL=https://rzfilfpjxfinxxfldzuv.supabase.co >> .env.local
echo # VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ6ZmlsZnBqeGZpbnh4ZmxkenV2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgzMjA0NzMsImV4cCI6MjA2Mzg5NjQ3M30.6Wf8vIJ2Bo1QS0Ie_16xqHZQhCdfsXDmNATPLT3sAfg >> .env.local

echo.
echo ========================================
echo Switched to Local Development!
echo ========================================
echo.
echo Make sure to start your local Supabase with: supabase start
echo.
pause
