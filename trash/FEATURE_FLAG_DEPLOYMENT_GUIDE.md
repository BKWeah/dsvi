# 🚀 DSVI Feature Flag System - Deployment Guide

## 📋 Overview

The DSVI Feature Flag System allows you to enable or disable specific features and components in your webapp without code changes. This is perfect for phased rollouts, A/B testing, and controlling what users see in production.

## 🏗️ Architecture

### Core Components

1. **FeatureFlagContext** - React context that manages feature flag state
2. **FeatureGate** - Component that conditionally renders content based on flags
3. **FeatureRouting** - Handles routing based on enabled features
4. **DeploymentManagePage** - UI for managing feature flags at `/deploy`
5. **Configuration JSON** - Centralized feature flag configuration

### File Structure
```
src/
├── config/
│   └── featureFlags.json           # Main configuration file
├── contexts/
│   └── FeatureFlagContext.tsx      # Feature flag React context
├── components/
│   └── feature-flags/
│       ├── FeatureGate.tsx         # Conditional rendering component
│       ├── FeatureRouting.tsx      # Feature-aware routing
│       └── FeatureAwareBottomAppBar.tsx
├── pages/
│   └── deploy/
│       └── DeploymentManagePage.tsx # Feature management UI
└── layouts/
    └── FeatureAwareDSVIAdminLayout.tsx
```

## 🎯 How to Use

### 1. Access the Deployment Panel

Visit `/deploy` in your browser to access the feature management interface.

**Requirements:**
- Must be logged in as DSVI_ADMIN
- Navigate to: `http://your-domain.com/deploy`

### 2. Feature Management Options

#### Via Web UI (`/deploy`)
- Toggle individual features on/off
- Preview enabled routes
- Export/import configurations
- Real-time status updates

#### Via JSON File
Edit `src/config/featureFlags.json` directly:

```json
{
  "features": {
    "dashboard": {
      "enabled": true,
      "description": "Main admin dashboard",
      "route": "/dsvi-admin/dashboard",
      "subFeatures": {
        "statistics": { "enabled": true },
        "quickActions": { "enabled": false }
      }
    }
  }
}
```

### 3. Feature Hierarchy

Features are organized hierarchically:

**Top Level Features:**
- `dashboard` - Main dashboard page
- `schools` - School management system
- `requests` - School request management
- `subscriptions` - Subscription tracking
- `messaging` - Messaging system

**Sub-Features Example:**
- `schools.addSchool` - Add new school functionality
- `schools.schoolSettings.subscription` - Subscription management in school settings
- `dashboard.statistics` - Statistics cards on dashboard

## 🔧 Implementation Examples

### 1. Wrapping Components with FeatureGate

```tsx
import { FeatureGate } from '@/components/feature-flags/FeatureGate';

// Basic usage
<FeatureGate feature="dashboard.statistics">
  <StatisticsCards />
</FeatureGate>

// With fallback content
<FeatureGate 
  feature="schools.addSchool" 
  fallback={<div>Feature not available</div>}
>
  <AddSchoolButton />
</FeatureGate>

// Require multiple features
<FeatureGate 
  feature="messaging" 
  requireAll={["schools", "subscriptions"]}
>
  <AdvancedMessaging />
</FeatureGate>
```

### 2. Checking Features in Code

```tsx
import { useFeature } from '@/contexts/FeatureFlagContext';

function MyComponent() {
  const isDashboardEnabled = useFeature('dashboard');
  const canAddSchools = useFeature('schools.addSchool');
  
  return (
    <div>
      {isDashboardEnabled && <DashboardLink />}
      {canAddSchools && <AddSchoolButton />}
    </div>
  );
}
```

### 3. Feature-Aware Navigation

```tsx
import { useEnabledNavigation } from '@/contexts/FeatureFlagContext';

function Navigation() {
  const enabledNavigation = useEnabledNavigation();
  
  return (
    <nav>
      {enabledNavigation.map(navItem => (
        <Link key={navItem.key} to={navItem.route}>
          {navItem.key}
        </Link>
      ))}
    </nav>
  );
}
```

## 📦 Deployment Strategies

### Strategy 1: Gradual Feature Rollout

1. **Phase 1:** Enable core features only
   ```json
   {
     "dashboard": { "enabled": true },
     "schools": { "enabled": true },
     "requests": { "enabled": false },
     "subscriptions": { "enabled": false },
     "messaging": { "enabled": false }
   }
   ```

2. **Phase 2:** Add subscription management
   ```json
   {
     "subscriptions": { "enabled": true }
   }
   ```

3. **Phase 3:** Enable all features
   ```json
   {
     "requests": { "enabled": true },
     "messaging": { "enabled": true }
   }
   ```

### Strategy 2: Feature-Specific Testing

Enable only specific sub-features for testing:

