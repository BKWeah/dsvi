#!/usr/bin/env node

/**
 * Cloudflare Environment Setup Script
 * Automatically configures environment variables for Cloudflare Pages
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read environment variables from .env file
function loadEnvFile() {
  const envPath = path.join(__dirname, '..', '.env');
  const envContent = fs.readFileSync(envPath, 'utf8');
  
  const envVars = {};
  envContent.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...valueParts] = trimmed.split('=');
      if (key && valueParts.length > 0) {
        envVars[key] = valueParts.join('=');
      }
    }
  });
  
  return envVars;
}

// Generate Cloudflare Pages environment configuration
function generateCloudflareConfig() {
  const envVars = loadEnvFile();
  
  const cloudflareConfig = {
    // Copy all VITE_ variables for frontend
    ...Object.fromEntries(
      Object.entries(envVars)
        .filter(([key]) => key.startsWith('VITE_'))
    ),
    
    // Ensure required email variables are set
    VITE_SUPABASE_URL: envVars.VITE_SUPABASE_URL,
    VITE_SUPABASE_ANON_KEY: envVars.VITE_SUPABASE_ANON_KEY,
    VITE_DEFAULT_RESEND_API_KEY: envVars.VITE_DEFAULT_RESEND_API_KEY,
  };
  
  return cloudflareConfig;
}

// Create deployment instructions
function createDeploymentInstructions() {
  const config = generateCloudflareConfig();
  
  const instructions = `
# Cloudflare Pages Environment Variables
# Copy these to your Cloudflare Pages dashboard under Settings > Environment variables

## Production Environment Variables:
${Object.entries(config)
  .map(([key, value]) => `${key}=${value}`)
  .join('\n')}

## Instructions:
1. Go to your Cloudflare Pages dashboard
2. Select your project
3. Go to Settings > Environment variables
4. Add each variable above to the "Production" environment
5. Redeploy your site

## Required for Email Functionality:
- VITE_SUPABASE_URL: Your Supabase project URL
- VITE_SUPABASE_ANON_KEY: Your Supabase anonymous key
- VITE_DEFAULT_RESEND_API_KEY: Your Resend API key for email sending

## Optional:
- Add preview/development environment variables as needed
`;

  fs.writeFileSync(
    path.join(__dirname, 'cloudflare-variables.txt'),
    instructions
  );
  
  console.log('✅ Cloudflare deployment instructions created at deploy/cloudflare-variables.txt');
}

// Create a Cloudflare-compatible wrangler.toml
function updateWranglerConfig() {
  const envVars = loadEnvFile();
  
  const wranglerContent = `name = "dsvi-email-functions"
compatibility_date = "2024-03-08"
compatibility_flags = ["nodejs_compat"]

[vars]
VITE_SUPABASE_URL = "${envVars.VITE_SUPABASE_URL || ''}"
VITE_SUPABASE_ANON_KEY = "${envVars.VITE_SUPABASE_ANON_KEY || ''}"
VITE_DEFAULT_RESEND_API_KEY = "${envVars.VITE_DEFAULT_RESEND_API_KEY || ''}"

[[pages]]
functions = "functions"
`;

  fs.writeFileSync(
    path.join(__dirname, '..', 'wrangler.toml'),
    wranglerContent
  );
  
  console.log('✅ Updated wrangler.toml with current environment variables');
}

// Main execution
if (import.meta.url === `file://${process.argv[1]}`) {
  console.log('🚀 Setting up Cloudflare Pages deployment configuration...');
  
  try {
    createDeploymentInstructions();
    updateWranglerConfig();
    
    console.log('');
    console.log('🎉 Cloudflare Pages setup complete!');
    console.log('');
    console.log('📝 Next steps:');
    console.log('1. Check deploy/cloudflare-variables.txt for environment variables');
    console.log('2. Add these variables to your Cloudflare Pages dashboard');
    console.log('3. Deploy your site');
    console.log('');
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    process.exit(1);
  }
}

export {
  loadEnvFile,
  generateCloudflareConfig,
  createDeploymentInstructions,
  updateWranglerConfig
};
