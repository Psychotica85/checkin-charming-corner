
import { CheckIn } from "@/lib/database/models";
import { isBrowser } from "@/lib/api/config";
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
    // Im Browser-Kontext verwenden wir sessionStorage für die Demo
    if (isBrowser) {
      console.log("Browser-Kontext erkannt, lade Check-Ins aus sessionStorage");
      
      const storedCheckIns = sessionStorage.getItem('checkIns');
      if (storedCheckIns) {
        return JSON.parse(storedCheckIns);
      }
      
      // Leere Liste zurückgeben, wenn keine Check-Ins gespeichert sind
      return [];
    }
    
    // Im Server-Kontext den richtigen Service aufrufen
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
    
    // Im Browser-Kontext verwenden wir sessionStorage für die Demo
    if (isBrowser) {
      console.log("Browser-Kontext erkannt, speichere Check-In in sessionStorage");
      
      // Unique ID generieren
      const id = Date.now().toString();
      
      // CheckIn Objekt erstellen
      const newCheckIn = {
        id,
        ...checkInData,
        timestamp: new Date().toISOString()
      };
      
      // Bestehende Check-Ins laden
      const checkIns = JSON.parse(sessionStorage.getItem('checkIns') || '[]');
      
      // Neuen Check-In hinzufügen
      checkIns.push(newCheckIn);
      
      // Im sessionStorage speichern
      sessionStorage.setItem('checkIns', JSON.stringify(checkIns));
      
      // PDF-Report URL simulieren
      const reportUrl = `data:application/pdf;base64,JVBERi0xLjcKCjEgMCBvYmogICUgZW50cnkgcG9pbnQKPDwKICAvVHlwZSAvQ2F0YWxvZwogIC9QYWdlcyAyIDAgUgo+PgplbmRvYmoKCjIgMCBvYmoKPDwKICAvVHlwZSAvUGFnZXMKICAvTWVkaWFCb3ggWyAwIDAgMjAwIDIwMCBdCiAgL0NvdW50IDEKICAvS2lkcyBbIDMgMCBSIF0KPj4KZW5kb2JqCgozIDAgb2JqCjw8CiAgL1R5cGUgL1BhZ2UKICAvUGFyZW50IDIgMCBSCiAgL1Jlc291cmNlcyA8PAogICAgL0ZvbnQgPDwKICAgICAgL0YxIDQgMCBSIAogICAgPj4KICA+PgogIC9Db250ZW50cyA1IDAgUgo+PgplbmRvYmoKCjQgMCBvYmoKPDwKICAvVHlwZSAvRm9udAogIC9TdWJ0eXBlIC9UeXBlMQogIC9CYXNlRm9udCAvVGltZXMtUm9tYW4KPj4KZW5kb2JqCgo1IDAgb2JqICAlIHBhZ2UgY29udGVudAo8PAogIC9MZW5ndGggNDQKPj4Kc3RyZWFtCkJUCjcwIDUwIFRECi9GMSAxMiBUZgooQ2hlY2staW4gQmVzdGF0aWd1bmcpIFRqCkVUCmVuZHN0cmVhbQplbmRvYmoKCnhyZWYKMCA2CjAwMDAwMDAwMDAgNjU1MzUgZiAKMDAwMDAwMDAxMCAwMDAwMCBuIAowMDAwMDAwMDc5IDAwMDAwIG4gCjAwMDAwMDAxNzMgMDAwMDAgbiAKMDAwMDAwMDMwMSAwMDAwMCBuIAowMDAwMDAwMzgwIDAwMDAwIG4gCnRyYWlsZXIKPDwKICAvU2l6ZSA2CiAgL1Jvb3QgMSAwIFIKPj4Kc3RhcnR4cmVmCjQ5MgolJUVPRgo=`;
      
      return { 
        success: true, 
        message: "Check-in erfolgreich gespeichert",
        reportUrl: reportUrl
      };
    }
    
    // Im Server-Kontext den richtigen Service aufrufen
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
    
    // Im Browser-Kontext verwenden wir sessionStorage für die Demo
    if (isBrowser) {
      console.log("Browser-Kontext erkannt, aktualisiere Check-In in sessionStorage");
      
      // Bestehende Check-Ins laden
      const checkIns = JSON.parse(sessionStorage.getItem('checkIns') || '[]');
      
      // Check-In mit der entsprechenden ID finden und aktualisieren
      const updatedCheckIns = checkIns.map((checkIn: any) => {
        if (checkIn.id === id) {
          return { ...checkIn, ...checkInData };
        }
        return checkIn;
      });
      
      // Im sessionStorage speichern
      sessionStorage.setItem('checkIns', JSON.stringify(updatedCheckIns));
      
      return { 
        success: true, 
        message: "Check-in erfolgreich aktualisiert" 
      };
    }
    
    // Im Server-Kontext würde hier der entsprechende Service aufgerufen werden
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
    
    // Im Browser-Kontext verwenden wir sessionStorage für die Demo
    if (isBrowser) {
      console.log("Browser-Kontext erkannt, lösche Check-In aus sessionStorage");
      
      // Bestehende Check-Ins laden
      const checkIns = JSON.parse(sessionStorage.getItem('checkIns') || '[]');
      
      // Check-In mit der entsprechenden ID filtern
      const filteredCheckIns = checkIns.filter((checkIn: any) => checkIn.id !== id);
      
      // Im sessionStorage speichern
      sessionStorage.setItem('checkIns', JSON.stringify(filteredCheckIns));
      
      return { 
        success: true, 
        message: "Check-in erfolgreich gelöscht" 
      };
    }
    
    // Im Server-Kontext den richtigen Service aufrufen
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
    
    // Im Browser-Kontext
    if (isBrowser) {
      console.log("Browser-Kontext erkannt, generiere PDF-Bericht aus sessionStorage");
      
      // Bestehende Check-Ins laden
      const checkIns = JSON.parse(sessionStorage.getItem('checkIns') || '[]');
      const checkIn = checkIns.find((item: any) => item.id === checkInId);
      
      if (!checkIn) {
        console.error("Check-in not found:", checkInId);
        return { 
          success: false, 
          message: "Check-in konnte nicht gefunden werden"
        };
      }
      
      // Simulierter PDF-Bericht
      const pdfUrl = `data:application/pdf;base64,JVBERi0xLjcKCjEgMCBvYmogICUgZW50cnkgcG9pbnQKPDwKICAvVHlwZSAvQ2F0YWxvZwogIC9QYWdlcyAyIDAgUgo+PgplbmRvYmoKCjIgMCBvYmoKPDwKICAvVHlwZSAvUGFnZXMKICAvTWVkaWFCb3ggWyAwIDAgMjAwIDIwMCBdCiAgL0NvdW50IDEKICAvS2lkcyBbIDMgMCBSIF0KPj4KZW5kb2JqCgozIDAgb2JqCjw8CiAgL1R5cGUgL1BhZ2UKICAvUGFyZW50IDIgMCBSCiAgL1Jlc291cmNlcyA8PAogICAgL0ZvbnQgPDwKICAgICAgL0YxIDQgMCBSIAogICAgPj4KICA+PgogIC9Db250ZW50cyA1IDAgUgo+PgplbmRvYmoKCjQgMCBvYmoKPDwKICAvVHlwZSAvRm9udAogIC9TdWJ0eXBlIC9UeXBlMQogIC9CYXNlRm9udCAvVGltZXMtUm9tYW4KPj4KZW5kb2JqCgo1IDAgb2JqICAlIHBhZ2UgY29udGVudAo8PAogIC9MZW5ndGggNDQKPj4Kc3RyZWFtCkJUCjcwIDUwIFRECi9GMSAxMiBUZgooQ2hlY2staW4gQmVzdGF0aWd1bmcpIFRqCkVUCmVuZHN0cmVhbQplbmRvYmoKCnhyZWYKMCA2CjAwMDAwMDAwMDAgNjU1MzUgZiAKMDAwMDAwMDAxMCAwMDAwMCBuIAowMDAwMDAwMDc5IDAwMDAwIG4gCjAwMDAwMDAxNzMgMDAwMDAgbiAKMDAwMDAwMDMwMSAwMDAwMCBuIAowMDAwMDAwMzgwIDAwMDAwIG4gCnRyYWlsZXIKPDwKICAvU2l6ZSA2CiAgL1Jvb3QgMSAwIFIKPj4Kc3RhcnR4cmVmCjQ5MgolJUVPRgo=`;
      
      return { 
        success: true, 
        message: "PDF-Bericht wurde generiert",
        pdfUrl: pdfUrl
      };
    }
    
    // Server-seitige Implementierung
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
