
import React from "react";
import { useCheckInForm } from "@/hooks/useCheckInForm";
import { formSteps, generateTimeOptions } from "./check-in/utils";

// Import our components
import StepIndicator from "./check-in/StepIndicator";
import PersonalInfoStep from "./check-in/PersonalInfoStep";
import DocumentsStep from "./check-in/DocumentsStep";
import ConfirmationStep from "./check-in/ConfirmationStep";
import FormNavigation from "./check-in/FormNavigation";
import SuccessView from "./check-in/SuccessView";

const timeOptions = generateTimeOptions();

const CheckInForm = () => {
  console.log("CheckInForm rendering"); // Debug log
  
  const {
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
  } = useCheckInForm();

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
    <div className="w-full px-6 py-8 rounded-2xl space-y-6 animate-fade-in border border-border bg-card shadow-sm">
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
