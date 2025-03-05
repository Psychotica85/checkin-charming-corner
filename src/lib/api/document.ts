import { API_BASE_URL } from "@/lib/database/connection";
import {
  saveDocument as documentServiceSaveDocument,
  getDocuments as documentServiceGetDocuments,
  deleteDocument as documentServiceDeleteDocument,
} from "@/lib/services/documentService";

// Bestimmen, ob wir im Browser-Kontext sind
const isBrowser = typeof window !== 'undefined';

/**
 * Speichert ein Dokument
 */
export const saveDocument = async (pdfData: any) => {
  try {
    console.log("saveDocument aufgerufen");
    
    // Im Browser: API-Aufruf
    if (isBrowser) {
      console.log("Browser-Kontext: Sende Dokument an API");
      const response = await fetch(`${API_BASE_URL}/api/document`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(pdfData)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP-Fehler: ${response.status}`);
      }
      
      const result = await response.json();
      return { 
        success: Boolean(result.success),
        message: result.success ? "Dokument wurde erfolgreich gespeichert" : "Fehler beim Speichern des Dokuments",
        document: result.document
      };
    }
    
    // Server-Kontext: direkter Aufruf des Dokumentendienstes
    const result = await documentServiceSaveDocument(pdfData);
    return { 
      success: Boolean(result),
      message: result ? "Dokument wurde erfolgreich gespeichert" : "Fehler beim Speichern des Dokuments",
      document: result
    };
  } catch (error) {
    console.error("API error - saveDocument:", error);
    return { success: false, message: "Failed to save PDF document" };
  }
};

/**
 * Lädt alle Dokumente
 */
export const getDocuments = async () => {
  try {
    console.log("getDocuments aufgerufen");
    
    // Im Browser: API-Aufruf
    if (isBrowser) {
      console.log("Browser-Kontext: Rufe API für Dokumente auf");
      const response = await fetch(`${API_BASE_URL}/api/documents`);
      
      if (!response.ok) {
        throw new Error(`HTTP-Fehler: ${response.status}`);
      }
      
      return await response.json();
    }
    
    // Im Server-Kontext den richtigen Service aufrufen
    return await documentServiceGetDocuments();
  } catch (error) {
    console.error("API error - getDocuments:", error);
    return [];
  }
};

/**
 * Löscht ein Dokument
 */
export const deleteDocument = async (id: string) => {
  try {
    console.log("deleteDocument aufgerufen mit ID:", id);
    
    // Im Browser: API-Aufruf
    if (isBrowser) {
      console.log(`Browser-Kontext: Lösche Dokument mit ID ${id} über API`);
      const response = await fetch(`${API_BASE_URL}/api/document/${id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error(`HTTP-Fehler: ${response.status}`);
      }
      
      const result = await response.json();
      return { 
        success: Boolean(result.success), 
        message: result.success ? "Dokument wurde erfolgreich gelöscht" : "Fehler beim Löschen des Dokuments" 
      };
    }
    
    // Im Server-Kontext den richtigen Service aufrufen
    const result = await documentServiceDeleteDocument(id);
    return { 
      success: Boolean(result), 
      message: result ? "Dokument wurde erfolgreich gelöscht" : "Fehler beim Löschen des Dokuments" 
    };
  } catch (error) {
    console.error("API error - deleteDocument:", error);
    return { success: false, message: "Failed to delete PDF document" };
  }
};
