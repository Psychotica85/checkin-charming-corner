
import { withDatabase } from "@/lib/database/connection";
import { PDFDocument } from "@/lib/database/models";

/**
 * Liest alle PDF-Dokumente aus der Datenbank
 */
export const getDocuments = async (): Promise<PDFDocument[]> => {
  return withDatabase(
    // SQL Datenbank Operation
    (db) => {
      const documents = db.prepare(`
        SELECT id, name, description, file, createdAt
        FROM documents
        ORDER BY createdAt DESC
      `).all() as PDFDocument[];
      
      return documents;
    },
    // Fallback für Browser-Umgebung: LocalStorage verwenden
    () => {
      try {
        const storedDocs = localStorage.getItem('documents');
        return storedDocs ? JSON.parse(storedDocs) : [];
      } catch (error) {
        console.error('Fehler beim Lesen der Dokumente aus dem LocalStorage:', error);
        return [];
      }
    }
  );
};

/**
 * Speichert ein PDF-Dokument in der Datenbank
 */
export const saveDocument = async (document: PDFDocument): Promise<boolean> => {
  return withDatabase(
    // SQL Datenbank Operation
    (db) => {
      try {
        db.prepare(`
          INSERT INTO documents (name, description, file, createdAt)
          VALUES (?, ?, ?, ?)
        `).run(
          document.name,
          document.description || '',
          document.file,
          document.createdAt
        );
        
        return true;
      } catch (error) {
        console.error('Fehler beim Speichern des Dokuments in der Datenbank:', error);
        return false;
      }
    },
    // Fallback für Browser-Umgebung: LocalStorage verwenden
    () => {
      try {
        // Vorhandene Dokumente aus dem Storage laden
        const storedDocs = localStorage.getItem('documents');
        const documents = storedDocs ? JSON.parse(storedDocs) : [];
        
        // Neue ID generieren, wenn nicht vorhanden
        if (!document.id) {
          document.id = Date.now().toString();
        }
        
        // Dokument hinzufügen
        documents.push(document);
        
        // Zurück in den Storage schreiben
        localStorage.setItem('documents', JSON.stringify(documents));
        
        return true;
      } catch (error) {
        console.error('Fehler beim Speichern des Dokuments im LocalStorage:', error);
        return false;
      }
    }
  );
};

/**
 * Löscht ein PDF-Dokument aus der Datenbank
 */
export const deleteDocument = async (id: string): Promise<boolean> => {
  return withDatabase(
    // SQL Datenbank Operation
    (db) => {
      try {
        db.prepare('DELETE FROM documents WHERE id = ?').run(id);
        return true;
      } catch (error) {
        console.error('Fehler beim Löschen des Dokuments aus der Datenbank:', error);
        return false;
      }
    },
    // Fallback für Browser-Umgebung: LocalStorage verwenden
    () => {
      try {
        // Vorhandene Dokumente aus dem Storage laden
        const storedDocs = localStorage.getItem('documents');
        if (!storedDocs) return false;
        
        let documents = JSON.parse(storedDocs);
        
        // Dokument mit der angegebenen ID filtern
        documents = documents.filter((doc: PDFDocument) => doc.id !== id);
        
        // Aktualisierte Liste zurück in den Storage schreiben
        localStorage.setItem('documents', JSON.stringify(documents));
        
        return true;
      } catch (error) {
        console.error('Fehler beim Löschen des Dokuments aus dem LocalStorage:', error);
        return false;
      }
    }
  );
};
