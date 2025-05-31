import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Import the default feature flags configuration
// import defaultFeatureFlags from '@/config/featureFlags.json';

// Default configuration (inline to avoid JSON import issues)
const defaultFeatureFlags = {
  "version": "1.0.0",
  "lastUpdated": "2025-05-31T00:00:00Z",
  "features": {
    "dashboard": {
      "enabled": true,
      "description": "Main admin dashboard with statistics and overview",
      "route": "/dsvi-admin/dashboard",
      "priority": 1,
      "icon": "BarChart3",
      "subFeatures": {
        "statistics": {
          "enabled": true,
          "description": "Dashboard statistics cards"
        },
        "recentActivity": {
          "enabled": true,
          "description": "Recent activity feed"
        },
        "quickActions": {
          "enabled": true,
          "description": "Quick action buttons"
        },
        "alerts": {
          "enabled": true,
          "description": "System alerts and notifications"
        },
        "packageDistribution": {
          "enabled": true,
          "description": "Package distribution chart"
        }
      }
    },
    "schools": {
      "enabled": true,
      "description": "School management system",
      "route": "/dsvi-admin/schools",
      "priority": 2,
      "icon": "School",
      "subFeatures": {
        "schoolsList": {
          "enabled": true,
          "description": "View all schools list"
        },
        "addSchool": {
          "enabled": true,
          "description": "Add new school functionality"
        },
        "searchFilter": {
          "enabled": true,
          "description": "Search and filter schools"
        },
        "schoolActions": {
          "enabled": true,
          "description": "School action buttons (edit, view, settings)"
        },
        "schoolSettings": {
          "enabled": true,
          "description": "Individual school settings",
          "subFeatures": {
            "basicInfo": {
              "enabled": true,
              "description": "Basic school information editing"
            },
            "subscription": {
              "enabled": true,
              "description": "Subscription management"
            },
            "branding": {
              "enabled": true,
              "description": "School branding and theme settings"
            },
            "adminAssignments": {
              "enabled": true,
              "description": "School admin assignments"
            },
            "contentManagement": {
              "enabled": true,
              "description": "School content management access"
            }
          }
        },
        "inviteAdmin": {
          "enabled": true,
          "description": "Invite school admin functionality"
        }
      }
    },
    "requests": {
      "enabled": true,
      "description": "School access requests management",
      "route": "/dsvi-admin/requests",
      "priority": 3,
      "icon": "Users",
      "subFeatures": {
        "pendingRequests": {
          "enabled": true,
          "description": "View pending school requests"
        },
        "requestDetails": {
          "enabled": true,
          "description": "Detailed request information"
        },
        "approvalActions": {
          "enabled": true,
          "description": "Approve/reject request actions"
        },
        "adminNotes": {
          "enabled": true,
          "description": "Admin notes for requests"
        },
        "requestHistory": {
          "enabled": true,
          "description": "Historical request data"
        }
      }
    },
    "subscriptions": {
      "enabled": true,
      "description": "Subscription tracking and management",
      "route": "/dsvi-admin/subscriptions",
      "priority": 4,
      "icon": "CreditCard",
      "subFeatures": {
        "subscriptionList": {
          "enabled": true,
          "description": "List all school subscriptions"
        },
        "statusTracking": {
          "enabled": true,
          "description": "Subscription status tracking"
        },
        "renewalActions": {
          "enabled": true,
          "description": "Manual renewal functionality"
        },
        "expiryAlerts": {
          "enabled": true,
          "description": "Expiration alerts and warnings"
        },
        "revenueTracking": {
          "enabled": true,
          "description": "Revenue calculation and tracking"
        },
        "packageManagement": {
          "enabled": true,
          "description": "Package type management"
        }
      }
    },
    "messaging": {
      "enabled": true,
      "description": "Messaging and communication system",
      "route": "/dsvi-admin/messaging",
      "priority": 5,
      "icon": "MessageSquare",
      "subFeatures": {
        "composeMessage": {
          "enabled": true,
          "description": "Compose new messages"
        },
        "messageTemplates": {
          "enabled": true,
          "description": "Message template management"
        },
        "messageHistory": {
          "enabled": true,
          "description": "Message history and tracking"
        },
        "emailSettings": {
          "enabled": true,
          "description": "Email configuration settings"
        },
        "systemTesting": {
          "enabled": true,
          "description": "Messaging system testing tools"
        },
        "recipientSelection": {
          "enabled": true,
          "description": "Select message recipients"
        }
      }
    },
    "reports": {
      "enabled": false,
      "description": "Reports and analytics system",
      "route": "/dsvi-admin/reports",
      "priority": 6,
      "icon": "FileText",
      "subFeatures": {
        "dataExport": {
          "enabled": false,
          "description": "Export data to CSV/PDF"
        },
        "activityLogs": {
          "enabled": false,
          "description": "View system activity logs"
        },
        "performanceMetrics": {
          "enabled": false,
          "description": "Performance metrics and analytics"
        },
        "customReports": {
          "enabled": false,
          "description": "Custom report builder"
        }
      }
    }
  },
  "navigation": {
    "sidebar": {
      "enabled": true,
      "description": "Desktop sidebar navigation"
    },
    "bottomAppBar": {
      "enabled": true,
      "description": "Mobile bottom app bar navigation"
    },
    "breadcrumbs": {
      "enabled": true,
      "description": "Breadcrumb navigation"
    }
  },
  "routing": {
    "defaultRedirect": "/dsvi-admin/dashboard",
    "fallbackRoute": "/dsvi-admin/schools",
    "description": "Routing configuration for feature-based redirects"
  },
  "ui": {
    "animations": {
      "enabled": true,
      "description": "UI animations and transitions"
    },
    "darkMode": {
      "enabled": true,
      "description": "Dark mode toggle"
    },
    "loadingStates": {
      "enabled": true,
      "description": "Loading spinners and states"
    }
  }
};

