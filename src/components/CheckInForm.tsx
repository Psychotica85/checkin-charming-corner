
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { submitCheckIn } from "@/lib/api";
import { getDocuments } from "@/lib/services/documentService";
import { PDFDocument } from "@/lib/database/models";

// Import our components
import StepIndicator from "./check-in/StepIndicator";
import PersonalInfoStep from "./check-in/PersonalInfoStep";
import DocumentsStep from "./check-in/DocumentsStep";
import ConfirmationStep from "./check-in/ConfirmationStep";
import FormNavigation from "./check-in/FormNavigation";
import SuccessView from "./check-in/SuccessView";
import { formSteps, generateTimeOptions } from "./check-in/utils";

const timeOptions = generateTimeOptions();

// Function to get current time rounded to nearest 15 minutes
const getCurrentTimeOption = () => {
  const now = new Date();
  const minutes = now.getMinutes();
  const roundedMinutes = Math.round(minutes / 15) * 15;
  now.setMinutes(roundedMinutes);
  now.setSeconds(0);
  now.setMilliseconds(0);
  
  const hours = now.getHours().toString().padStart(2, '0');
  const mins = now.getMinutes().toString().padStart(2, '0');
  
  return `${hours}:${mins}`;
};

const CheckInForm = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    company: "",
    visitReason: "",
    date: new Date(), // Current date
    time: getCurrentTimeOption(), // Current time rounded to nearest 15 minutes
  });
  const [loading, setLoading] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [documents, setDocuments] = useState<PDFDocument[]>([]);
  const [acceptedDocuments, setAcceptedDocuments] = useState<string[]>([]);
  const [reportUrl, setReportUrl] = useState<string | null>(null);

  useEffect(() => {
    // Load documents from the API
    const loadDocuments = async () => {
      try {
        const docs = await getDocuments();
        if (docs && docs.length > 0) {
          setDocuments(docs);
        }
      } catch (error) {
        console.error("Error loading documents:", error);
        // Try to load from localStorage as fallback
        const storedDocs = localStorage.getItem("pdfDocuments");
        if (storedDocs) {
          try {
            setDocuments(JSON.parse(storedDocs));
          } catch (e) {
            console.error("Error parsing documents from localStorage:", e);
          }
        }
      }
    };
    
    loadDocuments();
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
        setReportUrl(result.reportUrl || null);
        toast.success(result.message || "Check-in erfolgreich!");
      } else {
        toast.error(result.message || "Fehler beim Check-in");
      }
    } catch (error) {
      console.error("Check-in error:", error);
      toast.error("Es ist ein Fehler aufgetreten. Bitte versuchen Sie es später erneut.");
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
      date: new Date(), // Reset to current date
      time: getCurrentTimeOption(), // Reset to current time
    });
    setAcceptedDocuments([]);
    setCurrentStep(0);
    setCompleted(false);
    setReportUrl(null);
  };

  if (completed) {
    return (
      <SuccessView 
        firstName={formData.firstName} 
        onReset={handleReset}
        reportUrl={reportUrl}
      />
    );
  }

  return (
    <div className="w-full px-6 py-8 rounded-2xl space-y-6 animate-fade-in border border-border bg-background/50 backdrop-blur-sm">
      {/* Progress indicator */}
      <StepIndicator steps={formSteps} currentStep={currentStep} />

      {/* Step title */}
      <div className="space-y-1">
        <h2 className="text-2xl font-medium">{formSteps[currentStep].title}</h2>
        <p className="text-muted-foreground">{formSteps[currentStep].description}</p>
      </div>

      {/* Form steps */}
      <div className="space-y-6">
        {currentStep === 0 && (
          <PersonalInfoStep 
            formData={formData} 
            updateFormData={updateFormData} 
            timeOptions={timeOptions} 
          />
        )}

        {currentStep === 1 && (
          <DocumentsStep 
            documents={documents} 
            acceptedDocuments={acceptedDocuments} 
            onAcceptDocument={handleAcceptDocument} 
          />
        )}

        {currentStep === 2 && (
          <ConfirmationStep 
            formData={formData} 
            documents={documents} 
            acceptedDocuments={acceptedDocuments} 
          />
        )}
      </div>

      {/* Navigation buttons */}
      <FormNavigation 
        currentStep={currentStep}
        totalSteps={formSteps.length}
        onNext={handleNext}
        onBack={handleBack}
        loading={loading}
        isFirstStep={currentStep === 0}
      />
    </div>
  );
};

export default CheckInForm;
