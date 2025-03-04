
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
        
        stmt.run(
          document.id,
          document.name,
          document.description || '',
          document.file || document.fileData, // Unterstützt beide Feldnamen
          document.createdAt
        );
        
        console.log(`Dokument "${document.name}" erfolgreich in SQLite gespeichert`);
        return true;
      } catch (error) {
        console.error('Fehler beim Speichern des Dokuments in der Datenbank:', error);
        throw error; // Fehler weiterleiten
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
        throw error; // Fehler weiterleiten
      }
    }
  );
};
