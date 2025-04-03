
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import SteamCallback from "./pages/auth/SteamCallback";
import { initApiConfig } from "./services/skins/api";

const App = () => {
  // Inicializar API de skins quando o app carrega
  useEffect(() => {
    // Iniciar configuração da API
    initApiConfig().catch(error => {
      console.error("Failed to initialize API config:", error);
    });
  }, []);

  return (
    <>
      <Toaster />
      <Sonner position="top-right" closeButton />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth/steam/callback" element={<SteamCallback />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </>
  );
};

export default App;
