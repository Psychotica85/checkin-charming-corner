
import {
  getCheckIns as checkInServiceGetCheckIns,
  deleteCheckIn as checkInServiceDeleteCheckIn,
  submitCheckIn as checkInServiceSubmitCheckIn
} from "@/lib/services/checkInService";

import {
  getCompanySettings as companyServiceGetCompanySettings,
  updateCompanySettings as companyServiceUpdateCompanySettings,
} from "@/lib/services/companySettingsService";

import {
  saveDocument as documentServiceSaveDocument,
  getDocuments as documentServiceGetDocuments,
  deleteDocument as documentServiceDeleteDocument,
} from "@/lib/services/documentService";

import * as userService from "@/lib/services/userService";

// SMTP Konfiguration für E-Mail-Versand
// Verwende import.meta.env für Vite statt process.env
export const SMTP_HOST = import.meta.env.VITE_SMTP_HOST || "smtp.example.com";
export const SMTP_PORT = parseInt(import.meta.env.VITE_SMTP_PORT || "587", 10);
export const SMTP_USER = import.meta.env.VITE_SMTP_USER || "user@example.com";
export const SMTP_PASS = import.meta.env.VITE_SMTP_PASS || "password";
export const SMTP_FROM = import.meta.env.VITE_SMTP_FROM || "noreply@example.com";
export const SMTP_TO = import.meta.env.VITE_SMTP_TO || "admin@example.com";

// Fallback-Werte für den Fall, dass Daten nicht geladen werden können
const DEFAULT_COMPANY_SETTINGS = {
  id: '1',
  address: 'Musterfirma GmbH\nMusterstraße 123\n12345 Musterstadt\nDeutschland',
  logo: null,
  updatedAt: new Date().toISOString()
};

// Check-ins
export const getCheckIns = async () => {
  try {
    // Prüfen, ob wir im Browser-Kontext sind
    if (typeof window !== 'undefined') {
      const localCheckIns = localStorage.getItem('checkIns');
      return localCheckIns ? JSON.parse(localCheckIns) : [];
    }
    return await checkInServiceGetCheckIns();
  } catch (error) {
    console.error("API error - getCheckIns:", error);
    return [];
  }
};

export const submitCheckIn = async (checkInData: any) => {
  try {
    // Prüfen, ob wir im Browser-Kontext sind
    if (typeof window !== 'undefined') {
      const localCheckIns = localStorage.getItem('checkIns');
      const checkIns = localCheckIns ? JSON.parse(localCheckIns) : [];
      const newCheckIn = {
        ...checkInData,
        id: Date.now().toString(),
        createdAt: new Date().toISOString()
      };
      checkIns.push(newCheckIn);
      localStorage.setItem('checkIns', JSON.stringify(checkIns));
      return { success: true, message: "Check-in erfolgreich erstellt" };
    }
    return await checkInServiceSubmitCheckIn(checkInData);
  } catch (error) {
    console.error("API error - submitCheckIn:", error);
    return { success: false, message: "Fehler beim Erstellen des Check-ins" };
  }
};

export const updateCheckIn = async (id: string, checkInData: any) => {
  try {
    // Prüfen, ob wir im Browser-Kontext sind
    if (typeof window !== 'undefined') {
      const localCheckIns = localStorage.getItem('checkIns');
      const checkIns = localCheckIns ? JSON.parse(localCheckIns) : [];
      const updatedCheckIns = checkIns.map((checkIn: any) => 
        checkIn.id === id ? { ...checkIn, ...checkInData } : checkIn
      );
      localStorage.setItem('checkIns', JSON.stringify(updatedCheckIns));
      return { success: true, message: "Check-in erfolgreich aktualisiert" };
    }
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
    // Prüfen, ob wir im Browser-Kontext sind
    if (typeof window !== 'undefined') {
      const localCheckIns = localStorage.getItem('checkIns');
      const checkIns = localCheckIns ? JSON.parse(localCheckIns) : [];
      const filteredCheckIns = checkIns.filter((checkIn: any) => checkIn.id !== id);
      localStorage.setItem('checkIns', JSON.stringify(filteredCheckIns));
      return { success: true, message: "Check-in erfolgreich gelöscht" };
    }
    return await checkInServiceDeleteCheckIn(id);
  } catch (error) {
    console.error("API error - deleteCheckIn:", error);
    return { success: false, message: "Failed to delete check-in" };
  }
};

export const generatePdfReport = async (checkInId: string) => {
  try {
    console.log("Generating PDF report for check-in ID:", checkInId);
    const checkIns = await getCheckIns();
    const checkIn = checkIns.find((item: any) => item.id === checkInId);
    
    if (!checkIn) {
      console.error("Check-in not found:", checkInId);
      return { 
        success: false, 
        message: "Check-in konnte nicht gefunden werden"
      };
    }
    
    // Log the found check-in to see what data we have
    console.log("Found check-in:", checkIn);
    
    // Check if the check-in has reportUrl or pdfData
    if (checkIn.reportUrl) {
      console.log("Using existing reportUrl:", checkIn.reportUrl);
      return { 
        success: true, 
        message: "PDF-Bericht verfügbar",
        pdfUrl: checkIn.reportUrl
      };
    } else if (checkIn.pdfData) {
      // If we have pdfData, create a blob URL
      try {
        console.log("Creating blob URL from pdfData");
        const pdfDataURL = checkIn.pdfData;
        const byteString = atob(pdfDataURL.split(',')[1]);
        const mimeString = pdfDataURL.split(',')[0].split(':')[1].split(';')[0];
        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);
        for (let i = 0; i < byteString.length; i++) {
          ia[i] = byteString.charCodeAt(i);
        }
        const blob = new Blob([ab], { type: mimeString });
        const pdfUrl = URL.createObjectURL(blob);
        console.log("Created blob URL:", pdfUrl);
        
        return { 
          success: true, 
          message: "PDF-Bericht wurde generiert",
          pdfUrl: pdfUrl
        };
      } catch (error) {
        console.error("Error creating blob URL from pdfData:", error);
      }
    }
    
    // Fallback: use a placeholder URL
    const fallbackUrl = `/reports/${checkInId}.pdf`;
    console.log("Using fallback URL:", fallbackUrl);
    
    return { 
      success: true, 
      message: "PDF-Bericht wurde generiert (Platzhalter)",
      pdfUrl: fallbackUrl
    };
  } catch (error) {
    console.error("API error - generatePdfReport:", error);
    return { 
      success: false, 
      message: "Fehler beim Generieren des PDF-Berichts"
    };
  }
};

