#!/usr/bin/env node

/**
 * DSVI Feature Flag Server Startup Helper
 * 
 * This script checks if the feature flag server is running and starts it if needed.
 */

import { spawn, exec } from 'child_process';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import http from 'http';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const SERVER_PORT = 3001;
const SERVER_DIR = join(__dirname, '../server');
const SERVER_SCRIPT = join(SERVER_DIR, 'featureFlagServer.js');

function checkServerRunning() {
  return new Promise((resolve) => {
    const req = http.get(`http://localhost:${SERVER_PORT}/health`, (res) => {
      resolve(true);
    }).on('error', () => {
      resolve(false);
    });
    
    req.setTimeout(1000, () => {
      req.destroy();
      resolve(false);
    });
  });
}

async function installServerDependencies() {
  return new Promise((resolve, reject) => {
    console.log('📦 Installing server dependencies...');
    exec('npm install', { cwd: SERVER_DIR }, (error, stdout, stderr) => {
      if (error) {
        console.error('❌ Failed to install dependencies:', error);
        reject(error);
      } else {
        console.log('✅ Server dependencies installed');
        resolve(stdout);
      }
    });
  });
}

async function startServer() {
  try {
    const packageJsonExists = fs.existsSync(join(SERVER_DIR, 'package.json'));
    const nodeModulesExists = fs.existsSync(join(SERVER_DIR, 'node_modules'));
    
    if (packageJsonExists && !nodeModulesExists) {
      await installServerDependencies();
    }

    console.log('🚀 Starting feature flag server...');
    const serverProcess = spawn('node', [SERVER_SCRIPT], {
      cwd: SERVER_DIR,
      detached: true,
      stdio: 'inherit'
    });

    serverProcess.unref();    
    // Wait a moment for server to start
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const isRunning = await checkServerRunning();
    if (isRunning) {
      console.log('✅ Feature flag server started successfully');
      return true;
    } else {
      console.log('❌ Failed to start server');
      return false;
    }
  } catch (error) {
    console.error('❌ Error starting server:', error);
    return false;
  }
}

async function main() {
  const isRunning = await checkServerRunning();
  
  if (isRunning) {
    console.log('✅ Feature flag server is already running');
    return;
  }
  
  console.log('🔍 Server not running, starting...');
  await startServer();
}

// Run main function if this is the entry point
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}