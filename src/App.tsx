
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import SteamCallback from "./pages/auth/SteamCallback";
import { initApiConfig } from "./services/skins/api";
import Dashboard from "./pages/Dashboard";
import { initializeSkinsManager } from "./services/skins/skinsManager";

const App = () => {
  // Inicializar API de skins quando o app carrega
  useEffect(() => {
    // Iniciar configuração da API
    initApiConfig().catch(error => {
      console.error("Failed to initialize API config:", error);
    });
    
    // Initialize skins database manager
    initializeSkinsManager().catch(error => {
      console.error("Failed to initialize skins manager:", error);
    });
  }, []);

  return (
    <>
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
    </>
  );
};

export default App;
