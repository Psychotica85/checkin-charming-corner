
import { formatInTimeZone } from 'date-fns-tz';
import { CheckInData, ICheckIn } from '../database/models';
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
      visitDate: data.visitDate || new Date(),
      visitTime: data.visitTime || '',
      acceptedDocuments: data.acceptedDocuments || [],
      timestamp: new Date(berlinTimestamp)
    }, documents);
    
    // Blob in ArrayBuffer für Datenbankablage konvertieren
    const arrayBuffer = await pdfBlob.arrayBuffer();
    
    return withDatabase(
      // SQLite-Datenbankoperation
      (db) => {
        // JSON-Array für acceptedDocuments serialisieren
        const acceptedDocsJson = JSON.stringify(data.acceptedDocuments || []);
        
        // Check-in in SQLite speichern
        const result = db.prepare(`
          INSERT INTO checkIns (
            firstName, lastName, fullName, company, visitReason, 
            visitDate, visitTime, acceptedRules, acceptedDocuments, 
            timestamp, timezone, pdfData
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
          data.firstName || '',
          data.lastName || '',
          data.fullName,
          data.company,
          data.visitReason || '',
          data.visitDate ? data.visitDate.toISOString() : null,
          data.visitTime || '',
          data.acceptedRules ? 1 : 0,
          acceptedDocsJson,
          new Date(berlinTimestamp).toISOString(),
          'Europe/Berlin',
          Buffer.from(arrayBuffer)
        );
        
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

export const getCheckIns = async (): Promise<ICheckIn[]> => {
  return withDatabase(
    // SQLite-Datenbankoperation
    (db) => {
      const checkIns = db.prepare(`
        SELECT * FROM checkIns ORDER BY timestamp DESC
      `).all();
      
      // Zu Frontend-Format konvertieren
      return checkIns.map(checkIn => {
        // PDF-Daten in Blob umwandeln
        let reportUrl = null;
        if (checkIn.pdfData) {
          const blob = new Blob([Buffer.from(checkIn.pdfData)], { type: 'application/pdf' });
          reportUrl = URL.createObjectURL(blob);
        }
        
        // Umwandeln des acceptedDocuments-JSON-Strings zurück in ein Array
        const acceptedDocuments = checkIn.acceptedDocuments ? 
          JSON.parse(checkIn.acceptedDocuments) : [];
        
        // Konvertieren von SQLite-Boolean (0/1) in JavaScript-Boolean für acceptedRules
        const acceptedRules = checkIn.acceptedRules === 1;
        
        // Konvertieren des Datums
        const visitDate = checkIn.visitDate ? new Date(checkIn.visitDate) : new Date();
        
        return { 
          id: checkIn.id.toString(),
          firstName: checkIn.firstName || '',
          lastName: checkIn.lastName || '',
          fullName: checkIn.fullName,
          company: checkIn.company,
          visitReason: checkIn.visitReason || '',
          visitDate,
          visitTime: checkIn.visitTime || '',
          acceptedRules,
          acceptedDocuments,
          timestamp: new Date(checkIn.timestamp),
          timezone: checkIn.timezone,
          reportUrl
        };
      });
    },
    // Fallback zu localStorage im Browser
    () => {
      const checkIns = JSON.parse(localStorage.getItem('checkIns') || '[]');
      return checkIns;
    }
  );
};
