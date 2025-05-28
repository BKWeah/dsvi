
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { AuthProvider } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { UpdatedResponsiveDSVIAdminLayout } from "./components/layouts/UpdatedResponsiveDSVIAdminLayout";
import { UpdatedResponsiveSchoolAdminLayout } from "./components/layouts/UpdatedResponsiveSchoolAdminLayout";
import { PublicSchoolLayout } from "./components/layouts/PublicSchoolLayout";
import { SchoolPageDisplay } from "./components/public/SchoolPageDisplay";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Unauthorized from "./pages/Unauthorized";
import NotFound from "./pages/NotFound";
import SchoolsPage from "./pages/dsvi-admin/SchoolsPage";
import SchoolRequestsPage from "./pages/dsvi-admin/SchoolRequestsPage";
import SchoolContentPage from "./pages/dsvi-admin/SchoolContentPage";
import EditPagePage from "./pages/dsvi-admin/EditPagePage";
import SchoolSettingsPage from "./pages/dsvi-admin/SchoolSettingsPage";
import SchoolAdminDashboard from "./pages/school-admin/SchoolAdminDashboard";
import EditSchoolPagePage from "./pages/school-admin/EditSchoolPagePage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <HelmetProvider>
      <TooltipProvider>
        <AuthProvider>
          <ThemeProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/unauthorized" element={<Unauthorized />} />
            
            {/* DSVI Admin Routes */}
            <Route 
              path="/dsvi-admin" 
              element={
                <ProtectedRoute roles={['DSVI_ADMIN']}>
                  <UpdatedResponsiveDSVIAdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<SchoolsPage />} />
              <Route path="schools" element={<SchoolsPage />} />
              <Route path="requests" element={<SchoolRequestsPage />} />
              <Route path="schools/:schoolId/content" element={<SchoolContentPage />} />
              <Route path="schools/:schoolId/pages/:pageType/edit" element={<EditPagePage />} />
              <Route path="schools/:schoolId/settings" element={<SchoolSettingsPage />} />
            </Route>
            
            {/* School Admin Routes */}
            <Route 
              path="/school-admin" 
              element={
                <ProtectedRoute roles={['SCHOOL_ADMIN']}>
                  <UpdatedResponsiveSchoolAdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<SchoolAdminDashboard />} />
              <Route path="pages/:pageType/edit" element={<EditSchoolPagePage />} />
            </Route>
            
            {/* Public School Website Routes */}
            <Route path="/s/:schoolSlug" element={<PublicSchoolLayout />}>
              <Route index element={<SchoolPageDisplay />} />
              <Route path=":pageType" element={<SchoolPageDisplay />} />
            </Route>
            
            {/* Catch-all route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </ThemeProvider>
    </AuthProvider>
    </TooltipProvider>
  </HelmetProvider>
</QueryClientProvider>
);

export default App;
