# IMPORTANT: Brevo Email Integration Setup

Your app is now configured to work with Brevo email, but it requires a Cloudflare Pages Function to handle the API calls.

## Quick Setup (Recommended - Pages Functions)

The `functions` directory has been created with the necessary proxy function. This will deploy automatically with your Cloudflare Pages site.

### 1. Add Brevo API Key to Cloudflare Pages

1. Go to your Cloudflare Pages project
2. Settings → Environment variables
3. Add variable:
   - Variable name: `BREVO_API_KEY`
   - Value: Your Brevo API key
   - Environment: Production (and Preview if needed)

### 2. Deploy

Simply push your code to GitHub. The function will deploy automatically with your Pages site.

### 3. Test

The email functionality should now work at your production URL.

## How It Works

1. Your React app calls `/api/brevo/*` endpoints
2. Cloudflare Pages Function intercepts these calls
3. Function adds your Brevo API key (stored securely in Cloudflare)
4. Function forwards the request to Brevo's actual API
5. Response is sent back to your React app with proper CORS headers

## Local Testing

For local development, you have two options:

### Option 1: Use Production API (Recommended)
Add to `.env.local`:
```
VITE_BREVO_WORKER_URL=https://your-site.pages.dev/api/brevo
```

### Option 2: Run Functions Locally
```bash
npx wrangler pages dev -- npm run dev
```

This starts both Vite and the Pages Functions locally.

## Troubleshooting

1. **"API key not provided"**: Make sure you've added BREVO_API_KEY to Cloudflare Pages environment variables

2. **CORS errors**: The function should handle CORS automatically. If you still see errors, check that your requests go to `/api/brevo/*`

3. **404 errors**: Ensure the `functions` directory is at the root of your project (same level as `src`)

## Security Note

Never put your Brevo API key in your React code or `.env` files that get bundled. Always use Cloudflare's environment variables for API keys.
