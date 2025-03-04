import {
  getCheckIns as checkInServiceGetCheckIns,
  createCheckIn as checkInServiceCreateCheckIn,
  updateCheckIn as checkInServiceUpdateCheckIn,
  deleteCheckIn as checkInServiceDeleteCheckIn,
  generatePdfReport as checkInServiceGeneratePdfReport,
} from "@/lib/services/checkInService";
import {
  getCompanySettings as companyServiceGetCompanySettings,
  updateCompanySettings as companyServiceUpdateCompanySettings,
} from "@/lib/services/companyService";
import {
  uploadPDFDocument as documentServiceUploadPDFDocument,
  getPDFDocuments as documentServiceGetPDFDocuments,
  deletePDFDocument as documentServiceDeletePDFDocument,
} from "@/lib/services/documentService";
import * as userService from "@/lib/services/userService";

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
    return await checkInServiceCreateCheckIn(checkInData);
  } catch (error) {
    console.error("API error - createCheckIn:", error);
    return { success: false, message: "Failed to create check-in" };
  }
};

export const updateCheckIn = async (id: string, checkInData: any) => {
  try {
    return await checkInServiceUpdateCheckIn(id, checkInData);
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
    return await checkInServiceGeneratePdfReport(checkInId);
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
export const uploadPDFDocument = async (pdfData: any) => {
  try {
    return await documentServiceUploadPDFDocument(pdfData);
  } catch (error) {
    console.error("API error - uploadPDFDocument:", error);
    return { success: false, message: "Failed to upload PDF document" };
  }
};

export const getPDFDocuments = async () => {
  try {
    return await documentServiceGetPDFDocuments();
  } catch (error) {
    console.error("API error - getPDFDocuments:", error);
    return [];
  }
};

export const deletePDFDocument = async (id: string) => {
  try {
    return await documentServiceDeletePDFDocument(id);
  } catch (error) {
    console.error("API error - deletePDFDocument:", error);
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