```json
{
  "schools": {
    "enabled": true,
    "subFeatures": {
      "schoolsList": { "enabled": true },
      "addSchool": { "enabled": false },     // Disable for testing
      "schoolSettings": {
        "enabled": true,
        "subFeatures": {
          "subscription": { "enabled": true },
          "branding": { "enabled": false }    // Disable for testing
        }
      }
    }
  }
}
```

### Strategy 3: Role-Based Feature Sets

Create different configurations for different deployment environments:

**Development Config:**
```json
{
  "features": {
    "dashboard": { "enabled": true },
    "schools": { "enabled": true },
    "requests": { "enabled": true },
    "subscriptions": { "enabled": true },
    "messaging": { "enabled": true },
    "reports": { "enabled": true }        // Enable development features
  }
}
```

**Production Config:**
```json
{
  "features": {
    "dashboard": { "enabled": true },
    "schools": { "enabled": true },
    "requests": { "enabled": true },
    "subscriptions": { "enabled": true },
    "messaging": { "enabled": false },    // Disable until ready
    "reports": { "enabled": false }       // Keep development-only features off
  }
}
```

## 🎛️ Configuration Management

### 1. Local Storage Override

Feature flags are stored in browser localStorage and override the JSON file. This allows:
- Per-browser testing
- Temporary overrides
- User-specific configurations

### 2. Export/Import Configurations

Use the deployment panel to:
- **Export:** Download current configuration as JSON file
- **Import:** Upload a JSON configuration file
- **Reset:** Restore to default configuration

### 3. Configuration Backup

Always backup your configurations before major changes:

```bash
# Export current config from /deploy page
# Or copy the JSON file
cp src/config/featureFlags.json backups/featureFlags-backup-$(date +%Y%m%d).json
```

## 🔍 Debugging and Monitoring

### 1. Feature Debug Component

Use the FeatureDebug component to see feature states:

```tsx
import { FeatureDebug } from '@/components/feature-flags/FeatureGate';

// Shows feature state in bottom-right corner
<FeatureDebug feature="dashboard" showInProduction={false} />
```

### 2. Console Logging

Feature flag changes are logged to browser console:
```
Feature flags loaded from localStorage
Feature flags saved to localStorage
Dashboard feature enabled
```

### 3. Status Monitoring

Visit `/deploy` to see:
- Total enabled features
- Active navigation routes
- Default route configuration
- Last updated timestamp

## ⚠️ Best Practices

### 1. Feature Naming Convention

- Use descriptive, hierarchical names
- Follow the pattern: `section.subsection.component`
- Examples: `dashboard.statistics`, `schools.addSchool`, `messaging.templates`

### 2. Default States

- Set sensible defaults in the JSON file
- Enable core features by default
- Disable experimental features by default

### 3. Testing Workflow

1. Test with features disabled locally
2. Export configuration and test on staging
3. Gradually enable features in production
4. Monitor for issues and rollback if needed

### 4. Documentation

- Document feature dependencies
- Update descriptions in JSON file
- Track configuration changes

## 🚨 Troubleshooting

### Common Issues

1. **Feature not hiding:** Check if FeatureGate is properly wrapping the component
2. **Routes not working:** Ensure FeatureRouting is wrapping your Routes
3. **Navigation broken:** Verify navigation features are enabled
4. **Config not saving:** Check browser localStorage and console for errors

### Emergency Rollback

If something goes wrong:

1. **Quick Fix:** Visit `/deploy` and disable problematic features
2. **Nuclear Option:** Reset to defaults in deployment panel
3. **Manual Fix:** Edit `src/config/featureFlags.json` directly

### Debug Steps

1. Check browser console for error messages
2. Verify feature flags in `/deploy` status panel
3. Test with FeatureDebug component
4. Check localStorage in browser dev tools

## 📈 Advanced Features

### 1. Conditional Dependencies

```tsx
// Only show if both features are enabled
<FeatureGate 
  feature="messaging" 
  requireAll={["schools", "subscriptions"]}
>
  <AdvancedMessaging />
</FeatureGate>

// Show if any feature is enabled
<FeatureGate 
  feature="reports" 
  requireAny={["schools", "subscriptions", "messaging"]}
>
  <GeneralReports />
</FeatureGate>
```

### 2. Feature-Aware Routing

The system automatically redirects users away from disabled features:
- If dashboard is disabled, users go to the next available page
- If a feature is disabled, routes are automatically excluded
- Fallback routes ensure users always land somewhere useful

### 3. Mobile/Desktop Feature Control

Control navigation components separately:

```json
{
  "navigation": {
    "sidebar": { "enabled": true },         // Desktop sidebar
    "bottomAppBar": { "enabled": true },    // Mobile bottom bar
    "breadcrumbs": { "enabled": false }     // Breadcrumb navigation
  }
}
```

## 🎉 Conclusion

The DSVI Feature Flag System gives you complete control over your webapp's functionality. Use it to:

- Roll out features gradually
- Test components in isolation  
- Create different experiences for different users
- Quickly disable problematic features
- Maintain multiple deployment configurations

For any issues or questions, check the troubleshooting section or examine the code in the feature-flags directory.