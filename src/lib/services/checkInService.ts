
import { formatInTimeZone } from 'date-fns-tz';
import { CheckInData, ICheckIn } from '../database/models';
import { connectToDatabase } from '../database/connection';
import { generateCheckInReport } from '../pdfGenerator';
import { getDocuments } from './documentService';
import { prisma } from '../database/prisma';
import { getCheckInModel } from '../database/mongoModels';

// Browser-Erkennung
const isBrowser = typeof window !== 'undefined';

export const submitCheckIn = async (data: CheckInData): Promise<{ success: boolean, message: string, reportUrl?: string }> => {
  console.log('Check-in data submitted:', data);
  
  try {
    await connectToDatabase();
    
    // Zeitstempel mit Berliner Zeitzone erstellen
    const berlinTimestamp = formatInTimeZone(new Date(), 'Europe/Berlin', "yyyy-MM-dd'T'HH:mm:ssXXX");
    
    // Dokumente aus der Datenbank abrufen
    const documents = await getDocuments();
    
    // PDF-Bericht generieren
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
    
    // Blob in Buffer für Datenbankablage konvertieren
    const arrayBuffer = await pdfBlob.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Im Browser simulieren wir nur die Speicherung
    if (isBrowser) {
      console.log('Browser-Umgebung: Check-in würde in der Datenbank gespeichert werden.');
      
      // Lokalen Speicher für Demo-Zwecke verwenden
      const checkIns = JSON.parse(localStorage.getItem('checkIns') || '[]');
      const newCheckIn = {
        id: Date.now().toString(),
        ...data,
        timezone: 'Europe/Berlin',
        timestamp: new Date(berlinTimestamp)
      };
      checkIns.push(newCheckIn);
      localStorage.setItem('checkIns', JSON.stringify(checkIns));
      
      // URL für PDF-Vorschau im Browser erstellen
      const pdfUrl = URL.createObjectURL(pdfBlob);
      
      return { 
        success: true, 
        message: "Check-in erfolgreich gespeichert. Willkommen!",
        reportUrl: pdfUrl
      };
    }
    
    // Bei Server-Umgebung in MongoDB und Prisma speichern
    try {
      // Zuerst Prisma versuchen
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
    } catch (prismaError) {
      console.warn('Prisma-Speicherung fehlgeschlagen, verwende MongoDB:', prismaError);
      
      // Fallback: In MongoDB speichern
      const CheckInModel = getCheckInModel();
      
      await new CheckInModel({
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
      }).save();
    }
    
    // URL für PDF-Vorschau im Browser erstellen
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
    
    // Im Browser verwenden wir den lokalen Speicher
    if (isBrowser) {
      const checkIns = JSON.parse(localStorage.getItem('checkIns') || '[]');
      return checkIns;
    }
    
    // Bei Server-Umgebung aus MongoDB oder Prisma abrufen
    try {
      // Zuerst Prisma versuchen
      const checkIns = await prisma.checkIn.findMany({
        orderBy: {
          timestamp: 'desc'
        }
      });
      
      // Objekt-URLs für PDF-Daten erstellen
      return checkIns.map((checkIn) => {
        const { pdfData, ...rest } = checkIn;
        
        // Wenn wir PDF-Daten haben, eine Blob-URL dafür erstellen
        let reportUrl = null;
        if (pdfData) {
          const blob = new Blob([Buffer.from(pdfData)], { type: 'application/pdf' });
          reportUrl = URL.createObjectURL(blob);
        }
        
        return { ...rest, reportUrl };
      });
    } catch (prismaError) {
      console.warn('Prisma-Abfrage fehlgeschlagen, verwende MongoDB:', prismaError);
      
      // Fallback: Aus MongoDB abrufen
      const CheckInModel = getCheckInModel();
      const checkIns = await CheckInModel.find().sort({ timestamp: -1 }).exec();
      
      // Zu Frontend-Format konvertieren
      return checkIns.map(checkIn => {
        const data = checkIn.toObject();
        const { pdfData, _id, ...rest } = data;
        
        // Wenn wir PDF-Daten haben, eine Blob-URL dafür erstellen
        let reportUrl = null;
        if (pdfData) {
          const blob = new Blob([Buffer.from(pdfData)], { type: 'application/pdf' });
          reportUrl = URL.createObjectURL(blob);
        }
        
        return { 
          id: _id.toString(),
          ...rest, 
          reportUrl 
        };
      });
    }
  } catch (error) {
    console.error('Error fetching check-ins:', error);
    return [];
  }
};
