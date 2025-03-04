
import { withDatabase } from "@/lib/database/connection";
import { PDFDocument } from "@/lib/database/models";

/**
 * Liest alle PDF-Dokumente aus der Datenbank
 */
export const getDocuments = async (): Promise<PDFDocument[]> => {
  return withDatabase(
    // MySQL Datenbank Operation
    async (conn) => {
      try {
        const [rows] = await conn.query(`
          SELECT id, name, description, file as fileData, createdAt
          FROM documents
          ORDER BY createdAt DESC
        `);
        
        console.log(`${(rows as any[]).length} Dokumente aus MySQL geladen`);
        return rows as PDFDocument[];
      } catch (error) {
        console.error('Fehler beim Laden der Dokumente aus MySQL:', error);
        throw error;
      }
    }
  );
};

/**
 * Speichert ein PDF-Dokument in der Datenbank
 */
export const saveDocument = async (document: PDFDocument): Promise<boolean> => {
  return withDatabase(
    // MySQL Datenbank Operation
    async (conn) => {
      try {
        // Stelle sicher, dass alle erforderlichen Felder vorhanden sind
        if (!document.id) document.id = Date.now().toString();
        if (!document.createdAt) document.createdAt = new Date().toISOString();
        
        // Anpassung der Typfehler bei fileData
        // Überprüfen, ob file oder fileData vorhanden ist
        const fileContent = document.file || (document as any).fileData;
        
        await conn.query(`
          INSERT INTO documents (id, name, description, file, createdAt)
          VALUES (?, ?, ?, ?, ?)
        `, [
          document.id,
          document.name,
          document.description || '',
          fileContent,
          document.createdAt
        ]);
        
        console.log(`Dokument "${document.name}" erfolgreich in MySQL gespeichert`);
        return true;
      } catch (error) {
        console.error('Fehler beim Speichern des Dokuments in der Datenbank:', error);
        throw error;
      }
    }
  );
};

/**
 * Löscht ein PDF-Dokument aus der Datenbank
 */
export const deleteDocument = async (id: string): Promise<boolean> => {
  return withDatabase(
    // MySQL Datenbank Operation
    async (conn) => {
      try {
        const [result] = await conn.query('DELETE FROM documents WHERE id = ?', [id]);
        const affectedRows = (result as any).affectedRows;
        
        const success = affectedRows > 0;
        if (success) {
          console.log(`Dokument mit ID ${id} erfolgreich aus MySQL gelöscht`);
        } else {
          console.log(`Dokument mit ID ${id} nicht gefunden in MySQL`);
        }
        return success;
      } catch (error) {
        console.error('Fehler beim Löschen des Dokuments aus der Datenbank:', error);
        throw error;
      }
    }
  );
};
