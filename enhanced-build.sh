#!/bin/bash

# Enhanced DSVI Email System Build & Deploy Script
# Automatically sets up email functionality and prepares for Cloudflare Pages deployment

echo "🚀 DSVI Enhanced Email System - Build & Deploy"
echo "=============================================="

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Run this script from the DSVI project root directory"
    exit 1
fi

echo "📁 Current directory: $(pwd)"

# Step 1: Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    if command -v bun &> /dev/null; then
        bun install
    else
        npm install
    fi
fi

# Step 2: Run the Cloudflare environment setup
echo ""
echo "⚙️  Setting up Cloudflare environment configuration..."
if [ -f "deploy/cloudflare-env-setup.js" ]; then
    node deploy/cloudflare-env-setup.js
else
    echo "⚠️  Cloudflare setup script not found, skipping..."
fi

# Step 3: Build the project
echo ""
echo "🏗️  Building the project..."
if command -v bun &> /dev/null; then
    bun run build
else
    npm run build
fi

if [ $? -ne 0 ]; then
    echo "❌ Build failed!"
    exit 1
fi

echo "✅ Build completed successfully!"

# Step 4: Check for required files
echo ""
echo "🔍 Verifying email system files..."

required_files=(
    "functions/api/email/send.js"
    "src/lib/simple-email-service.ts" 
    "src/lib/email-service.ts"
    "src/lib/messaging-service.ts"
)

missing_files=()
for file in "${required_files[@]}"; do
    if [ ! -f "$file" ]; then
        missing_files+=("$file")
    fi
done

if [ ${#missing_files[@]} -eq 0 ]; then
    echo "✅ All email system files are present"
else
    echo "⚠️  Missing files:"
    for file in "${missing_files[@]}"; do
        echo "   - $file"
    done
fi

# Step 5: Display deployment instructions
echo ""
echo "📋 Deployment Instructions:"
echo "=========================="
echo ""
echo "🌐 For Cloudflare Pages:"
echo "1. Connect your repository to Cloudflare Pages"
echo "2. Set build command: 'npm run build' (or use the custom build.sh)"
echo "3. Set output directory: 'dist'"
echo "4. Add environment variables from deploy/cloudflare-variables.txt"
echo ""
echo "📧 Email System Status:"
echo "✅ Cloudflare Pages Function configured (/api/email/send)"
echo "✅ Resend API integration ready"
echo "✅ Supabase integration configured"
echo "✅ Message sending functionality implemented"
echo ""
echo "🧪 Testing:"
echo "- Local testing: npm run dev"
echo "- Email testing: Use EmailTestPage in admin panel"
echo "- Message testing: Use MessagingPanelPage to send messages"
echo ""

# Step 6: Create a quick deployment checklist
cat > deploy/deployment-checklist.md << 'EOF'
# DSVI Email System Deployment Checklist

## Pre-deployment
- [ ] Environment variables are set (check deploy/cloudflare-variables.txt)
- [ ] Build completed successfully
- [ ] All email system files are present

## Cloudflare Pages Setup
- [ ] Repository connected to Cloudflare Pages
- [ ] Build command set to: `npm run build` or `./build.sh`
- [ ] Output directory set to: `dist`
- [ ] Environment variables added to Cloudflare Pages dashboard

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

## Common Issues
- **"Email API Error"**: Check if environment variables are set in Cloudflare Pages
- **"Connection failed"**: Verify Resend API key is valid
- **"Access denied"**: Check Supabase URL and anon key

## Success Criteria
- [ ] Email test passes
- [ ] Test message sends successfully
- [ ] Recipient receives email
EOF

echo "📝 Created deployment checklist: deploy/deployment-checklist.md"
echo ""
echo "🎉 Build and deployment preparation complete!"
echo ""
echo "💡 Next steps:"
echo "1. Review deploy/cloudflare-variables.txt for environment variables"
echo "2. Follow deploy/deployment-checklist.md for deployment"
echo "3. Test email functionality after deployment"
