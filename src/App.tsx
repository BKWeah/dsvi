
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { DSVIAdminLayout } from "./components/layouts/DSVIAdminLayout";
import { SchoolAdminLayout } from "./components/layouts/SchoolAdminLayout";
import { PublicSchoolLayout } from "./components/layouts/PublicSchoolLayout";
import { SchoolPageDisplay } from "./components/public/SchoolPageDisplay";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Unauthorized from "./pages/Unauthorized";
import NotFound from "./pages/NotFound";
import SchoolsPage from "./pages/dsvi-admin/SchoolsPage";
import SchoolContentPage from "./pages/dsvi-admin/SchoolContentPage";
import EditPagePage from "./pages/dsvi-admin/EditPagePage";
import EditSchoolPagePage from "./pages/school-admin/EditSchoolPagePage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
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
                  <DSVIAdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<SchoolsPage />} />
              <Route path="schools" element={<SchoolsPage />} />
              <Route path="schools/:schoolId/content" element={<SchoolContentPage />} />
              <Route path="schools/:schoolId/pages/:pageType/edit" element={<EditPagePage />} />
            </Route>
            
            {/* School Admin Routes */}
            <Route 
              path="/school-admin" 
              element={
                <ProtectedRoute roles={['SCHOOL_ADMIN']}>
                  <SchoolAdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<div className="text-center mt-8"><h1 className="text-2xl font-bold">Welcome to School CMS</h1><p className="text-muted-foreground mt-2">Select a page from the sidebar to start editing</p></div>} />
              <Route path="pages/:pageType/edit" element={<EditSchoolPagePage />} />
            </Route>
            
            {/* Public School Website Routes */}
            <Route path="/s/:schoolSlug" element={<PublicSchoolLayout />}>
              <Route path=":pageType" element={<SchoolPageDisplay />} />
              <Route index element={<SchoolPageDisplay />} />
            </Route>
            
            {/* Catch-all route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
