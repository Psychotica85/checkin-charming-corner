
import { Document, IDocument } from '../database/models';
import { prisma } from '../database/prisma';
import { connectToDatabase } from '../database/connection';

export const getDocuments = async (): Promise<IDocument[]> => {
  try {
    await connectToDatabase();
    const docs = await prisma.document.findMany();
    return docs.map(doc => ({
      id: doc.id,
      name: doc.name,
      description: doc.description,
      file: doc.file,
      createdAt: doc.createdAt
    }));
  } catch (error) {
    console.error('Error fetching documents:', error);
    
    // Fallback to localStorage if PostgreSQL fails
    return JSON.parse(localStorage.getItem('pdfDocuments') || '[]');
  }
};

export const saveDocument = async (document: Omit<IDocument, 'id'> & { id?: string }): Promise<boolean> => {
  try {
    await connectToDatabase();
    const createdAt = document.createdAt || new Date();
    
    if (document.id) {
      // Update existing document
      await prisma.document.update({
        where: { id: document.id },
        data: {
          name: document.name,
          description: document.description,
          file: document.file,
          createdAt
        }
      });
    } else {
      // Create new document
      await prisma.document.create({
        data: {
          name: document.name,
          description: document.description,
          file: document.file,
          createdAt
        }
      });
    }
    return true;
  } catch (error) {
    console.error('Error saving document:', error);
    
    // Fallback to localStorage if PostgreSQL fails
    const docs = JSON.parse(localStorage.getItem('pdfDocuments') || '[]');
    docs.push(document);
    localStorage.setItem('pdfDocuments', JSON.stringify(docs));
    return false;
  }
};

export const deleteDocument = async (documentId: string): Promise<boolean> => {
  try {
    await connectToDatabase();
    await prisma.document.delete({
      where: { id: documentId }
    });
    return true;
  } catch (error) {
    console.error('Error deleting document:', error);
    
    // Fallback to localStorage if PostgreSQL fails
    const docs = JSON.parse(localStorage.getItem('pdfDocuments') || '[]');
    const updatedDocs = docs.filter((doc: any) => doc.id !== documentId);
    localStorage.setItem('pdfDocuments', JSON.stringify(updatedDocs));
    return false;
  }
};
