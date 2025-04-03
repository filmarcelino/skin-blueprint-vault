
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import Auth from "@/pages/Auth";
import Dashboard from "@/pages/Dashboard";
import { AuthProvider } from "@/context/AuthContext";
import { Toaster } from "sonner";
import { isFallbackMode } from "@/services/supabase";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

const queryClient = new QueryClient();

const Index = () => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Toaster position="top-right" />
        <AppContent />
      </AuthProvider>
    </QueryClientProvider>
  );
};

const AppContent = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse-glow text-primary">Loading...</div>
      </div>
    );
  }

  return (
    <>
      {isFallbackMode && (
        <div className="fixed top-0 left-0 right-0 z-50 p-4">
          <Alert variant="warning" className="border-amber-500 bg-amber-50 dark:bg-amber-950 dark:border-amber-800">
            <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            <AlertTitle className="text-amber-800 dark:text-amber-300">Fallback Mode Active</AlertTitle>
            <AlertDescription className="text-amber-700 dark:text-amber-400">
              Running without Supabase connection. Data is stored locally in your browser.
              <br />
              <span className="text-xs opacity-75">Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables to enable full functionality.</span>
            </AlertDescription>
          </Alert>
        </div>
      )}
      {user ? <Dashboard /> : <Auth />}
    </>
  );
};

export default Index;
