
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PDFDocument {
  id: string;
  name: string;
  description: string;
  file: string;
  createdAt: Date;
}

interface PDFViewerProps {
  document: PDFDocument;
  onAccept?: (documentId: string) => void;
  isAccepted?: boolean;
}

const PDFViewer = ({ document, onAccept, isAccepted }: PDFViewerProps) => {
  const [showPDF, setShowPDF] = useState(false);

  const handleAccept = () => {
    if (onAccept) {
      onAccept(document.id);
    }
  };

  return (
    <div className="rounded-lg border border-border overflow-hidden">
      {/* Document header */}
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

      {/* PDF viewer */}
      {showPDF && (
        <div className="w-full">
          <iframe 
            src={document.file} 
            className="w-full h-[90vh]" 
            title={document.name}
          />
        </div>
      )}

      {/* Accept button */}
      {onAccept && (
        <div className="p-4 flex justify-between items-center bg-background">
          <div className="flex items-center">
            <div
              className={cn(
                "h-6 w-6 rounded-full flex items-center justify-center mr-2",
                isAccepted
                  ? "bg-green-500/10 text-green-500"
                  : "bg-muted text-muted-foreground"
              )}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 6L9 17l-5-5" />
              </svg>
            </div>
            <span className="text-sm">
              {isAccepted ? "Dokument akzeptiert" : "Dokument noch nicht akzeptiert"}
            </span>
          </div>
          <Button
            onClick={handleAccept}
            variant="outline"
            size="sm"
            disabled={isAccepted}
          >
            {isAccepted ? "Akzeptiert" : "Akzeptieren"}
          </Button>
        </div>
      )}
    </div>
  );
};

export default PDFViewer;
