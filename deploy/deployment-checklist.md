# DSVI Email System Deployment Checklist

## Pre-deployment
- [ ] Environment variables are set (check deploy/cloudflare-variables.txt)
- [ ] Build completed successfully (`npm run build`)
- [ ] All email system files are present

## Cloudflare Pages Setup
- [ ] Repository connected to Cloudflare Pages
- [ ] Build command set to: `npm run build` or `./build.sh`
- [ ] Output directory set to: `dist`
- [ ] Node.js version set to 18 or higher

## Required Environment Variables
- [ ] VITE_SUPABASE_URL
- [ ] VITE_SUPABASE_ANON_KEY  
- [ ] VITE_DEFAULT_RESEND_API_KEY

## Post-deployment Testing
- [ ] Visit your deployed site
- [ ] Log in to admin panel
- [ ] Navigate to Email Test page
- [ ] Run email connection test
- [ ] Send a test message through Messaging Panel
- [ ] Verify email delivery

## Email System Components
- [ ] Cloudflare Pages Function: `/api/email/send`
- [ ] Resend API integration
- [ ] Supabase database integration
- [ ] Message queue processing

## Common Issues & Solutions
- **"Email API Error"**: Check environment variables in Cloudflare Pages
- **"Connection failed"**: Verify Resend API key is valid
- **"Access denied"**: Check Supabase URL and anon key
- **Function not found**: Ensure `functions` directory is deployed

## Success Criteria
- [ ] Email test passes
- [ ] Test message sends successfully
- [ ] Recipient receives email
- [ ] Message status updates in database

## Files to Verify
- [ ] `functions/api/email/send.js` (Cloudflare Function)
- [ ] `src/lib/messaging-service.ts` (Updated with email sending)
- [ ] `src/lib/simple-email-service.ts` (Email service)
- [ ] `wrangler.toml` (Configuration)

## Quick Test Commands
```bash
# Local development test
npm run dev

# Build for production
npm run build

# Setup Cloudflare environment
npm run setup:cloudflare

# Enhanced build with checks
npm run build:enhanced
```
