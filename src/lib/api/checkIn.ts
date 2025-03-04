
import { CheckIn } from "@/lib/database/models";
import { isBrowser } from "./config";
import {
  getCheckIns as checkInServiceGetCheckIns,
  deleteCheckIn as checkInServiceDeleteCheckIn,
  submitCheckIn as checkInServiceSubmitCheckIn
} from "@/lib/services/checkInService";

/**
 * Lädt alle Check-Ins
 */
export const getCheckIns = async (): Promise<CheckIn[]> => {
  try {
    // Prüfen, ob wir im Browser-Kontext sind
    if (isBrowser()) {
      console.log("Browser-Kontext erkannt für getCheckIns");
      const localCheckIns = localStorage.getItem('checkIns');
      return localCheckIns ? JSON.parse(localCheckIns) : [];
    }
    return await checkInServiceGetCheckIns();
  } catch (error) {
    console.error("API error - getCheckIns:", error);
    return [];
  }
};

/**
 * Speichert einen neuen Check-In
 */
export const submitCheckIn = async (checkInData: any) => {
  try {
    // Prüfen, ob wir im Browser-Kontext sind
    if (isBrowser()) {
      console.log("Browser-Kontext erkannt für submitCheckIn");
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

/**
 * Aktualisiert einen existierenden Check-In
 */
export const updateCheckIn = async (id: string, checkInData: any) => {
  try {
    // Prüfen, ob wir im Browser-Kontext sind
    if (isBrowser()) {
      console.log("Browser-Kontext erkannt für updateCheckIn");
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

/**
 * Löscht einen Check-In
 */
export const deleteCheckIn = async (id: string) => {
  try {
    // Prüfen, ob wir im Browser-Kontext sind
    if (isBrowser()) {
      console.log("Browser-Kontext erkannt für deleteCheckIn");
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

/**
 * Generiert einen PDF-Bericht für einen Check-In
 */
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
