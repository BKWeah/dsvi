
import React, { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { AuthProvider } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { FeatureFlagProvider } from "./contexts/FeatureFlagContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AdminProtectedRoute } from "./components/AdminProtectedRoute";
import { FeatureProtectedRoute } from "./components/feature-flags/FeatureProtectedRoute";
import { UpdatedResponsiveDSVIAdminLayout } from "./components/layouts/UpdatedResponsiveDSVIAdminLayout";
import { UpdatedResponsiveSchoolAdminLayout } from "./components/layouts/UpdatedResponsiveSchoolAdminLayout";
import { PublicSchoolLayout } from "./components/layouts/PublicSchoolLayout";
import { SubdomainSchoolLayout } from "./components/layouts/SubdomainSchoolLayout";
import { SchoolPageDisplay } from "./components/public/SchoolPageDisplay";
import { SubdomainSchoolPageDisplay } from "./components/public/SubdomainSchoolPageDisplay";
import { getSubdomainInfo, getCurrentSchoolSlug, isSubdomainRouting } from "./lib/subdomain-utils";
import { SchoolRedirectHandler } from "./components/redirects/SchoolRedirectHandler";
import { PERMISSION_TYPES, RESTRICTED_PERMISSIONS } from "./lib/admin/permissions";
import { initializeDefaultEmailSettings } from "./lib/email-init";
import { PageFade } from "./components/ui/page-fade";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Unauthorized from "./pages/Unauthorized";
import NotFound from "./pages/NotFound";

// Public Pages
import AboutPage from "./pages/public/AboutPage";
import TeamPage from "./pages/public/TeamPage";
import HowItWorksPage from "./pages/public/HowItWorksPage";
import PackagesPage from "./pages/public/PackagesPage";
import TestimonialsPage from "./pages/public/TestimonialsPage";
import ContactPage from "./pages/public/ContactPage";
import ThankYouPage from "./pages/public/ThankYouPage";
import FAQPage from "./pages/public/FAQPage";
import RegisterPage from "./pages/public/RegisterPage";
import TodoTrackerPage from "./pages/public/TodoTrackerPage";
import ClientApprovalPage from "./pages/public/ClientApprovalPage";
import DebugSupabasePage from "./pages/public/DebugSupabasePage";
import DSVIAdminDashboard from "./pages/dsvi-admin/DSVIAdminDashboard";
import SchoolsPage from "./pages/dsvi-admin/SchoolsPage";
import SchoolRequestsPage from "./pages/dsvi-admin/SchoolRequestsPage";
import SchoolContentPage from "./pages/dsvi-admin/SchoolContentPage";
import EditPagePage from "./pages/dsvi-admin/EditPagePage";
import SchoolSettingsPage from "./pages/dsvi-admin/SchoolSettingsPage";
import SubscriptionTrackerPage from "./pages/dsvi-admin/SubscriptionTrackerPage";
import MessagingPanelPage from "./pages/dsvi-admin/MessagingPanelPage";
import AdminManagementPage from "./pages/dsvi-admin/AdminManagementPage";
import AdminLevelTestPage from "./pages/dsvi-admin/AdminLevelTestPage";
import Level2AdminSignupPage from "./pages/Level2AdminSignupPage";
import SchoolAdminDashboard from "./pages/school-admin/SchoolAdminDashboard";
import EditSchoolPagePage from "./pages/school-admin/EditSchoolPagePage";
import SchoolBrandingPageAdmin from "./pages/school-admin/SchoolBrandingPageAdmin";
import SchoolAdminMessagingPage from "./pages/school-admin/SchoolAdminMessagingPage";
import DeploymentManagePage from "./pages/deploy/DeploymentManagePage";

const queryClient = new QueryClient();

const App = () => {
  // Check if we're on a school subdomain
  const subdomainInfo = getSubdomainInfo();
  
  // Initialize email settings on app startup
  useEffect(() => {
    initializeDefaultEmailSettings();
  }, []);
  
  return (
    <QueryClientProvider client={queryClient}>
      <HelmetProvider>
        <TooltipProvider>
          <FeatureFlagProvider>
            <AuthProvider>
              <ThemeProvider>
                <Toaster />
                <Sonner />
                <BrowserRouter>
                  {subdomainInfo.isSubdomain && subdomainInfo.schoolSlug ? (
                    // Subdomain routing for schools
                    <Routes>
                      <Route path="/" element={<SubdomainSchoolLayout />}>
<Route index element={<PageFade><SubdomainSchoolPageDisplay /></PageFade>} />
<Route path=":pageType" element={<PageFade><SubdomainSchoolPageDisplay /></PageFade>} />
                      </Route>
<Route path="*" element={<PageFade><NotFound /></PageFade>} />
                    </Routes>
                  ) : (
                    // Regular routing for main domain
                    <Routes>
<Route path="/" element={<PageFade><Index /></PageFade>} />
<Route path="/login" element={<PageFade><Login /></PageFade>} />
<Route path="/signup" element={<PageFade><Signup /></PageFade>} />
<Route path="/level2-admin-signup" element={<PageFade><Level2AdminSignupPage /></PageFade>} />
<Route path="/dashboard" element={<PageFade><Dashboard /></PageFade>} />
<Route path="/unauthorized" element={<PageFade><Unauthorized /></PageFade>} />

{/* Public Website Pages */}
<Route path="/about" element={<PageFade><AboutPage /></PageFade>} />
<Route path="/team" element={<PageFade><TeamPage /></PageFade>} />
<Route path="/how-it-works" element={<PageFade><HowItWorksPage /></PageFade>} />
<Route path="/packages" element={<PageFade><PackagesPage /></PageFade>} />
<Route path="/testimonials" element={<PageFade><TestimonialsPage /></PageFade>} />
<Route path="/contact" element={<PageFade><ContactPage /></PageFade>} />
<Route path="/register" element={<PageFade><RegisterPage /></PageFade>} />
<Route path="/thank-you" element={<PageFade><ThankYouPage /></PageFade>} />
<Route path="/faq" element={<PageFade><FAQPage /></PageFade>} />
<Route path="/todo-tracker" element={<PageFade><TodoTrackerPage /></PageFade>} />
<Route path="/client-approval" element={<PageFade><ClientApprovalPage /></PageFade>} />
<Route path="/debug-supabase" element={<PageFade><DebugSupabasePage /></PageFade>} />
<Route path="/test-subdomain" element={
  <PageFade>
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Subdomain Test</h1>
      <p>Hostname: {typeof window !== 'undefined' ? window.location.hostname : 'N/A'}</p>
      <p>Is Subdomain: {isSubdomainRouting() ? 'Yes' : 'No'}</p>
      <p>School Slug: {getCurrentSchoolSlug() || 'None'}</p>
    </div>
  </PageFade>
} />
            
            {/* DSVI Admin Routes */}
            <Route 
              path="/dsvi-admin" 
              element={
                <AdminProtectedRoute allowedRoles={['DSVI_ADMIN']}>
                  <UpdatedResponsiveDSVIAdminLayout />
                </AdminProtectedRoute>
              }
            >
              <Route index element={
                <FeatureProtectedRoute feature="dashboard">
                  <DSVIAdminDashboard />
                </FeatureProtectedRoute>
              } />
              <Route path="dashboard" element={
                <FeatureProtectedRoute feature="dashboard">
                  <DSVIAdminDashboard />
                </FeatureProtectedRoute>
              } />
              <Route path="schools" element={
                <FeatureProtectedRoute feature="schools">
                  <SchoolsPage />
                </FeatureProtectedRoute>
              } />
              <Route path="requests" element={
                <FeatureProtectedRoute feature="requests">
                  <SchoolRequestsPage />
                </FeatureProtectedRoute>
              } />
              <Route path="subscriptions" element={
                <FeatureProtectedRoute feature="subscriptions">
                  <SubscriptionTrackerPage />
                </FeatureProtectedRoute>
              } />
              <Route path="messaging" element={
                <FeatureProtectedRoute feature="messaging">
                  <MessagingPanelPage />
                </FeatureProtectedRoute>
              } />
              <Route path="admin-management" element={
                <AdminProtectedRoute requireLevel1={true}>
                  <AdminManagementPage />
                </AdminProtectedRoute>
              } />
              <Route path="admin-test" element={
                <AdminProtectedRoute allowedRoles={['DSVI_ADMIN']}>
                  <AdminLevelTestPage />
                </AdminProtectedRoute>
              } />
              <Route path="schools/:schoolId/content" element={
                <FeatureProtectedRoute feature="schools">
                  <SchoolContentPage />
                </FeatureProtectedRoute>
              } />
              <Route path="schools/:schoolId/pages/:pageType/edit" element={
                <FeatureProtectedRoute feature="schools">
                  <EditPagePage />
                </FeatureProtectedRoute>
              } />
<Route path="schools/:schoolId/settings" element={
  <FeatureProtectedRoute feature="schools">
    <PageFade><SchoolSettingsPage /></PageFade>
  </FeatureProtectedRoute>
} />
            </Route>
            
            {/* Deployment Management Route - Feature Flag System */}
<Route 
  path="/deploy" 
  element={
    <ProtectedRoute roles={['DSVI_ADMIN']}>
      <PageFade><DeploymentManagePage /></PageFade>
    </ProtectedRoute>
  } 
/>
            
            {/* School Admin Routes */}
            <Route 
              path="/school-admin" 
              element={
                <ProtectedRoute roles={['SCHOOL_ADMIN']}>
                  <UpdatedResponsiveSchoolAdminLayout />
                </ProtectedRoute>
              }
            >
<Route index element={<PageFade><SchoolAdminDashboard /></PageFade>} />
<Route path="pages/:pageType/edit" element={<PageFade><EditSchoolPagePage /></PageFade>} />
<Route path="branding" element={<PageFade><SchoolBrandingPageAdmin /></PageFade>} />
<Route path="messaging" element={<PageFade><SchoolAdminMessagingPage /></PageFade>} />
            </Route>
            
            {/* Public School Website Routes */}
            <Route path="/s/:schoolSlug" element={<PublicSchoolLayout />}>
<Route index element={
  <PageFade>
    <SchoolRedirectHandler />
    <SchoolPageDisplay />
  </PageFade>
} />
<Route path=":pageType" element={
  <PageFade>
    <SchoolRedirectHandler />
    <SchoolPageDisplay />
  </PageFade>
} />
            </Route>
            
            {/* Catch-all route */}
<Route path="*" element={<PageFade><NotFound /></PageFade>} />
          </Routes>
          )}
        </BrowserRouter>
      </ThemeProvider>
    </AuthProvider>
  </FeatureFlagProvider>
    </TooltipProvider>
  </HelmetProvider>
</QueryClientProvider>
  );
};

export default App;
