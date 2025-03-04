
import {
  getCheckIns as checkInServiceGetCheckIns,
  deleteCheckIn as checkInServiceDeleteCheckIn,
} from "@/lib/services/checkInService";

import {
  getCompanySettings as companyServiceGetCompanySettings,
  updateCompanySettings as companyServiceUpdateCompanySettings,
} from "@/lib/services/companyService";

import {
  saveDocument as documentServiceSaveDocument,
  getDocuments as documentServiceGetDocuments,
  deleteDocument as documentServiceDeleteDocument,
} from "@/lib/services/documentService";

import * as userService from "@/lib/services/userService";

// SMTP Konfiguration für E-Mail-Versand
export const SMTP_HOST = process.env.SMTP_HOST || "smtp.example.com";
export const SMTP_PORT = parseInt(process.env.SMTP_PORT || "587", 10);
export const SMTP_USER = process.env.SMTP_USER || "user@example.com";
export const SMTP_PASS = process.env.SMTP_PASS || "password";
export const SMTP_FROM = process.env.SMTP_FROM || "noreply@example.com";
export const SMTP_TO = process.env.SMTP_TO || "admin@example.com";

// Check-ins
export const getCheckIns = async () => {
  try {
    return await checkInServiceGetCheckIns();
  } catch (error) {
    console.error("API error - getCheckIns:", error);
    return [];
  }
};

export const createCheckIn = async (checkInData: any) => {
  try {
    // Implementierung für createCheckIn
    console.log("Creating check-in:", checkInData);
    return {
      success: true,
      message: "Check-in erfolgreich erstellt",
      reportUrl: `/reports/${Date.now()}.pdf`
    };
  } catch (error) {
    console.error("API error - createCheckIn:", error);
    return { success: false, message: "Failed to create check-in" };
  }
};

export const updateCheckIn = async (id: string, checkInData: any) => {
  try {
    // Implementierung für updateCheckIn
    console.log(`Updating check-in ${id}:`, checkInData);
    return { success: true, message: "Check-in erfolgreich aktualisiert" };
  } catch (error) {
    console.error("API error - updateCheckIn:", error);
    return { success: false, message: "Failed to update check-in" };
  }
};

export const deleteCheckIn = async (id: string) => {
  try {
    return await checkInServiceDeleteCheckIn(id);
  } catch (error) {
    console.error("API error - deleteCheckIn:", error);
    return { success: false, message: "Failed to delete check-in" };
  }
};

export const generatePdfReport = async (checkInId: string) => {
  try {
    // Implementierung für generatePdfReport
    console.log(`Generating PDF report for check-in ${checkInId}`);
    return { 
      success: true, 
      message: "PDF-Bericht erfolgreich generiert",
      pdfUrl: `/reports/${checkInId}.pdf`
    };
  } catch (error) {
    console.error("API error - generatePdfReport:", error);
    return { success: false, message: "Failed to generate PDF report" };
  }
};

// Company Settings
export const getCompanySettings = async () => {
  try {
    return await companyServiceGetCompanySettings();
  } catch (error) {
    console.error("API error - getCompanySettings:", error);
    return null;
  }
};

export const updateCompanySettings = async (settingsData: any) => {
  try {
    return await companyServiceUpdateCompanySettings(settingsData);
  } catch (error) {
    console.error("API error - updateCompanySettings:", error);
    return { success: false, message: "Failed to update company settings" };
  }
};

// PDF Documents
export const saveDocument = async (pdfData: any) => {
  try {
    return await documentServiceSaveDocument(pdfData);
  } catch (error) {
    console.error("API error - saveDocument:", error);
    return { success: false, message: "Failed to save PDF document" };
  }
};

export const getDocuments = async () => {
  try {
    return await documentServiceGetDocuments();
  } catch (error) {
    console.error("API error - getDocuments:", error);
    return [];
  }
};

export const deleteDocument = async (id: string) => {
  try {
    return await documentServiceDeleteDocument(id);
  } catch (error) {
    console.error("API error - deleteDocument:", error);
    return { success: false, message: "Failed to delete PDF document" };
  }
};

// Admin Authentifizierung
export const authenticateUser = async (username: string, password: string) => {
  try {
    return await userService.authenticateUser(username, password);
  } catch (error) {
    console.error('API error - authenticateUser:', error);
    return { success: false, message: 'Authentifizierungsfehler' };
  }
};

// Check-in Submission
export const submitCheckIn = async (data: any) => {
  try {
    // Implementierung für submitCheckIn
    console.log("Submitting check-in:", data);
    return {
      success: true,
      message: "Check-in erfolgreich übermittelt",
      reportUrl: `/reports/${Date.now()}.pdf`
    };
  } catch (error) {
    console.error('API error - submitCheckIn:', error);
    return { success: false, message: 'Fehler bei der Übermittlung' };
  }
};
