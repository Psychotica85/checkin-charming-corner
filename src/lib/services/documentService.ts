
import { DocumentModel } from '../database/models';
import { connectToDatabase } from '../database/connection';

export const getDocuments = async () => {
  try {
    await connectToDatabase();
    return await DocumentModel.find().lean().exec();
  } catch (error) {
    console.error('Error fetching documents:', error);
    
    // Fallback to localStorage if MongoDB fails
    return JSON.parse(localStorage.getItem('pdfDocuments') || '[]');
  }
};

export const saveDocument = async (document: any) => {
  try {
    await connectToDatabase();
    const newDoc = new DocumentModel(document);
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

export const deleteDocument = async (documentId: string) => {
  try {
    await connectToDatabase();
    await DocumentModel.findByIdAndDelete(documentId).exec();
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
