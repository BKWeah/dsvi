# DSVI Cloud Database Migration Instructions

## Overview
This guide will help you replace your Supabase cloud database with your local database schema, including all tables, policies, functions, and storage buckets.

## ⚠️ IMPORTANT WARNING
This process will **PERMANENTLY DELETE** all data in your cloud database. Make sure to backup any important data before proceeding.

## Files Created
- `reset-cloud-database.sql` - Drops all existing tables and policies
- `complete-cloud-schema.sql` - Creates the complete schema from your local setup
- `deploy-to-cloud.bat` - Automated deployment script
- `switch-to-local.bat` - Script to switch back to local development

## Step-by-Step Process

### Step 1: Backup Your Cloud Data (Optional but Recommended)
If you have important data in your cloud database, export it first:
1. Go to https://supabase.com/dashboard/project/rzfilfpjxfinxxfldzuv
2. Navigate to Table Editor
3. Export any important data from your tables

### Step 2: Run the Deployment Script
1. Open Command Prompt as Administrator
2. Navigate to your project directory:
   ```
   cd "C:\Users\USER\Desktop\Code\Desktop Apps\0_Upwork\dsvi"
   ```
3. Run the deployment script:
   ```
   deploy-to-cloud.bat
   ```

### Step 3: Execute SQL Scripts in Supabase Dashboard
The deployment script will pause and ask you to run SQL scripts manually:

1. Go to https://supabase.com/dashboard/project/rzfilfpjxfinxxfldzuv
2. Navigate to "SQL Editor"
3. **First**, copy and paste the entire contents of `reset-cloud-database.sql` and click "Run"
4. **Then**, copy and paste the entire contents of `complete-cloud-schema.sql` and click "Run"

### Step 4: Verify the Migration
1. Check the Table Editor to ensure all tables are created:
   - schools
   - pages  
   - school_requests
2. Check Storage to ensure the 'public' bucket is created
3. Verify that your app connects to the cloud database

## What Gets Migrated

### Database Tables
- **schools** - Main school entities with admin assignments
- **pages** - School pages with content and sections
- **school_requests** - Requests for new school access

### Database Features
- All indexes for performance optimization
- Row Level Security (RLS) policies for all tables
- Triggers for automatic timestamp updates
- Functions for notifications and utilities

### Storage
- **public** bucket for file uploads
- Storage policies for public access and authenticated uploads

### Edge Functions
- **create-school-admin** - Function for creating school administrators

## Environment Configuration
After running the deployment script, your `.env.local` will be updated to use production:
```
VITE_SUPABASE_URL=https://rzfilfpjxfinxxfldzuv.supabase.co
VITE_SUPABASE_ANON_KEY=your-production-anon-key
```

## Switching Between Environments

### To use Cloud (Production):
Your environment is already configured after running the deployment script.

### To switch back to Local Development:
Run: `switch-to-local.bat`

Then start your local Supabase:
```
supabase start
```

## Troubleshooting

### If Edge Function Deployment Fails:
1. Make sure you're logged into Supabase CLI: `supabase login`
2. Ensure you have the correct permissions for the project
3. Try deploying manually: `supabase functions deploy create-school-admin`

### If SQL Scripts Fail:
1. Make sure you run `reset-cloud-database.sql` FIRST
2. Check the error message - it might be a permission issue
3. Ensure you're in the correct project dashboard

### If App Still Connects to Local:
1. Check that `.env.local` has the correct production URLs
2. Restart your development server
3. Clear browser cache and localStorage

## Support
If you encounter issues, check:
1. Supabase CLI version: `supabase --version`
2. Project connection: `supabase status`
3. Environment variables in `.env.local`

---

## Quick Summary for Experienced Users
1. Run `deploy-to-cloud.bat`
2. Execute `reset-cloud-database.sql` in Supabase SQL Editor
3. Execute `complete-cloud-schema.sql` in Supabase SQL Editor
4. Your app now uses Supabase Cloud instead of local!
