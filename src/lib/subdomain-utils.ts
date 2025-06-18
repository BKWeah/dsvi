/**
 * Utilities for handling subdomain-based school routing
 */

export interface SubdomainInfo {
  schoolSlug: string | null;
  isSubdomain: boolean;
  domain: string;
}

/**
 * Extract school slug from subdomain - simplified version
 */
export function getSubdomainInfo(): SubdomainInfo {
  if (typeof window === 'undefined') {
    return { schoolSlug: null, isSubdomain: false, domain: '' };
  }

  const hostname = window.location.hostname;
  const parts = hostname.split('.');
  
  // For localhost development
  if (hostname.includes('localhost')) {
    // Check if it's a subdomain like "harvard.localhost"
    if (parts.length >= 2 && parts[1] === 'localhost') {
      const subdomain = parts[0];
      if (subdomain !== 'www' && subdomain !== 'localhost') {
        return { 
          schoolSlug: subdomain, 
          isSubdomain: true, 
          domain: 'localhost' 
        };
      }
    }
    return { schoolSlug: null, isSubdomain: false, domain: hostname };
  }

  // For production domains
  if (parts.length >= 3) {
    const subdomain = parts[0];
    const domain = parts.slice(1).join('.');
    
    // Simple validation - no www, api, admin, etc.
    const ignoredSubdomains = ['www', 'api', 'admin', 'app', 'cdn', 'static'];
    
    if (!ignoredSubdomains.includes(subdomain.toLowerCase())) {
      return { 
        schoolSlug: subdomain, 
        isSubdomain: true, 
        domain 
      };
    }
  }

  return { schoolSlug: null, isSubdomain: false, domain: hostname };
}/**
 * Generate navigation URL based on current context
 * Always prefers subdomain format when possible
 */
export function generateSchoolUrl(schoolSlug: string, pageType?: string, subsectionId?: string): string {
  if (typeof window === 'undefined') {
    let path = pageType ? `/${pageType}` : '';
    if (subsectionId) {
      path += `/${subsectionId}`;
    }
    return `/s/${schoolSlug}${path}`;
  }

  const subdomainInfo = getSubdomainInfo();
  const protocol = window.location.protocol;
  const port = window.location.port ? `:${window.location.port}` : '';
  
  let path = pageType ? `/${pageType}` : '';
  if (subsectionId) {
    path += `/${subsectionId}`;
  }

  // For localhost development
  if (window.location.hostname.includes('localhost')) {
    return `${protocol}//${schoolSlug}.localhost${port}${path}`;
  }
  
  // For production domains
  if (subdomainInfo.domain && subdomainInfo.domain !== 'localhost') {
    return `${protocol}//${schoolSlug}.${subdomainInfo.domain}${port}${path}`;
  }
  
  // Fallback to path-based routing (should rarely be used now)
  return `/s/${schoolSlug}${path}`;
}

/**
 * Generate school homepage URL (always subdomain format)
 */
export function generateSchoolHomepageUrl(schoolSlug: string): string {
  return generateSchoolUrl(schoolSlug);
}

/**
 * Generate school page URL (always subdomain format)
 */
export function generateSchoolPageUrl(schoolSlug: string, pageType: string): string {
  return generateSchoolUrl(schoolSlug, pageType);
}

/**
 * Check if current URL is using subdomain routing
 */
export function isSubdomainRouting(): boolean {
  return getSubdomainInfo().isSubdomain;
}

/**
 * Get the current school slug from either subdomain or URL path
 */
export function getCurrentSchoolSlug(): string | null {
  const subdomainInfo = getSubdomainInfo();
  
  if (subdomainInfo.isSubdomain) {
    return subdomainInfo.schoolSlug;
  }
  
  // Check if we're on a path-based school route
  if (typeof window !== 'undefined') {
    const path = window.location.pathname;
    const pathMatch = path.match(/^\/s\/([^\/]+)/);
    return pathMatch ? pathMatch[1] : null;
  }
  
  return null;
}