// Types for feature flag system
export interface SubFeature {
  enabled: boolean;
  description: string;
  subFeatures?: { [key: string]: SubFeature };
}

export interface Feature {
  enabled: boolean;
  description: string;
  route?: string;
  priority?: number;
  icon?: string;
  subFeatures?: { [key: string]: SubFeature };
}

export interface FeatureFlagConfig {
  version: string;
  lastUpdated: string;
  features: { [key: string]: Feature };
  navigation: {
    sidebar: SubFeature;
    bottomAppBar: SubFeature;
    breadcrumbs: SubFeature;
  };
  routing: {
    defaultRedirect: string;
    fallbackRoute: string;
    description: string;
  };
  ui: {
    animations: SubFeature;
    darkMode: SubFeature;
    loadingStates: SubFeature;
  };
}

interface FeatureFlagContextType {
  config: FeatureFlagConfig;
  isFeatureEnabled: (featurePath: string) => boolean;
  toggleFeature: (featurePath: string) => void;
  updateConfig: (newConfig: FeatureFlagConfig) => void;
  getEnabledRoutes: () => string[];
  getDefaultRoute: () => string;
  saveConfig: () => Promise<void>;
  loadConfig: () => Promise<void>;
  resetToDefaults: () => void;
}

const FeatureFlagContext = createContext<FeatureFlagContextType | undefined>(undefined);

const STORAGE_KEY = 'dsvi_feature_flags';

export const useFeatureFlags = () => {
  const context = useContext(FeatureFlagContext);
  if (context === undefined) {
    throw new Error('useFeatureFlags must be used within a FeatureFlagProvider');
  }
  return context;
};

// Hook for checking if a specific feature is enabled
export const useFeature = (featurePath: string) => {
  const { isFeatureEnabled } = useFeatureFlags();
  return isFeatureEnabled(featurePath);
};

// Hook for getting enabled navigation items
export const useEnabledNavigation = () => {
  const { config, isFeatureEnabled } = useFeatureFlags();
  
  const enabledFeatures = Object.entries(config.features)
    .filter(([key, feature]) => feature.enabled && feature.route)
    .sort((a, b) => (a[1].priority || 999) - (b[1].priority || 999))
    .map(([key, feature]) => ({
      key,
      ...feature,
      route: feature.route!
    }));

  return enabledFeatures;
};

interface FeatureFlagProviderProps {
  children: ReactNode;
}

