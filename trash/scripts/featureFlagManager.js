#!/usr/bin/env node

/**
 * DSVI Feature Flag Manager CLI Tool
 * 
 * Usage:
 *   node featureFlagManager.js --enable dashboard
 *   node featureFlagManager.js --disable schools.addSchool
 *   node featureFlagManager.js --toggle messaging
 *   node featureFlagManager.js --list
 *   node featureFlagManager.js --reset
 *   node featureFlagManager.js --status
 */

const fs = require('fs');
const path = require('path');

const CONFIG_PATH = path.join(__dirname, '../src/config/featureFlags.json');

// Helper functions
function loadConfig() {
  try {
    const configData = fs.readFileSync(CONFIG_PATH, 'utf8');
    return JSON.parse(configData);
  } catch (error) {
    console.error('❌ Error loading config:', error.message);
    process.exit(1);
  }
}

function saveConfig(config) {
  try {
    config.lastUpdated = new Date().toISOString();
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2));
    console.log('✅ Configuration saved successfully');
  } catch (error) {
    console.error('❌ Error saving config:', error.message);
    process.exit(1);
  }
}

function setFeatureFlag(config, featurePath, enabled) {
  const pathParts = featurePath.split('.');
  let current = config.features;
  
  for (let i = 0; i < pathParts.length; i++) {
    const part = pathParts[i];
    
    if (i === pathParts.length - 1) {
      // This is the final part, set it
      if (current[part] && current[part].enabled !== undefined) {
        current[part].enabled = enabled;
        return true;
      } else {
        console.error(`❌ Feature '${featurePath}' not found`);
        return false;
      }
    } else {
      // Navigate deeper
      if (current[part]) {
        current = current[part];
        if (pathParts[i + 1] && current.subFeatures) {
          current = current.subFeatures;
        }
      } else {
        console.error(`❌ Feature path '${featurePath}' not found`);
        return false;
      }
    }
  }
  
  return false;
}
function getFeatureFlag(config, featurePath) {
  const pathParts = featurePath.split('.');
  let current = config.features;
  
  for (let i = 0; i < pathParts.length; i++) {
    const part = pathParts[i];
    
    if (i === pathParts.length - 1) {
      return current[part] ? current[part].enabled : undefined;
    } else {
      if (current[part]) {
        current = current[part];
        if (pathParts[i + 1] && current.subFeatures) {
          current = current.subFeatures;
        }
      } else {
        return undefined;
      }
    }
  }
  
  return undefined;
}

function listFeatures(features, prefix = '', indent = 0) {
  const indentStr = '  '.repeat(indent);
  
  Object.entries(features).forEach(([key, feature]) => {
    const fullPath = prefix ? `${prefix}.${key}` : key;
    const status = feature.enabled ? '✅' : '❌';
    const route = feature.route ? ` (${feature.route})` : '';
    
    console.log(`${indentStr}${status} ${key}${route}`);
    
    if (feature.description) {
      console.log(`${indentStr}   ${feature.description}`);
    }
    
    if (feature.subFeatures) {
      listFeatures(feature.subFeatures, fullPath, indent + 1);
    }
  });
}

function showStatus(config) {
  const enabledFeatures = Object.values(config.features).filter(f => f.enabled).length;
  const totalFeatures = Object.keys(config.features).length;
  const enabledRoutes = Object.entries(config.features)
    .filter(([_, feature]) => feature.enabled && feature.route)
    .map(([_, feature]) => feature.route);

  console.log('\n📊 DSVI Feature Flag Status');
  console.log('============================');
  console.log(`Version: ${config.version}`);
  console.log(`Last Updated: ${new Date(config.lastUpdated).toLocaleString()}`);
  console.log(`Enabled Features: ${enabledFeatures}/${totalFeatures}`);
  console.log(`Active Routes: ${enabledRoutes.length}`);
  console.log(`Default Route: ${config.routing.defaultRedirect}`);
  
  if (enabledRoutes.length > 0) {
    console.log('\n🔗 Active Routes:');
    enabledRoutes.forEach((route, index) => {
      console.log(`  ${index + 1}. ${route}`);
    });
  }
  
  console.log('\n🎯 Feature Overview:');
  listFeatures(config.features);
}
// CLI argument parsing
const args = process.argv.slice(2);

if (args.length === 0) {
  console.log(`
🚀 DSVI Feature Flag Manager

Usage:
  node featureFlagManager.js [command] [feature]

Commands:
  --enable <feature>     Enable a feature
  --disable <feature>    Disable a feature  
  --toggle <feature>     Toggle a feature on/off
  --list                 List all features and their status
  --status               Show detailed status information
  --reset                Reset all features to defaults

Examples:
  node featureFlagManager.js --enable dashboard
  node featureFlagManager.js --disable schools.addSchool
  node featureFlagManager.js --toggle messaging.templates
  node featureFlagManager.js --list
  node featureFlagManager.js --status
  `);
  process.exit(0);
}

const command = args[0];
const featurePath = args[1];
const config = loadConfig();

switch (command) {
  case '--enable':
    if (!featurePath) {
      console.error('❌ Please specify a feature to enable');
      process.exit(1);
    }
    if (setFeatureFlag(config, featurePath, true)) {
      console.log(`✅ Enabled feature: ${featurePath}`);
      saveConfig(config);
    }
    break;

  case '--disable':
    if (!featurePath) {
      console.error('❌ Please specify a feature to disable');
      process.exit(1);
    }
    if (setFeatureFlag(config, featurePath, false)) {
      console.log(`❌ Disabled feature: ${featurePath}`);
      saveConfig(config);
    }
    break;

  case '--toggle':
    if (!featurePath) {
      console.error('❌ Please specify a feature to toggle');
      process.exit(1);
    }
    const currentState = getFeatureFlag(config, featurePath);
    if (currentState !== undefined) {
      const newState = !currentState;
      if (setFeatureFlag(config, featurePath, newState)) {
        console.log(`🔄 Toggled feature: ${featurePath} → ${newState ? 'enabled' : 'disabled'}`);
        saveConfig(config);
      }
    } else {
      console.error(`❌ Feature '${featurePath}' not found`);
    }
    break;
  case '--list':
    console.log('\n🎯 All Features:');
    console.log('================');
    listFeatures(config.features);
    break;

  case '--status':
    showStatus(config);
    break;

  case '--reset':
    console.log('⚠️  This will reset all feature flags to their default values.');
    console.log('This action cannot be undone.');
    
    // Simple confirmation (in a real CLI tool, you might use a proper prompt library)
    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    rl.question('Are you sure? (y/N): ', (answer) => {
      if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
        // Reset logic would go here - for now just show message
        console.log('🔄 Reset functionality would be implemented here');
        console.log('💡 Tip: You can restore from the default config file');
      } else {
        console.log('❌ Reset cancelled');
      }
      rl.close();
    });
    break;

  default:
    console.error(`❌ Unknown command: ${command}`);
    console.log('Use --help to see available commands');
    process.exit(1);
}