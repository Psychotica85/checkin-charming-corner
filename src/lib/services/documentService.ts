
import { withDatabase } from "@/lib/database/connection";
import { PDFDocument } from "@/lib/database/models";

/**
 * Liest alle PDF-Dokumente aus der Datenbank
 */
export const getDocuments = async (): Promise<PDFDocument[]> => {
  return withDatabase(
    // SQL Datenbank Operation
    (db) => {
      try {
        const stmt = db.prepare(`
          SELECT id, name, description, file, createdAt
          FROM documents
          ORDER BY createdAt DESC
        `);
        
        const documents = stmt.all();
        console.log(`${documents.length} Dokumente aus SQLite geladen`);
        return documents;
      } catch (error) {
        console.error('Fehler beim Laden der Dokumente aus SQLite:', error);
        return [];
      }
    },
    // Fallback für Browser-Umgebung: LocalStorage verwenden
    () => {
      try {
        const storedDocs = localStorage.getItem('documents');
        const documents = storedDocs ? JSON.parse(storedDocs) : [];
        console.log(`${documents.length} Dokumente aus localStorage geladen`);
        return documents;
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
        // Stelle sicher, dass alle erforderlichen Felder vorhanden sind
        if (!document.id) document.id = Date.now().toString();
        if (!document.createdAt) document.createdAt = new Date().toISOString();
        
        const stmt = db.prepare(`
          INSERT INTO documents (id, name, description, file, createdAt)
          VALUES (?, ?, ?, ?, ?)
        `);
        
        stmt.run(
          document.id,
          document.name,
          document.description || '',
          document.file,
          document.createdAt
        );
        
        console.log(`Dokument "${document.name}" erfolgreich in SQLite gespeichert`);
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
        
        // Erstellungsdatum hinzufügen, wenn nicht vorhanden
        if (!document.createdAt) {
          document.createdAt = new Date().toISOString();
        }
        
        // Dokument hinzufügen
        documents.push(document);
        
        // Zurück in den Storage schreiben
        localStorage.setItem('documents', JSON.stringify(documents));
        
        console.log(`Dokument "${document.name}" erfolgreich im localStorage gespeichert`);
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
        const stmt = db.prepare('DELETE FROM documents WHERE id = ?');
        const result = stmt.run(id);
        
        const success = result.changes > 0;
        if (success) {
          console.log(`Dokument mit ID ${id} erfolgreich aus SQLite gelöscht`);
        } else {
          console.log(`Dokument mit ID ${id} nicht gefunden in SQLite`);
        }
        return success;
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
        if (!storedDocs) {
          console.log('Keine Dokumente im localStorage gefunden');
          return false;
        }
        
        let documents = JSON.parse(storedDocs);
        const initialLength = documents.length;
        
        // Dokument mit der angegebenen ID filtern
        documents = documents.filter((doc: PDFDocument) => doc.id !== id);
        
        // Aktualisierte Liste zurück in den Storage schreiben
        localStorage.setItem('documents', JSON.stringify(documents));
        
        const success = documents.length < initialLength;
        if (success) {
          console.log(`Dokument mit ID ${id} erfolgreich aus localStorage gelöscht`);
        } else {
          console.log(`Dokument mit ID ${id} nicht gefunden in localStorage`);
        }
        return success;
      } catch (error) {
        console.error('Fehler beim Löschen des Dokuments aus dem LocalStorage:', error);
        return false;
      }
    }
  );
};
