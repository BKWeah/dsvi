/**
 * Component to handle redirects from old path-based URLs to subdomain URLs
 * This will automatically redirect users from site.com/s/school to school.site.com
 */

import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { generateSchoolUrl, getSubdomainInfo } from '@/lib/subdomain-utils';

export function SchoolRedirectHandler() {
  const { schoolSlug, pageType } = useParams<{ schoolSlug: string; pageType?: string }>();

  useEffect(() => {
    if (schoolSlug) {
      const subdomainInfo = getSubdomainInfo();
      
      // Only redirect if we're on the main domain (not already on a subdomain)
      if (!subdomainInfo.isSubdomain) {
        const newUrl = generateSchoolUrl(schoolSlug, pageType);
        
        // If the new URL is different from current path (i.e., it's a subdomain URL)
        const currentPath = window.location.pathname;
        if (!newUrl.includes(currentPath)) {
          // Redirect to subdomain URL
          window.location.href = newUrl;
          return;
        }
      }
    }
  }, [schoolSlug, pageType]);

  return null; // This component doesn't render anything
}

/**
 * Higher-order component to wrap school pages with redirect logic
 */
export function withSchoolRedirect<P extends object>(
  Component: React.ComponentType<P>
): React.ComponentType<P> {
  return function WrappedComponent(props: P) {
    return (
      <>
        <SchoolRedirectHandler />
        <Component {...props} />
      </>
    );
  };
}
