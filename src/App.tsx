
import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";
import { DEFAULT_COMPANY_SETTINGS } from "./lib/api";

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
  const [isInitialized, setIsInitialized] = useState(false);
  
  useEffect(() => {
    console.log("App component mounted");
    
    // Initialisierung der lokalen Daten
    const initializeLocalStorage = () => {
      // Check, ob lokaler Speicher existiert
      if (typeof window === 'undefined') return;
      
      // Check-ins initialisieren
      if (!localStorage.getItem('checkIns')) {
        localStorage.setItem('checkIns', JSON.stringify([]));
        console.log("Check-ins im lokalen Speicher initialisiert");
      }
      
      // Dokumente initialisieren
      if (!localStorage.getItem('pdfDocuments')) {
        localStorage.setItem('pdfDocuments', JSON.stringify([]));
        console.log("Dokumente im lokalen Speicher initialisiert");
      }
      
      // Unternehmenseinstellungen initialisieren
      if (!localStorage.getItem('companySettings')) {
        localStorage.setItem('companySettings', JSON.stringify(DEFAULT_COMPANY_SETTINGS));
        console.log("Unternehmenseinstellungen im lokalen Speicher initialisiert");
      }
      
      // Initialisierung abgeschlossen
      setIsInitialized(true);
      console.log("Lokale Daten initialisiert");
    };
    
    initializeLocalStorage();
  }, []);
  
  console.log("App rendering, isInitialized:", isInitialized);
  
  // Anwendung sofort anzeigen, auch während der Initialisierung
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
