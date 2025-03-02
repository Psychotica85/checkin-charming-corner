
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { submitCheckIn } from "@/lib/api";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import PDFViewer from "./PDFViewer";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Clock } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

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

// Generate time options every 15 minutes
const generateTimeOptions = () => {
  const times = [];
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 15) {
      const formattedHour = hour.toString().padStart(2, '0');
      const formattedMinute = minute.toString().padStart(2, '0');
      times.push(`${formattedHour}:${formattedMinute}`);
    }
  }
  return times;
};

const timeOptions = generateTimeOptions();

const CheckInForm = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    company: "",
    visitReason: "",
    date: new Date(),
    time: "08:00",
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
    if (currentStep === 0) {
      if (!formData.firstName || !formData.lastName || !formData.company || !formData.visitReason) {
        toast.error("Bitte füllen Sie alle Felder aus.");
        return;
      }
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
        firstName: formData.firstName,
        lastName: formData.lastName,
        fullName: `${formData.firstName} ${formData.lastName}`,
        company: formData.company,
        visitReason: formData.visitReason,
        visitDate: formData.date,
        visitTime: formData.time,
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
      firstName: "",
      lastName: "",
      company: "",
      visitReason: "",
      date: new Date(),
      time: "08:00",
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
          <p className="text-muted-foreground">Vielen Dank, {formData.firstName}! Sie wurden erfolgreich eingecheckt.</p>
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
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">Vorname</Label>
                <Input
                  id="firstName"
                  placeholder="Max"
                  value={formData.firstName}
                  onChange={(e) => updateFormData("firstName", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Nachname</Label>
                <Input
                  id="lastName"
                  placeholder="Mustermann"
                  value={formData.lastName}
                  onChange={(e) => updateFormData("lastName", e.target.value)}
                  required
                />
              </div>
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

            <div className="space-y-2">
              <Label htmlFor="visitReason">Grund des Besuches</Label>
              <Textarea
                id="visitReason"
                placeholder="Besprechung, Meeting, etc."
                value={formData.visitReason}
                onChange={(e) => updateFormData("visitReason", e.target.value)}
                required
                className="resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Datum</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="date"
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.date ? (
                        format(formData.date, "PPP", { locale: de })
                      ) : (
                        <span>Datum wählen</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={formData.date}
                      onSelect={(date) => date && updateFormData("date", date)}
                      initialFocus
                      locale={de}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label htmlFor="time">Uhrzeit</Label>
                <Select 
                  value={formData.time} 
                  onValueChange={(value) => updateFormData("time", value)}
                >
                  <SelectTrigger id="time" className="w-full">
                    <SelectValue placeholder="Wählen Sie eine Uhrzeit" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeOptions.map((time) => (
                      <SelectItem key={time} value={time}>
                        {time} Uhr
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
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
