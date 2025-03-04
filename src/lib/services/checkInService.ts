
import { formatInTimeZone } from 'date-fns-tz';
import { CheckIn, CheckInData } from '../database/models';
import { withDatabase } from '../database/connection';
import { generateCheckInReport } from '../pdfGenerator';
import { getDocuments } from './documentService';

// Browser-Erkennung
const isBrowser = typeof window !== 'undefined';

export const submitCheckIn = async (data: CheckInData): Promise<{ success: boolean, message: string, reportUrl?: string }> => {
  console.log('Check-in data submitted:', data);
  
  try {
    // Zeitstempel mit Berliner Zeitzone erstellen
    const berlinTimestamp = formatInTimeZone(new Date(), 'Europe/Berlin', "yyyy-MM-dd'T'HH:mm:ssXXX");
    
    // Dokumente abrufen
    const documents = await getDocuments();
    
    // PDF-Bericht generieren
    const pdfBlob = await generateCheckInReport({
      firstName: data.firstName || '',
      lastName: data.lastName || '',
      company: data.company,
      visitReason: data.visitReason || '',
      visitDate: data.visitDate instanceof Date ? data.visitDate : new Date(data.visitDate || ''),
      visitTime: data.visitTime || '',
      acceptedDocuments: data.acceptedDocuments || [],
      timestamp: new Date(berlinTimestamp)
    }, documents);
    
    return withDatabase(
      // Diese Funktion wird im Server ausgeführt (wird nie im Browser aufgerufen)
      (db) => {
        console.log("Server-Umgebung: Speichere Check-in in SQLite");
        // URL für PDF-Vorschau im Browser erstellen
        const pdfUrl = URL.createObjectURL(pdfBlob);
        
        return { 
          success: true, 
          message: "Check-in erfolgreich gespeichert. Willkommen!",
          reportUrl: pdfUrl
        };
      },
      // Fallback zu localStorage im Browser
      () => {
        console.log("Browser-Umgebung: Speichere Check-in in localStorage");
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
    );
  } catch (error) {
    console.error('Error processing check-in:', error);
    return {
      success: false,
      message: "Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut."
    };
  }
};

export const getCheckIns = async (): Promise<CheckIn[]> => {
  return withDatabase(
    // Diese Funktion wird im Server ausgeführt (wird nie im Browser aufgerufen)
    (db) => {
      console.log("Server-Umgebung: Lade Check-ins aus SQLite");
      return [];
    },
    // Fallback zu localStorage im Browser
    () => {
      console.log("Browser-Umgebung: Lade Check-ins aus localStorage");
      const checkIns = JSON.parse(localStorage.getItem('checkIns') || '[]');
      return checkIns;
    }
  );
};
