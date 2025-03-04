
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

// Konfiguration für TanStack Query
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
  const [isLoading, setIsLoading] = useState(false); // Direkt mit false initialisieren
  
  useEffect(() => {
    console.log("App component mounted");
    
    // Lokalen Speicher initialisieren, wenn er noch nicht existiert
    if (typeof window !== 'undefined' && !localStorage.getItem('companySettings')) {
      localStorage.setItem('companySettings', JSON.stringify({
        id: '1',
        address: 'Musterfirma GmbH\nMusterstraße 123\n12345 Musterstadt\nDeutschland',
        logo: '',
        updatedAt: new Date().toISOString()
      }));
      console.log("Lokale Unternehmenseinstellungen initialisiert");
    }
  }, []);
  
  console.log("App rendering, isLoading:", isLoading);
  
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
