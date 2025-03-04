
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
        // Stelle sicher, dass die Tabelle existiert
        db.exec(`
          CREATE TABLE IF NOT EXISTS documents (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            description TEXT,
            file TEXT NOT NULL,
            createdAt TEXT NOT NULL
          )
        `);
        
        const stmt = db.prepare(`
          SELECT id, name, description, file as fileData, createdAt
          FROM documents
          ORDER BY createdAt DESC
        `);
        
        const documents = stmt.all();
        console.log(`${documents.length} Dokumente aus SQLite geladen`);
        return documents;
      } catch (error) {
        console.error('Fehler beim Laden der Dokumente aus SQLite:', error);
        throw error; // Fehler weiterleiten
      }
    },
    // Browser-Fallback (wird nicht verwendet)
    () => {
      console.error("Kritischer Fehler: Dokumente können im Browser nicht geladen werden");
      throw new Error("Datenbankzugriff im Browser nicht möglich");
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
        // Stelle sicher, dass die Tabelle existiert
        db.exec(`
          CREATE TABLE IF NOT EXISTS documents (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            description TEXT,
            file TEXT NOT NULL,
            createdAt TEXT NOT NULL
          )
        `);
        
        // Stelle sicher, dass alle erforderlichen Felder vorhanden sind
        if (!document.id) document.id = Date.now().toString();
        if (!document.createdAt) document.createdAt = new Date().toISOString();
        
        const stmt = db.prepare(`
          INSERT INTO documents (id, name, description, file, createdAt)
          VALUES (?, ?, ?, ?, ?)
        `);
        
        // Anpassung der Typfehler bei fileData
        // Überprüfen, ob file oder fileData vorhanden ist
        const fileContent = document.file || (document as any).fileData;
        
        stmt.run(
          document.id,
          document.name,
          document.description || '',
          fileContent, // Verwenden Sie entweder file oder fileData
          document.createdAt
        );
        
        console.log(`Dokument "${document.name}" erfolgreich in SQLite gespeichert`);
        return true;
      } catch (error) {
        console.error('Fehler beim Speichern des Dokuments in der Datenbank:', error);
        throw error; // Fehler weiterleiten
      }
    },
    // Browser-Fallback (wird nicht verwendet)
    () => {
      console.error("Kritischer Fehler: Dokumente können im Browser nicht gespeichert werden");
      throw new Error("Datenbankzugriff im Browser nicht möglich");
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
        throw error; // Fehler weiterleiten
      }
    },
    // Browser-Fallback (wird nicht verwendet)
    () => {
      console.error("Kritischer Fehler: Dokumente können im Browser nicht gelöscht werden");
      throw new Error("Datenbankzugriff im Browser nicht möglich");
    }
  );
};
