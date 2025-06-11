# Email System Testing Guide

## Quick Local Testing

1. **Create wrangler.toml file** (already exists):
```toml
name = "dsvi-email-functions"
compatibility_date = "2024-03-08"
compatibility_flags = ["nodejs_compat"]

[vars]
BREVO_API_KEY = "YOUR_BREVO_API_KEY_HERE"
BREVO_SMTP_USERNAME = "YOUR_SMTP_USERNAME_HERE"
BREVO_SMTP_PASSWORD = "YOUR_SMTP_PASSWORD_HERE"

[[pages]]
functions = "functions"
```

2. **Run Pages Functions locally**:
```bash
npx wrangler pages dev -- npm run dev
```

## Production Setup

1. **Set environment variables** in Cloudflare Pages dashboard:
   - Variable: `BREVO_API_KEY`
   - Value: `YOUR_BREVO_API_KEY_HERE`
   - Variable: `BREVO_SMTP_USERNAME`
   - Value: `YOUR_SMTP_USERNAME_HERE`
   - Variable: `BREVO_SMTP_PASSWORD`
   - Value: `YOUR_SMTP_PASSWORD_HERE`

2. **Deploy your code**:
```bash
git push
```

3. **Test on your live site**

## Testing Component

Add this to any admin page:
```tsx
import { SimpleEmailTest } from '@/components/dsvi-admin/messaging/SimpleEmailTest';

<SimpleEmailTest />
```
