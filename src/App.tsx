import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import AppLayout from "@/components/layout/AppLayout";
import Index from "@/pages/Index";
import Login from "@/pages/Login";
import MapPage from "@/pages/MapPage";
import ResourcesPage from "@/pages/ResourcesPage";
import AddResourcePage from "@/pages/AddResourcePage";
import NotFoundPage from "@/pages/NotFoundPage";
import IntegrationsPage from "@/pages/IntegrationsPage";
import EmergencyActionsPage from "@/pages/EmergencyActionsPage";
import AlertsPage from "@/pages/AlertsPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            
            {/* Protected routes with AppLayout */}
            <Route element={<AppLayout />}>
              <Route path="/" element={<Index />} />
              <Route path="/map" element={<MapPage />} />
              <Route path="/resources" element={<ResourcesPage />} />
              <Route path="/add-resource" element={<AddResourcePage />} />
              
              {/* Add additional routes as needed */}
              <Route path="/import" element={<div className="p-4">Import danych - strona w budowie</div>} />
              <Route path="/reports" element={<div className="p-4">Raporty - strona w budowie</div>} />
              <Route path="/settings" element={<div className="p-4">Ustawienia - strona w budowie</div>} />
              <Route path="/users" element={<div className="p-4">Użytkownicy - strona w budowie</div>} />
              <Route path="/integrations" element={<IntegrationsPage />} />
              <Route path="/emergency-actions" element={<EmergencyActionsPage />} />
              <Route path="/alerts" element={<AlertsPage />} />
            </Route>
            
            {/* 404 catch-all route */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
