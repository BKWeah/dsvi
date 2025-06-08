#!/bin/bash

# DSVI Email System Test & Deploy Script
echo "🚀 DSVI Email System - Test & Deploy"
echo "=================================="

if [ ! -f "package.json" ]; then
    echo "❌ Error: Run this script from the DSVI project root directory"
    exit 1
fi

echo "📁 Current directory: $(pwd)"
echo ""
echo "🧪 Step 1: Testing email system locally..."
echo "Starting Cloudflare Pages dev server..."

npx wrangler pages dev -- npm run dev &
DEV_PID=$!

sleep 5
echo "✅ Development server started (PID: $DEV_PID)"
echo ""
echo "🌐 Your development server should now be running"
echo "📧 To test: Add SimpleEmailTest component to any admin page"
echo ""
read -p "Press Enter after testing..."

kill $DEV_PID 2>/dev/null
echo "🛑 Development server stopped"

echo ""
echo "📦 Step 2: Preparing for deployment..."

if [ -n "$(git status --porcelain)" ]; then
    git add .
    read -p "💬 Enter commit message: " COMMIT_MSG
    if [ -z "$COMMIT_MSG" ]; then
        COMMIT_MSG="feat: Implement simple email system with Brevo SMTP"
    fi
    git commit -m "$COMMIT_MSG"
    echo "✅ Changes committed"
fi

echo ""
echo "🚀 Step 3: Deploying to Cloudflare Pages..."
git push

echo ""
echo "✅ Deployment complete!"
echo ""
echo "🔧 Next Steps:"
echo "1. Go to your Cloudflare Pages dashboard"
echo "2. Add environment variables:"
echo "   - BREVO_API_KEY: YOUR_BREVO_API_KEY_HERE"
echo "   - BREVO_SMTP_USERNAME: YOUR_SMTP_USERNAME_HERE"
echo "   - BREVO_SMTP_PASSWORD: YOUR_SMTP_PASSWORD_HERE"
echo "3. Test on your live site"
echo ""
echo "🎉 Email system ready!"
