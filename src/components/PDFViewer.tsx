
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

interface PDFViewerProps {
  document: {
    id: string;
    name: string;
    description?: string;
    file: string;
  };
  onAccept: (documentId: string) => void;
  isAccepted: boolean;
}

const PDFViewer = ({ document, onAccept, isAccepted }: PDFViewerProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleOpen = () => {
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleAccept = () => {
    onAccept(document.id);
    setIsOpen(false);
  };

  if (!isOpen) {
    return (
      <div className="flex justify-between items-center p-4 bg-muted/50 rounded-lg">
        <div>
          <h3 className="font-medium">{document.name}</h3>
          {document.description && (
            <p className="text-sm text-muted-foreground">{document.description}</p>
          )}
        </div>
        <div className="flex items-center gap-3">
          {isAccepted && (
            <span className="text-green-600 flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 6L9 17l-5-5" />
              </svg>
              Bestätigt
            </span>
          )}
          <Button 
            variant={isAccepted ? "outline" : "default"}
            size="sm"
            onClick={handleOpen}
          >
            {isAccepted ? "Erneut anzeigen" : "Dokument öffnen"}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex flex-col">
      <div className="p-4 bg-background border-b flex justify-between items-center">
        <h2 className="text-xl font-medium">{document.name}</h2>
        <Button variant="outline" size="sm" onClick={handleClose}>
          Schließen
        </Button>
      </div>
      
      <div className="flex-1 overflow-auto p-4 flex justify-center">
        <iframe
          src={document.file}
          className="w-full max-w-4xl h-full rounded-lg border shadow-lg"
          title={document.name}
        />
      </div>
      
      <div className="p-4 bg-background border-t flex justify-end gap-2">
        <Button variant="outline" onClick={handleClose}>
          Abbrechen
        </Button>
        <Button onClick={handleAccept} disabled={isAccepted}>
          {isAccepted ? "Bereits bestätigt" : "Dokument bestätigen"}
        </Button>
      </div>
    </div>
  );
};

export default PDFViewer;
