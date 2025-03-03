
import { DocumentModel, Document as IDocument } from '../database/models';
import { connectToDatabase } from '../database/connection';

export const getDocuments = async (): Promise<IDocument[]> => {
  try {
    await connectToDatabase();
    // Lösung für TypeScript-Fehler mit 'as any'
    const docs = await DocumentModel.find().lean().exec() as any[];
    return docs.map(doc => ({
      id: doc._id.toString(),
      name: doc.name,
      description: doc.description,
      file: doc.file,
      createdAt: doc.createdAt
    }));
  } catch (error) {
    console.error('Error fetching documents:', error);
    
    // Fallback to localStorage if MongoDB fails
    return JSON.parse(localStorage.getItem('pdfDocuments') || '[]');
  }
};

export const saveDocument = async (document: Omit<IDocument, 'id'> & { id?: string }): Promise<boolean> => {
  try {
    await connectToDatabase();
    const newDoc = new DocumentModel({
      name: document.name,
      description: document.description,
      file: document.file,
      createdAt: document.createdAt || new Date()
    });
    await newDoc.save();
    return true;
  } catch (error) {
    console.error('Error saving document:', error);
    
    // Fallback to localStorage if MongoDB fails
    const docs = JSON.parse(localStorage.getItem('pdfDocuments') || '[]');
    docs.push(document);
    localStorage.setItem('pdfDocuments', JSON.stringify(docs));
    return false;
  }
};

export const deleteDocument = async (documentId: string): Promise<boolean> => {
  try {
    await connectToDatabase();
    // Lösung für TypeScript-Fehler mit 'as any'
    await (DocumentModel.findByIdAndDelete(documentId) as any).exec();
    return true;
  } catch (error) {
    console.error('Error deleting document:', error);
    
    // Fallback to localStorage if MongoDB fails
    const docs = JSON.parse(localStorage.getItem('pdfDocuments') || '[]');
    const updatedDocs = docs.filter((doc: any) => doc.id !== documentId);
    localStorage.setItem('pdfDocuments', JSON.stringify(updatedDocs));
    return false;
  }
};
