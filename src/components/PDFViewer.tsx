
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { PDFDocument } from "@/lib/database/models";
import { toast } from "sonner";

interface PDFViewerProps {
  document?: PDFDocument;
  url?: string;
  onAccept?: (documentId: string) => void;
  isAccepted?: boolean;
  requireReading?: boolean;
}

const PDFViewer = ({ document, url, onAccept, isAccepted, requireReading = false }: PDFViewerProps) => {
  const [showPDF, setShowPDF] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasBeenRead, setHasBeenRead] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const scrollTimer = useRef<NodeJS.Timeout | null>(null);

  // Funktion zum Überprüfen der Scroll-Position im PDF
  const checkIfRead = () => {
    if (showPDF && iframeRef.current && requireReading) {
      // Wir betrachten das Dokument als gelesen, wenn es angezeigt wird
      // In einer realen Anwendung könnte hier eine ausgeklügeltere Logik angewendet werden
      setHasBeenRead(true);
    }
  };

  // Dokument als gelesen markieren, wenn es angezeigt wird
  useEffect(() => {
    if (showPDF && requireReading) {
      // Setze einen Timer, um dem Benutzer Zeit zum Lesen zu geben (z.B. 2 Sekunden)
      scrollTimer.current = setTimeout(() => {
        setHasBeenRead(true);
      }, 2000);
    }

    return () => {
      if (scrollTimer.current) {
        clearTimeout(scrollTimer.current);
      }
    };
  }, [showPDF, requireReading]);

  const handleAccept = () => {
    if (requireReading && !hasBeenRead) {
      toast.error("Bitte öffnen und lesen Sie das Dokument zuerst, bevor Sie es akzeptieren.");
      return;
    }

    if (onAccept && document) {
      onAccept(document.id);
    }
  };

  // Create blob URL from base64 for PDF viewing
  const getPdfUrl = (base64Data: string): string => {
    try {
      // Handle the case when it might already be a blob URL
      if (base64Data.startsWith('blob:')) {
        return base64Data;
      }
      
      // Check if this is a data URL
      if (base64Data.startsWith('data:application/pdf')) {
        // Extract base64 part from data URL
        const base64Content = base64Data.split(',')[1];
        const mimeType = base64Data.split(',')[0].split(':')[1].split(';')[0];
        
        // Convert base64 to binary
        const binaryString = atob(base64Content);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        
        // Create blob and return URL
        const blob = new Blob([bytes.buffer], { type: mimeType });
        return URL.createObjectURL(blob);
      }
      
      // If the base64Data is just the content without the data URL prefix
      // add the prefix and call this function again
      if (!base64Data.includes(',')) {
        return getPdfUrl(`data:application/pdf;base64,${base64Data}`);
      }
      
      console.error('Unknown PDF data format:', base64Data.substring(0, 100) + '...');
      return '';
    } catch (error) {
      console.error('Error creating blob URL:', error);
      return '';
    }
  };

  // Handle iframe load events
  const handleIframeLoad = () => {
    setIsLoading(false);
    checkIfRead();
  };

  const handleIframeError = () => {
    setIsLoading(false);
    setError("Fehler beim Laden des PDF-Dokuments");
  };

  // Determine URL to display (either passed directly or from document)
  const pdfUrl = url || (document ? getPdfUrl(document.file) : '');

  // If neither url nor document is available, show nothing
  if (!pdfUrl) {
    return <div>Keine PDF-Daten verfügbar</div>;
  }

  return (
    <div className="rounded-lg border border-border overflow-hidden">
      {/* Document header */}
      {document && (
        <div className="flex items-center justify-between p-4 bg-muted/30">
          <div className="space-y-1">
            <h3 className="font-medium">{document.name}</h3>
            {document.description && (
              <p className="text-sm text-muted-foreground">{document.description}</p>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowPDF(!showPDF)}
          >
            {showPDF ? "Ausblenden" : "Anzeigen"}
          </Button>
        </div>
      )}

      {/* PDF viewer */}
      {(showPDF || !document) && (
        <div className="w-full">
          {isLoading && (
            <div className="flex items-center justify-center h-40">
              <p>Lade PDF-Dokument...</p>
            </div>
          )}
          
          {error && (
            <div className="flex items-center justify-center h-40 text-red-500">
              <p>{error}</p>
            </div>
          )}
          
          <iframe 
            ref={iframeRef}
            src={pdfUrl} 
            className="w-full h-[90vh]" 
            title={document?.name || "PDF Dokument"}
            onLoad={handleIframeLoad}
            onError={handleIframeError}
          />
        </div>
      )}

      {/* Accept button */}
      {onAccept && document && (
        <div className="p-4 flex justify-between items-center bg-background">
          <div className="flex items-center">
            <div
              className={cn(
                "h-6 w-6 rounded-full flex items-center justify-center mr-2",
                isAccepted
                  ? "bg-green-500/10 text-green-500" 
                  : requireReading && !hasBeenRead && !showPDF
                  ? "bg-amber-500/10 text-amber-500"
                  : "bg-muted text-muted-foreground"
              )}
            >
              {isAccepted ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
              ) : requireReading && !hasBeenRead && !showPDF ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 9v4m0 4h.01M22 12A10 10 0 1 1 2 12a10 10 0 0 1 20 0Z" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
              )}
            </div>
            <span className="text-sm">
              {isAccepted 
                ? "Dokument akzeptiert" 
                : requireReading && !hasBeenRead 
                ? "Bitte Dokument öffnen und lesen" 
                : "Dokument noch nicht akzeptiert"}
            </span>
          </div>
          <Button
            onClick={handleAccept}
            variant="outline"
            size="sm"
            disabled={isAccepted || (requireReading && !hasBeenRead)}
          >
            {isAccepted 
              ? "Akzeptiert" 
              : requireReading && !hasBeenRead 
              ? "Lesen erforderlich" 
              : "Akzeptieren"}
          </Button>
        </div>
      )}
    </div>
  );
};

export default PDFViewer;
