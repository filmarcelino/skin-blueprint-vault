
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect } from "react";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import SteamCallback from "./pages/auth/SteamCallback";
import { initApiConfig } from "./services/skins/api";
import Dashboard from "./pages/Dashboard";
import { initializeSkinsManager } from "./services/skins/skinsManager";

// Create QueryClient instance outside of component
const queryClient = new QueryClient();

// Separate initialization function to be called once
const initializeServices = () => {
  // Initialize API config
  initApiConfig().catch(error => {
    console.error("Failed to initialize API config:", error);
  });
  
  // Initialize skins database manager
  initializeSkinsManager().catch(error => {
    console.error("Failed to initialize skins manager:", error);
  });
};

const App = () => {
  // Call initialization function once when App mounts
  useEffect(() => {
    initializeServices();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <Toaster />
      <Sonner position="top-right" closeButton />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/auth/steam/callback" element={<SteamCallback />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
