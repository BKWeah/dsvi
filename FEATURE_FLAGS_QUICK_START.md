# 🚀 DSVI Feature Flag System - Quick Start Guide

## 🎯 What is this?

The DSVI Feature Flag System allows you to enable/disable webapp features without code changes. Perfect for phased rollouts, testing, and controlling production deployments.

## 🚀 Quick Start

### 1. Access Feature Management

**Web Interface (Recommended):**
```
http://localhost:5173/deploy
```
- Visual toggle switches for all features
- Real-time preview of enabled routes
- Export/import configurations
- Requires DSVI_ADMIN login

**Command Line:**
```bash
# List all features and their status
npm run features:list

# Enable a feature
npm run features:enable dashboard

# Disable a feature  
npm run features:disable schools.addSchool

# Toggle a feature on/off
npm run features:toggle messaging

# Show detailed status
npm run features:status
```

### 2. Example: Gradual Feature Rollout

**Phase 1 - Core Features Only:**
```bash
npm run features:enable dashboard
npm run features:enable schools
npm run features:disable requests
npm run features:disable subscriptions
npm run features:disable messaging
```

**Phase 2 - Add Subscription Management:**
```bash
npm run features:enable subscriptions
```

**Phase 3 - Full System:**
```bash
npm run features:enable requests
npm run features:enable messaging
```

## 📁 Feature Structure

### Main Features
- **`dashboard`** - Admin dashboard with statistics
- **`schools`** - School management system  
- **`requests`** - School registration requests
- **`subscriptions`** - Subscription tracking
- **`messaging`** - Email communication system

### Sub-Features Examples
- **`dashboard.statistics`** - Statistics cards on dashboard
- **`schools.addSchool`** - Add new school functionality
- **`schools.schoolSettings.subscription`** - Subscription settings
- **`messaging.templates`** - Email template management

## 💡 Common Use Cases

### 1. Hide Incomplete Features
```bash
# Disable messaging until it's ready
npm run features:disable messaging
```

### 2. Test Specific Components
```bash
# Disable just the add school button
npm run features:disable schools.addSchool
```

### 3. Create Demo Environment
```bash
# Enable only dashboard and schools for demo
npm run features:enable dashboard
npm run features:enable schools
npm run features:disable requests
npm run features:disable subscriptions
npm run features:disable messaging
```

### 4. Emergency Rollback
```bash
# Quickly disable problematic feature
npm run features:disable subscriptions
```

## 🔧 Direct JSON Configuration

Edit `src/config/featureFlags.json`:

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

## 🎛️ Deployment Interface

Visit `/deploy` for a comprehensive web interface:

- **Features Tab:** Toggle all features with visual switches
- **Navigation Tab:** Control sidebar/mobile navigation
- **JSON Editor:** Edit raw configuration
- **Preview Tab:** See what's enabled/disabled
- **Export/Import:** Backup and restore configurations

## 🔄 How Routing Works

When features are disabled:
- Users are automatically redirected to the next available page
- Navigation menus only show enabled features  
- URLs for disabled features redirect to default route
- Mobile bottom bar adapts to show only enabled features

Example: If dashboard is disabled, login redirects to schools page instead.

## 📱 Mobile Support

The mobile bottom navigation automatically adapts:
- Shows only enabled features (max 4 icons)
- Hides add buttons if `schools.addSchool` is disabled
- Gracefully handles 0 features enabled

## 🚨 Emergency Procedures

### Something Broke?

1. **Quick Fix:** Visit `/deploy` and disable the problematic feature
2. **Nuclear Option:** Click "Reset to Defaults" in deploy panel
3. **Command Line:** `npm run features:disable problematic-feature`

### All Features Disabled?

```bash
# Re-enable core features
npm run features:enable dashboard
npm run features:enable schools
```

### Lost Configuration?

1. Check browser localStorage (persists between sessions)
2. Restore from backup in `/deploy` interface  
3. Reset to defaults and reconfigure

## 🎯 Best Practices

### 1. Test Locally First
```bash
# Disable feature locally
npm run features:disable new-feature

# Test your app
npm run dev

# If good, deploy with feature disabled
```

### 2. Gradual Rollouts
- Start with core features only
- Enable one feature at a time
- Monitor for issues before enabling next

### 3. Backup Configurations
- Export config before major changes in `/deploy`
- Keep feature descriptions up to date
- Document feature dependencies

### 4. Use Descriptive Names
```bash
# Good
npm run features:disable schools.subscription.renewal

# Not good  
npm run features:disable feature1
```

## 📊 Monitoring

### Check Current Status
```bash
npm run features:status
```

Shows:
- Total enabled features
- Active navigation routes
- Default redirect route
- Feature overview

### Debug Mode

Add to any component:
```tsx
import { FeatureDebug } from '@/components/feature-flags/FeatureGate';

<FeatureDebug feature="dashboard" />
```

Shows feature state in bottom-right corner.

## 🔗 Integration Examples

### Wrap Components
```tsx
import { FeatureGate } from '@/components/feature-flags/FeatureGate';

<FeatureGate feature="dashboard.statistics">
  <StatisticsCards />
</FeatureGate>
```

### Check in Code
```tsx
import { useFeature } from '@/contexts/FeatureFlagContext';

const isDashboardEnabled = useFeature('dashboard');
if (isDashboardEnabled) {
  // Show dashboard link
}
```

### Require Multiple Features
```tsx
<FeatureGate 
  feature="messaging" 
  requireAll={["schools", "subscriptions"]}
>
  <AdvancedFeature />
</FeatureGate>
```

## 🎉 Production Ready

This system is:
- ✅ **Non-destructive** - No code changes needed
- ✅ **Persistent** - Settings survive browser refresh
- ✅ **Instant** - Changes apply immediately
- ✅ **Safe** - Easy rollback if issues occur
- ✅ **Flexible** - Enable/disable individual components
- ✅ **User-friendly** - Visual interface + CLI options

Perfect for controlled rollouts, A/B testing, and production deployments!

---

**Need Help?** 
- Check `/deploy` interface for visual controls
- Run `npm run features:status` to see current state
- Look at `FEATURE_FLAG_DEPLOYMENT_GUIDE.md` for detailed documentation