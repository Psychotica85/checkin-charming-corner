
import { cn } from "@/lib/utils";
import PDFViewer from "../PDFViewer";
import { PDFDocument } from "@/lib/database/models";

interface DocumentsStepProps {
  documents: PDFDocument[];
  acceptedDocuments: string[];
  onAcceptDocument: (documentId: string) => void;
}

const DocumentsStep = ({ documents, acceptedDocuments, onAcceptDocument }: DocumentsStepProps) => {
  const areAllDocumentsAccepted = documents.length > 0 && acceptedDocuments.length === documents.length;

  return (
    <div className="space-y-4 animate-slide-up">
      {documents.length === 0 ? (
        <div className="p-4 bg-muted/50 rounded-lg text-center">
          <p className="text-muted-foreground">
            Keine Dokumente vorhanden. Der Administrator hat noch keine Dokumente hochgeladen.
          </p>
        </div>
      ) : (
        <div className="space-y-4 max-h-[600px] overflow-y-auto p-1">
          {documents.map((doc) => (
            <PDFViewer
              key={doc.id}
              document={doc}
              onAccept={onAcceptDocument}
              isAccepted={acceptedDocuments.includes(doc.id)}
              requireReading={true}
            />
          ))}
        </div>
      )}

      <div className="flex items-center space-x-2 p-4 bg-muted/30 rounded-lg">
        <div className={cn(
          "h-6 w-6 rounded-full flex items-center justify-center",
          areAllDocumentsAccepted 
            ? "bg-green-500/10 text-green-500" 
            : "bg-muted text-muted-foreground"
        )}>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 6L9 17l-5-5" />
          </svg>
        </div>
        <p className="text-sm">
          {documents.length === 0 
            ? "Keine Dokumente zum Bestätigen vorhanden" 
            : areAllDocumentsAccepted 
              ? "Alle Dokumente wurden bestätigt" 
              : `${acceptedDocuments.length} von ${documents.length} Dokumenten bestätigt`}
        </p>
      </div>
    </div>
  );
};

export default DocumentsStep;
