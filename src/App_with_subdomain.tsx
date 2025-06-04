import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { AuthProvider } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { FeatureFlagProvider } from "./contexts/FeatureFlagContext";
import { SubdomainSchoolLayout } from "./components/layouts/SubdomainSchoolLayout";
import { SubdomainSchoolPageDisplay } from "./components/public/SubdomainSchoolPageDisplay";
import { getSubdomainInfo } from "./lib/subdomain-utils";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Component to handle subdomain vs regular routing
function AppRouter() {
  const subdomainInfo = getSubdomainInfo();
  
  // If we're on a school subdomain, show the subdomain layout
  if (subdomainInfo.isSubdomain && subdomainInfo.schoolSlug) {
    return (
      <Routes>
        <Route path="/" element={<SubdomainSchoolLayout />}>
          <Route index element={<SubdomainSchoolPageDisplay />} />
          <Route path=":pageType" element={<SubdomainSchoolPageDisplay />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    );
  }

  // Import and use original routes when not on subdomain
  // We'll modify this to include all the original routes
  const { Routes: OriginalRoutes } = require('./App');
  return <OriginalRoutes />;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <HelmetProvider>
      <TooltipProvider>
        <FeatureFlagProvider>
          <AuthProvider>
            <ThemeProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <AppRouter />
              </BrowserRouter>
            </ThemeProvider>
          </AuthProvider>
        </FeatureFlagProvider>
      </TooltipProvider>
    </HelmetProvider>
  </QueryClientProvider>
);

export default App;
