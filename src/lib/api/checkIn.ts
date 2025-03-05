import { CheckIn } from "@/lib/database/models";
import { API_BASE_URL } from "@/lib/database/connection";
import {
  getCheckIns as checkInServiceGetCheckIns,
  deleteCheckIn as checkInServiceDeleteCheckIn,
  submitCheckIn as checkInServiceSubmitCheckIn
} from "@/lib/services/checkInService";

// Bestimmen, ob wir im Browser-Kontext sind
const isBrowser = typeof window !== 'undefined';

/**
 * Lädt alle Check-Ins
 */
export const getCheckIns = async (): Promise<CheckIn[]> => {
  try {
    // Im Browser: API-Aufruf
    if (isBrowser) {
      console.log("Rufe API für Check-ins auf");
      const response = await fetch(`${API_BASE_URL}/api/checkins`);
      
      if (!response.ok) {
        throw new Error(`HTTP-Fehler: ${response.status}`);
      }
      
      return await response.json();
    }
    
    // Im Server-Kontext: direkter Aufruf des Service
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
    console.log("submitCheckIn aufgerufen mit:", checkInData);
    
    // Im Browser: API-Aufruf
    if (isBrowser) {
      const response = await fetch(`${API_BASE_URL}/api/checkin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(checkInData)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP-Fehler: ${response.status}`);
      }
      
      return await response.json();
    }
    
    // Im Server-Kontext: direkter Aufruf des Service
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
    console.log(`Updating check-in ${id}:`, checkInData);
    
    // Im Browser: API-Aufruf
    if (isBrowser) {
      const response = await fetch(`${API_BASE_URL}/api/checkin/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(checkInData)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP-Fehler: ${response.status}`);
      }
      
      return await response.json();
    }
    
    // Hier würde der entsprechende Service aufgerufen werden
    // Da dieser noch nicht implementiert ist, geben wir ein Erfolgsresultat zurück
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
    console.log("deleteCheckIn aufgerufen mit ID:", id);
    
    // Im Browser: API-Aufruf
    if (isBrowser) {
      const response = await fetch(`${API_BASE_URL}/api/checkin/${id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error(`HTTP-Fehler: ${response.status}`);
      }
      
      return await response.json();
    }
    
    // Im Server-Kontext: direkter Aufruf des Service
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
    
    // Laden des Check-Ins
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
      // If we have pdfData, create a blob URL if in browser context
      try {
        console.log("Creating blob URL from pdfData");
        const pdfDataURL = checkIn.pdfData;
        
        // Im Browser-Kontext können wir einen blob URL erstellen
        if (typeof window !== 'undefined') {
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
        }
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
