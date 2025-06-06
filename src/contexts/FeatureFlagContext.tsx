import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import defaultFeatureFlags from '@/config/featureFlags.json';

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
  isLoading: boolean; // Add isLoading to the context type
}

const FeatureFlagContext = createContext<FeatureFlagContextType | undefined>(undefined);

const STORAGE_KEY = 'dsvi_feature_flags';
const API_BASE_URL = 'http://localhost:3001/api';

// API helper functions
const apiClient = {
  async getConfig(): Promise<FeatureFlagConfig> {
    try {
      const response = await fetch(`${API_BASE_URL}/feature-flags`);
      if (!response.ok) throw new Error('Failed to fetch config');
      return await response.json();
    } catch (error) {
      console.warn('API not available, using localStorage fallback:', error);
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : defaultFeatureFlags as FeatureFlagConfig;
    }
  },

  async saveConfig(config: FeatureFlagConfig): Promise<FeatureFlagConfig> {
    try {
      const response = await fetch(`${API_BASE_URL}/feature-flags`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });
      if (!response.ok) throw new Error('Failed to save config');
      const savedConfig = await response.json();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(savedConfig));
      return savedConfig;
    } catch (error) {
      console.warn('API not available, saving to localStorage only:', error);
      const configToSave = { ...config, lastUpdated: new Date().toISOString() };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(configToSave));
      return configToSave;
    }
  },

  async toggleFeature(featurePath: string): Promise<any> {
    try {
      const response = await fetch(`${API_BASE_URL}/feature-flags/toggle`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ featurePath })
      });
      if (!response.ok) throw new Error('Failed to toggle feature');
      return await response.json();
    } catch (error) {
      console.warn('API not available for toggle, using fallback:', error);
      throw error;
    }
  }
};

export const useFeatureFlags = () => {
  const context = useContext(FeatureFlagContext);
  if (context === undefined) {
    throw new Error('useFeatureFlags must be used within a FeatureFlagProvider');
  }
  return context;
};

export const useFeature = (featurePath: string) => {
  const { isFeatureEnabled } = useFeatureFlags();
  return isFeatureEnabled(featurePath);
};

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
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadConfig();
  }, []);

  const isFeatureEnabled = (featurePath: string): boolean => {
    const pathParts = featurePath.split('.');
    let current: any = featurePath.startsWith('navigation.') ? config.navigation : config.features;
    
    if (featurePath.startsWith('navigation.')) {
      pathParts.shift(); // Remove 'navigation' prefix
    }

    for (const part of pathParts) {
      if (current[part] === undefined) {
        return false;
      }
      current = current[part];
      
      if (current.enabled !== undefined) {
        if (!current.enabled) {
          return false;
        }
        if (pathParts.indexOf(part) < pathParts.length - 1) {
          current = current.subFeatures || {};
        }
      }
    }

    return current.enabled !== undefined ? current.enabled : false;
  };

  const toggleFeature = async (featurePath: string) => {
    try {
      const result = await apiClient.toggleFeature(featurePath);
      if (result.success) {
        setConfig(result.config);
        console.log(`✅ Toggled feature: ${featurePath} → ${result.enabled}`);
      }
    } catch (error) {
      // Fallback to local toggle
      const pathParts = featurePath.split('.');
      const newConfig = JSON.parse(JSON.stringify(config));
      
      let current: any;
      if (pathParts[0] === 'navigation') {
        current = newConfig.navigation;
        pathParts.shift();
      } else {
        current = newConfig.features;
      }
      
      for (let i = 0; i < pathParts.length; i++) {
        const part = pathParts[i];
        
        if (i === pathParts.length - 1) {
          if (current[part] && current[part].enabled !== undefined) {
            current[part].enabled = !current[part].enabled;
          }
        } else {
          current = current[part];
          if (pathParts[i + 1] && current.subFeatures) {
            current = current.subFeatures;
          }
        }
      }

      newConfig.lastUpdated = new Date().toISOString();
      setConfig(newConfig);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newConfig));
      console.log(`⚠️ Local toggle: ${featurePath}`);
    }
  };

  const updateConfig = (newConfig: FeatureFlagConfig) => {
    newConfig.lastUpdated = new Date().toISOString();
    setConfig(newConfig);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newConfig));
  };

  const getEnabledRoutes = (): string[] => {
    return Object.entries(config.features)
      .filter(([_, feature]) => feature.enabled && feature.route)
      .sort((a, b) => (a[1].priority || 999) - (b[1].priority || 999))
      .map(([_, feature]) => feature.route!);
  };

  const getDefaultRoute = (): string => {
    const enabledRoutes = getEnabledRoutes();
    
    if (isFeatureEnabled('dashboard') && config.routing.defaultRedirect.includes('dashboard')) {
      return config.routing.defaultRedirect;
    }
    
    if (enabledRoutes.length > 0) {
      return enabledRoutes[0];
    }
    
    return config.routing.fallbackRoute;
  };

  const saveConfig = async (): Promise<void> => {
    try {
      setIsLoading(true);
      const savedConfig = await apiClient.saveConfig(config);
      setConfig(savedConfig);
      console.log('✅ Feature flags saved to file and localStorage');
    } catch (error) {
      console.error('Failed to save feature flags:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const loadConfig = async (): Promise<void> => {
    try {
      setIsLoading(true);
      const loadedConfig = await apiClient.getConfig();
      setConfig(loadedConfig);
      console.log('✅ Feature flags loaded from file/localStorage');
    } catch (error) {
      console.error('Failed to load feature flags, using defaults:', error);
      setConfig(defaultFeatureFlags as FeatureFlagConfig);
    } finally {
      setIsLoading(false);
    }
  };

  const resetToDefaults = () => {
    setConfig(defaultFeatureFlags as FeatureFlagConfig);
    localStorage.removeItem(STORAGE_KEY);
    console.log('🔄 Feature flags reset to defaults');
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
    isLoading, // Expose isLoading
  };

  return (
    <FeatureFlagContext.Provider value={contextValue}>
      {children}
    </FeatureFlagContext.Provider>
  );
};

export default FeatureFlagProvider;
