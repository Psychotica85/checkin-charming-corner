
import { useLocalStorage } from "@/lib/database/connection";
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
    return await documentServiceDeleteDocument(id);
  } catch (error) {
    console.error("API error - deleteDocument:", error);
    return { success: false, message: "Failed to delete PDF document" };
  }
};
