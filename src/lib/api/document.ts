
import {
  saveDocument as documentServiceSaveDocument,
  getDocuments as documentServiceGetDocuments,
  deleteDocument as documentServiceDeleteDocument,
} from "@/lib/services/documentService";

/**
 * Speichert ein Dokument
 */
export const saveDocument = async (pdfData: any) => {
  try {
    console.log("saveDocument aufgerufen");
    
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
