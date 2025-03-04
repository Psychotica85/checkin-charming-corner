
import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";

// Globale Variable für Browser-Erkennung
declare global {
  interface Window {
    IS_BROWSER: boolean;
  }
}

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

const App = () => {
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    console.log("App component mounted");
    // Simulate initialization delay
    const timer = setTimeout(() => {
      setIsLoading(false);
      console.log("App ready to render routes");
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);
  
  console.log("App rendering, isLoading:", isLoading);
  
  // Simple loading screen
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background">
        <div className="w-16 h-16 border-4 border-primary border-solid rounded-full border-t-transparent animate-spin mb-4"></div>
        <h1 className="text-2xl font-bold text-primary mb-2">Gäste Check-In System</h1>
        <p className="text-muted-foreground">Anwendung wird initialisiert...</p>
      </div>
    );
  }
  
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner position="top-center" richColors />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/admin/*" element={<Admin />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
