
import { Document } from '../database/models';
import { connectToDatabase } from '../database/connection';
import { getDocumentModel } from '../database/mongoModels';

// Browser-Erkennung
const isBrowser = typeof window !== 'undefined';

export const getDocuments = async (): Promise<Document[]> => {
  try {
    // Im Browser verwenden wir localStorage
    if (isBrowser) {
      const docs = JSON.parse(localStorage.getItem('documents') || '[]');
      return docs;
    }
    
    await connectToDatabase();
    const DocumentModel = getDocumentModel();
    
    const docs = await DocumentModel.find().exec();
    return docs.map(doc => ({
      id: doc._id.toString(),
      name: doc.name,
      description: doc.description,
      file: doc.file,
      createdAt: doc.createdAt.toISOString()
    }));
  } catch (error) {
    console.error('Error fetching documents:', error);
    
    // Fallback zu localStorage
    return JSON.parse(localStorage.getItem('documents') || '[]');
  }
};

export const saveDocument = async (document: Omit<Document, 'id'> & { id?: string }): Promise<boolean> => {
  try {
    // Im Browser verwenden wir localStorage
    if (isBrowser) {
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
    }
    
    await connectToDatabase();
    const DocumentModel = getDocumentModel();
    
    if (document.id) {
      // Bestehenden Datensatz aktualisieren
      await DocumentModel.findByIdAndUpdate(
        document.id,
        {
          name: document.name,
          description: document.description,
          file: document.file,
          createdAt: document.createdAt ? new Date(document.createdAt) : new Date()
        }
      );
    } else {
      // Neues Dokument erstellen
      await new DocumentModel({
        name: document.name,
        description: document.description,
        file: document.file,
        createdAt: document.createdAt ? new Date(document.createdAt) : new Date()
      }).save();
    }
    
    return true;
  } catch (error) {
    console.error('Error saving document:', error);
    
    // Fallback zu localStorage bei Fehlern
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
    return false;
  }
};

export const deleteDocument = async (documentId: string): Promise<boolean> => {
  try {
    // Im Browser verwenden wir localStorage
    if (isBrowser) {
      const docs = JSON.parse(localStorage.getItem('documents') || '[]');
      const updatedDocs = docs.filter((doc: any) => doc.id !== documentId);
      localStorage.setItem('documents', JSON.stringify(updatedDocs));
      return true;
    }
    
    await connectToDatabase();
    const DocumentModel = getDocumentModel();
    
    await DocumentModel.findByIdAndDelete(documentId);
    return true;
  } catch (error) {
    console.error('Error deleting document:', error);
    
    // Fallback zu localStorage bei Fehlern
    const docs = JSON.parse(localStorage.getItem('documents') || '[]');
    const updatedDocs = docs.filter((doc: any) => doc.id !== documentId);
    localStorage.setItem('documents', JSON.stringify(updatedDocs));
    return false;
  }
};
