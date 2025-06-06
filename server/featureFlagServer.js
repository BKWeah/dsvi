#!/usr/bin/env node

/**
 * DSVI Feature Flag API Server
 * 
 * This server provides API endpoints for the web interface to read/write
 * feature flags directly to the JSON file.
 */

const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.FEATURE_FLAG_PORT || 3001;
const CONFIG_PATH = path.join(__dirname, '../src/config/featureFlags.json');

// Middleware
app.use(cors({ origin: 'http://localhost:8080' })); // Explicitly allow frontend origin
app.use(express.json());

// Helper functions
function loadConfig() {
  try {
    const configData = fs.readFileSync(CONFIG_PATH, 'utf8');
    return JSON.parse(configData);
  } catch (error) {
    console.error('Error loading config:', error.message);
    throw error;
  }
}

function saveConfig(config) {
  try {
    config.lastUpdated = new Date().toISOString();
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2));
    console.log(`✅ Configuration saved at ${new Date().toLocaleString()}`);
    return config;
  } catch (error) {
    console.error('Error saving config:', error.message);
    throw error;
  }
}

// API Routes

// GET /api/feature-flags - Get current configuration
app.get('/api/feature-flags', (req, res) => {
  try {
    const config = loadConfig();
    res.json(config);
  } catch (error) {
    res.status(500).json({ error: 'Failed to load configuration' });
  }
});

// POST /api/feature-flags - Update entire configuration
app.post('/api/feature-flags', (req, res) => {
  try {
    const newConfig = req.body;
    const savedConfig = saveConfig(newConfig);
    res.json(savedConfig);
  } catch (error) {
    res.status(500).json({ error: 'Failed to save configuration' });
  }
});

// PATCH /api/feature-flags/toggle - Toggle a specific feature
app.patch('/api/feature-flags/toggle', (req, res) => {
  try {
    const { featurePath } = req.body;
    if (!featurePath) {
      return res.status(400).json({ error: 'featurePath is required' });
    }

    const config = loadConfig();
    const pathParts = featurePath.split('.');
    
    // Determine if this is a navigation feature or regular feature
    let current;
    if (pathParts[0] === 'navigation') {
      current = config.navigation;
      pathParts.shift(); // Remove 'navigation' from the path
    } else {
      current = config.features;
    }
    
    // Navigate to the target feature
    for (let i = 0; i < pathParts.length; i++) {
      const part = pathParts[i];
      
      if (i === pathParts.length - 1) {
        // This is the final part, toggle it
        if (current[part] && current[part].enabled !== undefined) {
          current[part].enabled = !current[part].enabled;
          const savedConfig = saveConfig(config);
          return res.json({ 
            success: true, 
            featurePath, 
            enabled: current[part].enabled,
            config: savedConfig 
          });
        } else {
          return res.status(404).json({ error: `Feature '${featurePath}' not found` });
        }
      } else {
        // Navigate deeper
        current = current[part];
        if (pathParts[i + 1] && current.subFeatures) {
          current = current.subFeatures;
        }
      }
    }
    
    res.status(404).json({ error: `Feature '${featurePath}' not found` });
  } catch (error) {
    res.status(500).json({ error: 'Failed to toggle feature' });
  }
});

// GET /api/feature-flags/status - Get status information
app.get('/api/feature-flags/status', (req, res) => {
  try {
    const config = loadConfig();
    const enabledFeatures = Object.values(config.features).filter(f => f.enabled).length;
    const totalFeatures = Object.keys(config.features).length;
    const enabledRoutes = Object.entries(config.features)
      .filter(([_, feature]) => feature.enabled && feature.route)
      .map(([_, feature]) => feature.route);

    res.json({
      version: config.version,
      lastUpdated: config.lastUpdated,
      enabledFeatures,
      totalFeatures,
      enabledRoutes,
      defaultRoute: config.routing.defaultRedirect
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get status' });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 DSVI Feature Flag API Server running on http://localhost:${PORT}`);
  console.log(`📁 Config file: ${CONFIG_PATH}`);
  console.log(`⚡ Ready to serve feature flag requests!`);
});

module.exports = app;