// Company Settings
export const getCompanySettings = async () => {
  try {
    // Prüfen, ob wir im Browser-Kontext sind
    if (typeof window !== 'undefined') {
      console.log("Browser-Kontext erkannt, verwende lokale Einstellungen");
      const localSettings = localStorage.getItem('companySettings');
      if (localSettings) {
        return JSON.parse(localSettings);
      }
      // Standardwerte setzen, wenn keine Einstellungen vorhanden sind
      const defaultSettings = DEFAULT_COMPANY_SETTINGS;
      localStorage.setItem('companySettings', JSON.stringify(defaultSettings));
      return defaultSettings;
    }
    
    // Server-Kontext: Normale Datenbankabfrage
    const settings = await companyServiceGetCompanySettings();
    if (!settings) {
      console.log("Keine Unternehmenseinstellungen in der Datenbank gefunden, verwende Standardwerte");
      return DEFAULT_COMPANY_SETTINGS;
    }
    return settings;
  } catch (error) {
    console.error("API error - getCompanySettings:", error);
    console.log("Fehler beim Laden der Unternehmenseinstellungen, verwende Standardwerte");
    return DEFAULT_COMPANY_SETTINGS;
  }
};

export const updateCompanySettings = async (settingsData: any) => {
  try {
    // Prüfen, ob wir im Browser-Kontext sind
    if (typeof window !== 'undefined') {
      console.log("Browser-Kontext erkannt, aktualisiere lokale Einstellungen");
      const localSettings = localStorage.getItem('companySettings');
      const currentSettings = localSettings ? JSON.parse(localSettings) : DEFAULT_COMPANY_SETTINGS;
      const updatedSettings = {
        ...currentSettings,
        ...settingsData,
        updatedAt: new Date().toISOString()
      };
      localStorage.setItem('companySettings', JSON.stringify(updatedSettings));
      return { success: true, message: "Unternehmenseinstellungen erfolgreich aktualisiert" };
    }
    
    return await companyServiceUpdateCompanySettings(settingsData);
  } catch (error) {
    console.error("API error - updateCompanySettings:", error);
    return { success: false, message: "Failed to update company settings" };
  }
};

// PDF Documents
export const saveDocument = async (pdfData: any) => {
  try {
    // Prüfen, ob wir im Browser-Kontext sind
    if (typeof window !== 'undefined') {
      const localDocuments = localStorage.getItem('pdfDocuments');
      const documents = localDocuments ? JSON.parse(localDocuments) : [];
      const newDocument = {
        ...pdfData,
        id: Date.now().toString(),
        createdAt: new Date().toISOString()
      };
      documents.push(newDocument);
      localStorage.setItem('pdfDocuments', JSON.stringify(documents));
      return { success: true, message: "Dokument erfolgreich gespeichert", documentId: newDocument.id };
    }
    
    return await documentServiceSaveDocument(pdfData);
  } catch (error) {
    console.error("API error - saveDocument:", error);
    return { success: false, message: "Failed to save PDF document" };
  }
};

export const getDocuments = async () => {
  try {
    // Prüfen, ob wir im Browser-Kontext sind
    if (typeof window !== 'undefined') {
      const localDocuments = localStorage.getItem('pdfDocuments');
      return localDocuments ? JSON.parse(localDocuments) : [];
    }
    
    return await documentServiceGetDocuments();
  } catch (error) {
    console.error("API error - getDocuments:", error);
    return [];
  }
};

export const deleteDocument = async (id: string) => {
  try {
    // Prüfen, ob wir im Browser-Kontext sind
    if (typeof window !== 'undefined') {
      const localDocuments = localStorage.getItem('pdfDocuments');
      const documents = localDocuments ? JSON.parse(localDocuments) : [];
      const filteredDocuments = documents.filter((doc: any) => doc.id !== id);
      localStorage.setItem('pdfDocuments', JSON.stringify(filteredDocuments));
      return { success: true, message: "Dokument erfolgreich gelöscht" };
    }
    
    return await documentServiceDeleteDocument(id);
  } catch (error) {
    console.error("API error - deleteDocument:", error);
    return { success: false, message: "Failed to delete PDF document" };
  }
};

// Admin Authentifizierung
export const authenticateUser = async (username: string, password: string) => {
  try {
    // Im Browser-Kontext einfache Demo-Authentifizierung
    if (typeof window !== 'undefined') {
      // Demo-Authentifizierung für Entwicklungszwecke
      if (username === 'admin' && password === 'password') {
        localStorage.setItem('authUser', JSON.stringify({ username, role: 'admin' }));
        return { success: true, message: 'Erfolgreich angemeldet', user: { username, role: 'admin' } };
      }
      return { success: false, message: 'Ungültige Anmeldedaten' };
    }
    
    return await userService.authenticateUser(username, password);
  } catch (error) {
    console.error('API error - authenticateUser:', error);
    return { success: false, message: 'Authentifizierungsfehler' };
  }
};