export const FeatureFlagProvider: React.FC<FeatureFlagProviderProps> = ({ children }) => {
  const [config, setConfig] = useState<FeatureFlagConfig>(defaultFeatureFlags as FeatureFlagConfig);

  // Load configuration from localStorage on mount
  useEffect(() => {
    loadConfig();
  }, []);

  // Check if a feature is enabled by path (e.g., "dashboard" or "schools.schoolSettings.subscription")
  const isFeatureEnabled = (featurePath: string): boolean => {
    const pathParts = featurePath.split('.');
    let current: any = config.features;

    for (const part of pathParts) {
      if (current[part] === undefined) {
        return false;
      }
      current = current[part];
      
      // If we hit a feature or subfeature, check if it's enabled
      if (current.enabled !== undefined) {
        if (!current.enabled) {
          return false;
        }
        // If there are more path parts, continue into subFeatures
        if (pathParts.indexOf(part) < pathParts.length - 1) {
          current = current.subFeatures || {};
        }
      }
    }

    return current.enabled !== undefined ? current.enabled : false;
  };

  // Toggle a feature on/off
  const toggleFeature = (featurePath: string) => {
    const pathParts = featurePath.split('.');
    const newConfig = JSON.parse(JSON.stringify(config)); // Deep clone
    
    // Determine if this is a navigation feature or regular feature
    let current: any;
    if (pathParts[0] === 'navigation') {
      current = newConfig.navigation;
      pathParts.shift(); // Remove 'navigation' from the path
    } else {
      current = newConfig.features;
    }
    
    for (let i = 0; i < pathParts.length; i++) {
      const part = pathParts[i];
      
      if (i === pathParts.length - 1) {
        // This is the final part, toggle it
        if (current[part] && current[part].enabled !== undefined) {
          current[part].enabled = !current[part].enabled;
        }
      } else {
        // Navigate deeper
        current = current[part];
        if (pathParts[i + 1] && current.subFeatures) {
          current = current.subFeatures;
        }
      }
    }

    newConfig.lastUpdated = new Date().toISOString();
    setConfig(newConfig);
    
    // Auto-save to localStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newConfig));
  };

  // Update entire configuration
  const updateConfig = (newConfig: FeatureFlagConfig) => {
    newConfig.lastUpdated = new Date().toISOString();
    setConfig(newConfig);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newConfig));
  };

  // Get all enabled routes for navigation
  const getEnabledRoutes = (): string[] => {
    return Object.entries(config.features)
      .filter(([_, feature]) => feature.enabled && feature.route)
      .sort((a, b) => (a[1].priority || 999) - (b[1].priority || 999))
      .map(([_, feature]) => feature.route!);
  };

  // Get the default route based on enabled features
  const getDefaultRoute = (): string => {
    const enabledRoutes = getEnabledRoutes();
    
    // Try to use the configured default redirect if that feature is enabled
    if (isFeatureEnabled('dashboard') && config.routing.defaultRedirect.includes('dashboard')) {
      return config.routing.defaultRedirect;
    }
    
    // Otherwise, use the first enabled route
    if (enabledRoutes.length > 0) {
      return enabledRoutes[0];
    }
    
    // Fallback to the configured fallback route
    return config.routing.fallbackRoute;
  };

  // Save configuration to localStorage and potentially to server
  const saveConfig = async (): Promise<void> => {
    try {
      const configToSave = {
        ...config,
        lastUpdated: new Date().toISOString()
      };
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(configToSave));
      setConfig(configToSave);
      
      // Future: Save to server/database
      console.log('Feature flags saved to localStorage');
    } catch (error) {
      console.error('Failed to save feature flags:', error);
      throw error;
    }
  };

  // Load configuration from localStorage
  const loadConfig = async (): Promise<void> => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const savedConfig = JSON.parse(saved);
        setConfig(savedConfig);
        console.log('Feature flags loaded from localStorage');
      } else {
        console.log('Using default feature flags');
      }
    } catch (error) {
      console.error('Failed to load feature flags, using defaults:', error);
      setConfig(defaultFeatureFlags as FeatureFlagConfig);
    }
  };

  // Reset to default configuration
  const resetToDefaults = () => {
    setConfig(defaultFeatureFlags as FeatureFlagConfig);
    localStorage.removeItem(STORAGE_KEY);
    console.log('Feature flags reset to defaults');
  };

  const contextValue: FeatureFlagContextType = {
    config,
    isFeatureEnabled,
    toggleFeature,
    updateConfig,
    getEnabledRoutes,
    getDefaultRoute,
    saveConfig,
    loadConfig,
    resetToDefaults,
  };

  return (
    <FeatureFlagContext.Provider value={contextValue}>
      {children}
    </FeatureFlagContext.Provider>
  );
};

export default FeatureFlagProvider;