
import { formatInTimeZone } from 'date-fns-tz';
import { CheckInData, ICheckIn } from '../database/models';
import { connectToDatabase } from '../database/connection';
import { generateCheckInReport } from '../pdfGenerator';
import { getDocuments } from './documentService';
import { prisma } from '../database/prisma';

export const submitCheckIn = async (data: CheckInData): Promise<{ success: boolean, message: string, reportUrl?: string }> => {
  console.log('Check-in data submitted:', data);
  
  try {
    await connectToDatabase();
    
    // Create timestamp with Berlin timezone
    const berlinTimestamp = formatInTimeZone(new Date(), 'Europe/Berlin', "yyyy-MM-dd'T'HH:mm:ssXXX");
    
    // Get documents from database
    const documents = await getDocuments();
    
    // Generate PDF report
    const pdfBlob = await generateCheckInReport({
      firstName: data.firstName || '',
      lastName: data.lastName || '',
      company: data.company,
      visitReason: data.visitReason || '',
      visitDate: data.visitDate || new Date(),
      visitTime: data.visitTime || '',
      acceptedDocuments: data.acceptedDocuments || [],
      timestamp: new Date(berlinTimestamp)
    }, documents);
    
    // Convert the blob to Buffer to store in database
    const arrayBuffer = await pdfBlob.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Create a new check-in record
    await prisma.checkIn.create({
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        fullName: data.fullName,
        company: data.company,
        visitReason: data.visitReason,
        visitDate: data.visitDate,
        visitTime: data.visitTime,
        acceptedRules: data.acceptedRules,
        acceptedDocuments: data.acceptedDocuments || [],
        timestamp: new Date(berlinTimestamp),
        timezone: 'Europe/Berlin',
        pdfData: buffer
      }
    });
    
    // Create a URL for the PDF (for preview in browser)
    const pdfUrl = URL.createObjectURL(pdfBlob);
    
    return { 
      success: true, 
      message: "Check-in erfolgreich gespeichert. Willkommen!",
      reportUrl: pdfUrl
    };
  } catch (error) {
    console.error('Error processing check-in:', error);
    return {
      success: false,
      message: "Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut."
    };
  }
};

export const getCheckIns = async (): Promise<any[]> => {
  console.log('Fetching check-ins from database');
  
  try {
    await connectToDatabase();
    const checkIns = await prisma.checkIn.findMany({
      orderBy: {
        timestamp: 'desc'
      }
    });
    
    // Create object URLs for PDF data
    return checkIns.map((checkIn) => {
      const { pdfData, ...rest } = checkIn;
      
      // If we have PDF data, create a blob URL for it
      let reportUrl = null;
      if (pdfData) {
        const blob = new Blob([Buffer.from(pdfData)], { type: 'application/pdf' });
        reportUrl = URL.createObjectURL(blob);
      }
      
      return { ...rest, reportUrl };
    });
  } catch (error) {
    console.error('Error fetching check-ins:', error);
    return [];
  }
};
