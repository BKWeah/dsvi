/**
 * Configuration for subdomain routing
 */

export interface SubdomainConfig {
  enabled: boolean;
  baseDomain: string;
  ignoredSubdomains: string[];
  development: {
    enabled: boolean;
    testDomains: string[];
  };
}

// Default configuration
export const subdomainConfig: SubdomainConfig = {
  enabled: true,
  baseDomain: 'localhost',  // Simplified for development
  ignoredSubdomains: ['www', 'api', 'admin', 'app', 'cdn', 'static'],
  development: {
    enabled: true,  // Always enabled for now
    testDomains: ['localhost', '127.0.0.1', 'local.site.com']
  }
};

export function isSubdomainRoutingEnabled(): boolean {
  if (typeof window === 'undefined') return false;
  const hostname = window.location.hostname;
  
  // Enable subdomain routing for localhost subdomains
  if (hostname.includes('localhost')) {
    return hostname !== 'localhost';  // Enable if it's subdomain.localhost
  }
  
  return subdomainConfig.enabled;
}

export function isValidSubdomain(subdomain: string): boolean {
  if (!subdomain || subdomain.length === 0) return false;
  if (subdomainConfig.ignoredSubdomains.includes(subdomain.toLowerCase())) {
    return false;
  }
  const validPattern = /^[a-z0-9-]+$/;
  return validPattern.test(subdomain.toLowerCase());
}

export function getSubdomainConfig(): SubdomainConfig {
  return subdomainConfig;
}
