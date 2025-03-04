
import { Document } from '../database/models';
import { withDatabase } from '../database/connection';

// Browser-Erkennung
const isBrowser = typeof window !== 'undefined';

export const getDocuments = async (): Promise<Document[]> => {
  return withDatabase(
    // SQLite-Datenbankoperation
    (db) => {
      const docs = db.prepare(`SELECT * FROM documents`).all();
      
      return docs.map(doc => ({
        id: doc.id.toString(),
        name: doc.name,
        description: doc.description || '',
        file: doc.file,
        createdAt: doc.createdAt
      }));
    },
    // Fallback zu localStorage
    () => {
      return JSON.parse(localStorage.getItem('documents') || '[]');
    }
  );
};

export const saveDocument = async (document: Omit<Document, 'id'> & { id?: string }): Promise<boolean> => {
  return withDatabase(
    // SQLite-Datenbankoperation
    (db) => {
      try {
        if (document.id) {
          // Bestehenden Datensatz aktualisieren
          db.prepare(`
            UPDATE documents 
            SET name = ?, description = ?, file = ?
            WHERE id = ?
          `).run(
            document.name,
            document.description || '',
            document.file,
            document.id
          );
        } else {
          // Neues Dokument erstellen
          const createdAt = document.createdAt || new Date().toISOString();
          
          db.prepare(`
            INSERT INTO documents (name, description, file, createdAt)
            VALUES (?, ?, ?, ?)
          `).run(
            document.name,
            document.description || '',
            document.file,
            createdAt
          );
        }
        
        return true;
      } catch (error) {
        console.error('Fehler beim Speichern des Dokuments:', error);
        return false;
      }
    },
    // Fallback zu localStorage
    () => {
      try {
        const docs = JSON.parse(localStorage.getItem('documents') || '[]');
        
        if (document.id) {
          // Bestehenden Datensatz aktualisieren
          const index = docs.findIndex((doc: any) => doc.id === document.id);
          if (index !== -1) {
            docs[index] = { ...document };
          }
        } else {
          // Neues Dokument hinzufügen
          const newDoc = {
            ...document,
            id: Date.now().toString(),
            createdAt: document.createdAt || new Date().toISOString()
          };
          docs.push(newDoc);
        }
        
        localStorage.setItem('documents', JSON.stringify(docs));
        return true;
      } catch (error) {
        console.error('Fehler beim Speichern des Dokuments im localStorage:', error);
        return false;
      }
    }
  );
};

export const deleteDocument = async (documentId: string): Promise<boolean> => {
  return withDatabase(
    // SQLite-Datenbankoperation
    (db) => {
      try {
        db.prepare(`
          DELETE FROM documents WHERE id = ?
        `).run(documentId);
        
        return true;
      } catch (error) {
        console.error('Fehler beim Löschen des Dokuments:', error);
        return false;
      }
    },
    // Fallback zu localStorage
    () => {
      try {
        const docs = JSON.parse(localStorage.getItem('documents') || '[]');
        const updatedDocs = docs.filter((doc: any) => doc.id !== documentId);
        localStorage.setItem('documents', JSON.stringify(updatedDocs));
        return true;
      } catch (error) {
        console.error('Fehler beim Löschen des Dokuments im localStorage:', error);
        return false;
      }
    }
  );
};
