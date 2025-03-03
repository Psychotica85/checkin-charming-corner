
import { format } from "date-fns";
import { de } from "date-fns/locale";

interface ConfirmationData {
  firstName: string;
  lastName: string;
  company: string;
  visitReason: string;
  date: Date;
  time: string;
}

interface ConfirmationStepProps {
  formData: ConfirmationData;
  documents: Array<{ id: string; name: string }>;
  acceptedDocuments: string[];
}

const ConfirmationStep = ({ formData, documents, acceptedDocuments }: ConfirmationStepProps) => {
  const areAllDocumentsAccepted = documents.length > 0 && acceptedDocuments.length === documents.length;

  return (
    <div className="space-y-4 animate-slide-up">
      <div className="p-4 bg-muted/50 rounded-lg space-y-3">
        <div>
          <h3 className="text-sm text-muted-foreground">Name</h3>
          <p className="font-medium">{formData.firstName} {formData.lastName}</p>
        </div>
        <div>
          <h3 className="text-sm text-muted-foreground">Unternehmen</h3>
          <p className="font-medium">{formData.company}</p>
        </div>
        <div>
          <h3 className="text-sm text-muted-foreground">Grund des Besuches</h3>
          <p className="font-medium">{formData.visitReason}</p>
        </div>
        <div>
          <h3 className="text-sm text-muted-foreground">Besuchsdatum</h3>
          <p className="font-medium">{format(formData.date, "PPP", { locale: de })}</p>
        </div>
        <div>
          <h3 className="text-sm text-muted-foreground">Besuchszeit</h3>
          <p className="font-medium">{formData.time} Uhr</p>
        </div>
        <div>
          <h3 className="text-sm text-muted-foreground">Dokumente</h3>
          <p className="font-medium">
            {documents.length === 0 
              ? "Keine Dokumente vorhanden" 
              : areAllDocumentsAccepted 
                ? "Alle Dokumente bestätigt" 
                : `${acceptedDocuments.length} von ${documents.length} Dokumenten bestätigt`}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationStep;
