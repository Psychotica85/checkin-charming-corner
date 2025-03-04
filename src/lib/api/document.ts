
import { isBrowser } from "./config";
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
    // Prüfen, ob wir im Browser-Kontext sind
    if (isBrowser()) {
      console.log("Browser-Kontext erkannt für saveDocument");
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

/**
 * Lädt alle Dokumente
 */
export const getDocuments = async () => {
  try {
    // Prüfen, ob wir im Browser-Kontext sind
    if (isBrowser()) {
      console.log("Browser-Kontext erkannt für getDocuments");
      const localDocuments = localStorage.getItem('pdfDocuments');
      return localDocuments ? JSON.parse(localDocuments) : [];
    }
    
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
    // Prüfen, ob wir im Browser-Kontext sind
    if (isBrowser()) {
      console.log("Browser-Kontext erkannt für deleteDocument");
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
