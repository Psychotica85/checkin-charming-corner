
import { isBrowser } from "@/lib/database/connection";
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
    
    // Wenn wir im Browser sind, verwenden wir den Dokumentendienst
    if (isBrowser) {
      console.log("Browser-Kontext erkannt, simuliere Dokumentenspeicherung");
      
      // Für Demo-Zwecke speichern wir temporär im sessionStorage
      const documents = JSON.parse(sessionStorage.getItem('documents') || '[]');
      const newDocument = {
        id: Date.now().toString(),
        name: pdfData.name || "Dokument",
        description: pdfData.description || "",
        file: pdfData.file || null,
        createdAt: new Date().toISOString()
      };
      
      documents.push(newDocument);
      sessionStorage.setItem('documents', JSON.stringify(documents));
      
      return {
        success: true,
        message: "Dokument wurde erfolgreich gespeichert",
        document: newDocument
      };
    }
    
    // Im Server-Kontext den richtigen Service aufrufen
    const result = await documentServiceSaveDocument(pdfData);
    return { 
      success: result,
      message: result ? "Dokument wurde erfolgreich gespeichert" : "Fehler beim Speichern des Dokuments"
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
    
    // Wenn wir im Browser sind, verwenden wir sessionStorage für die Demo
    if (isBrowser) {
      console.log("Browser-Kontext erkannt, lade Dokumente aus sessionStorage");
      
      const documents = JSON.parse(sessionStorage.getItem('documents') || '[]');
      return documents;
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
    
    // Wenn wir im Browser sind, verwenden wir sessionStorage für die Demo
    if (isBrowser) {
      console.log("Browser-Kontext erkannt, lösche Dokument aus sessionStorage");
      
      const documents = JSON.parse(sessionStorage.getItem('documents') || '[]');
      const filteredDocuments = documents.filter((doc: any) => doc.id !== id);
      sessionStorage.setItem('documents', JSON.stringify(filteredDocuments));
      
      return { 
        success: true, 
        message: "Dokument wurde erfolgreich gelöscht" 
      };
    }
    
    // Im Server-Kontext den richtigen Service aufrufen
    const result = await documentServiceDeleteDocument(id);
    return { 
      success: result, 
      message: result ? "Dokument wurde erfolgreich gelöscht" : "Fehler beim Löschen des Dokuments" 
    };
  } catch (error) {
    console.error("API error - deleteDocument:", error);
    return { success: false, message: "Failed to delete PDF document" };
  }
};
