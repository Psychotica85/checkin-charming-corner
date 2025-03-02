
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { submitCheckIn } from "@/lib/api";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import PDFViewer from "./PDFViewer";

interface FormStep {
  title: string;
  description: string;
}

interface PDFDocument {
  id: string;
  name: string;
  description: string;
  file: string;
  createdAt: Date;
}

const formSteps: FormStep[] = [
  {
    title: "Willkommen",
    description: "Bitte geben Sie Ihre persönlichen Daten ein."
  },
  {
    title: "Dokumente",
    description: "Bitte lesen und bestätigen Sie die folgenden Dokumente."
  },
  {
    title: "Bestätigung",
    description: "Überprüfen Sie Ihre Daten und schließen Sie den Check-In ab."
  }
];

const CheckInForm = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    fullName: "",
    company: "",
  });
  const [loading, setLoading] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [documents, setDocuments] = useState<PDFDocument[]>([]);
  const [acceptedDocuments, setAcceptedDocuments] = useState<string[]>([]);

  useEffect(() => {
    // Load documents from localStorage
    const storedDocs = localStorage.getItem("pdfDocuments");
    if (storedDocs) {
      setDocuments(JSON.parse(storedDocs));
    }
  }, []);

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAcceptDocument = (documentId: string) => {
    if (!acceptedDocuments.includes(documentId)) {
      setAcceptedDocuments(prev => [...prev, documentId]);
    }
  };

  const handleNext = () => {
    if (currentStep === 0 && (!formData.fullName || !formData.company)) {
      toast.error("Bitte füllen Sie alle Felder aus.");
      return;
    }
    
    if (currentStep === 1) {
      if (documents.length === 0) {
        // If no documents are uploaded, allow to proceed
        setCurrentStep(prev => prev + 1);
        return;
      }
      
      if (acceptedDocuments.length < documents.length) {
        toast.error("Bitte bestätigen Sie alle Dokumente, um fortzufahren.");
        return;
      }
    }

    if (currentStep < formSteps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const result = await submitCheckIn({
        ...formData,
        acceptedRules: acceptedDocuments.length === documents.length,
        acceptedDocuments: acceptedDocuments,
        timestamp: new Date()
      });
      
      if (result.success) {
        setCompleted(true);
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("Es ist ein Fehler aufgetreten. Bitte versuchen Sie es später erneut.");
      console.error("Check-in error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({
      fullName: "",
      company: "",
    });
    setAcceptedDocuments([]);
    setCurrentStep(0);
    setCompleted(false);
  };

  const areAllDocumentsAccepted = documents.length > 0 && acceptedDocuments.length === documents.length;

  if (completed) {
    return (
      <div className="w-full max-w-md mx-auto px-6 py-8 glass rounded-2xl space-y-6 animate-fade-in">
        <div className="text-center space-y-2">
          <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 6L9 17l-5-5" />
            </svg>
          </div>
          <h2 className="text-2xl font-medium">Check-In erfolgreich</h2>
          <p className="text-muted-foreground">Vielen Dank, {formData.fullName}! Sie wurden erfolgreich eingecheckt.</p>
        </div>
        <Button onClick={handleReset} className="w-full">
          Neuer Check-In
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto px-6 py-8 glass rounded-2xl space-y-6 animate-fade-in">
      {/* Progress indicator */}
      <div className="flex justify-between mb-4">
        {formSteps.map((_, index) => (
          <div 
            key={index}
            className={cn(
              "w-full h-1 rounded-full transition-all duration-300",
              index < currentStep ? "bg-primary" : index === currentStep ? "bg-primary/40" : "bg-muted"
            )}
            style={{ marginRight: index < formSteps.length - 1 ? '4px' : 0 }}
          />
        ))}
      </div>

      {/* Step title */}
      <div className="space-y-1">
        <h2 className="text-2xl font-medium">{formSteps[currentStep].title}</h2>
        <p className="text-muted-foreground">{formSteps[currentStep].description}</p>
      </div>

      {/* Form steps */}
      <div className="space-y-6">
        {currentStep === 0 && (
          <div className="space-y-4 animate-slide-up">
            <div className="space-y-2">
              <Label htmlFor="fullName">Vollständiger Name</Label>
              <Input
                id="fullName"
                placeholder="Max Mustermann"
                value={formData.fullName}
                onChange={(e) => updateFormData("fullName", e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="company">Unternehmen / Organisation</Label>
              <Input
                id="company"
                placeholder="Firma GmbH"
                value={formData.company}
                onChange={(e) => updateFormData("company", e.target.value)}
                required
              />
            </div>
          </div>
        )}

        {currentStep === 1 && (
          <div className="space-y-4 animate-slide-up">
            {documents.length === 0 ? (
              <div className="p-4 bg-muted/50 rounded-lg text-center">
                <p className="text-muted-foreground">
                  Keine Dokumente vorhanden. Der Administrator hat noch keine Dokumente hochgeladen.
                </p>
              </div>
            ) : (
              <div className="space-y-4 max-h-80 overflow-y-auto p-1">
                {documents.map((doc) => (
                  <PDFViewer
                    key={doc.id}
                    document={doc}
                    onAccept={handleAcceptDocument}
                    isAccepted={acceptedDocuments.includes(doc.id)}
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
        )}

        {currentStep === 2 && (
          <div className="space-y-4 animate-slide-up">
            <div className="p-4 bg-muted/50 rounded-lg space-y-3">
              <div>
                <h3 className="text-sm text-muted-foreground">Name</h3>
                <p className="font-medium">{formData.fullName}</p>
              </div>
              <div>
                <h3 className="text-sm text-muted-foreground">Unternehmen</h3>
                <p className="font-medium">{formData.company}</p>
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
              <div>
                <h3 className="text-sm text-muted-foreground">Datum & Uhrzeit</h3>
                <p className="font-medium">{new Date().toLocaleString('de-DE')}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation buttons */}
      <div className="flex gap-3 pt-2">
        {currentStep > 0 && (
          <Button 
            variant="outline" 
            onClick={handleBack}
            disabled={loading}
            className="flex-1"
          >
            Zurück
          </Button>
        )}
        <Button 
          onClick={handleNext} 
          disabled={loading}
          className={cn("flex-1", currentStep === 0 && "w-full")}
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Verarbeiten...
            </span>
          ) : currentStep < formSteps.length - 1 ? (
            "Weiter"
          ) : (
            "Absenden"
          )}
        </Button>
      </div>
    </div>
  );
};

export default CheckInForm;
