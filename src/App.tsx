
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Unauthorized from "./pages/Unauthorized";
import NotFound from "./pages/NotFound";

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
              path="/dsvi-admin/*" 
              element={
                <ProtectedRoute roles={['DSVI_ADMIN']}>
                  <div>DSVI Admin Panel - Coming Soon</div>
                </ProtectedRoute>
              } 
            />
            
            {/* School Admin Routes */}
            <Route 
              path="/school-admin/*" 
              element={
                <ProtectedRoute roles={['SCHOOL_ADMIN']}>
                  <div>School Admin Panel - Coming Soon</div>
                </ProtectedRoute>
              } 
            />
            
            {/* Public School Website Routes */}
            <Route path="/s/:schoolSlug/*" element={<div>Public School Website - Coming Soon</div>} />
            
            {/* Catch-all route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
