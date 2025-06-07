# Brevo Email Integration via Cloudflare Workers

Since Brevo's API doesn't allow direct browser calls (CORS restriction), we use a Cloudflare Worker as a proxy.

## Setup Instructions

### 1. Install Wrangler CLI (if not already installed)
```bash
npm install -g wrangler
```

### 2. Login to Cloudflare
```bash
wrangler login
```

### 3. Deploy the Worker
Navigate to the workers directory and deploy:
```bash
cd workers
wrangler deploy
```

### 4. Add your Brevo API Key as a secret
```bash
wrangler secret put BREVO_API_KEY
# Enter your Brevo API key when prompted
```

### 5. Configure Routes (Production)

Option A: Add to your existing Cloudflare Pages project
- Go to your Cloudflare Pages project settings
- Navigate to Functions → Routes
- Add route: `/api/brevo/*` → `dsvi-email-worker`

Option B: Configure in wrangler.toml
- Uncomment the routes section in wrangler.toml
- Replace `yourdomain.com` with your actual domain

### 6. Environment Variables (Optional)

Add to your `.env.local` file:
```
VITE_BREVO_WORKER_URL=/api/brevo
```

For local development with the worker:
```
VITE_BREVO_WORKER_URL=http://localhost:8787/api/brevo
```

## Local Development

To test the worker locally:
```bash
cd workers
wrangler dev
```

This will start the worker on `http://localhost:8787`

## How it works

1. Frontend makes request to `/api/brevo/*`
2. Cloudflare Worker receives the request
3. Worker adds the Brevo API key and forwards to Brevo's API
4. Worker returns the response to frontend with proper CORS headers

## Alternative: Using Functions Directory

If you prefer, you can also use Cloudflare Pages Functions:

1. Create a `functions/api/brevo/[[path]].js` file in your project root
2. Copy the worker code into that file
3. Deploy with your Pages project

This way, the function deploys automatically with your Pages site.
