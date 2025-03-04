
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { submitCheckIn, getDocuments } from "@/lib/api";
import { PDFDocument } from "@/lib/database/models";
import { generateTimeOptions, getCurrentTimeOption } from "@/components/check-in/utils";

export interface CheckInFormData {
  firstName: string;
  lastName: string;
  company: string;
  visitReason: string;
  date: Date;
  time: string;
}

export const useCheckInForm = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<CheckInFormData>({
    firstName: "",
    lastName: "",
    company: "",
    visitReason: "",
    date: new Date(),
    time: getCurrentTimeOption(),
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

  const validateCurrentStep = () => {
    if (currentStep === 0) {
      if (!formData.firstName || !formData.lastName || !formData.company || !formData.visitReason) {
        toast.error("Bitte füllen Sie alle Felder aus.");
        return false;
      }
    }
    
    if (currentStep === 1) {
      if (documents.length === 0) {
        // If no documents are uploaded, allow to proceed
        return true;
      }
      
      if (acceptedDocuments.length < documents.length) {
        toast.error("Bitte bestätigen Sie alle Dokumente, um fortzufahren.");
        return false;
      }
    }
    
    return true;
  };

  const handleNext = () => {
    if (!validateCurrentStep()) return;
    
    if (currentStep < 2) { // formSteps.length - 1
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
      date: new Date(),
      time: getCurrentTimeOption(),
    });
    setAcceptedDocuments([]);
    setCurrentStep(0);
    setCompleted(false);
    setReportUrl(null);
  };

  return {
    currentStep,
    formData,
    loading,
    completed,
    documents,
    acceptedDocuments,
    reportUrl,
    updateFormData,
    handleAcceptDocument,
    handleNext,
    handleBack,
    handleReset
  };
};
