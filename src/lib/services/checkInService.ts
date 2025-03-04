
import { formatInTimeZone } from 'date-fns-tz';
import { CheckIn } from '../database/models';
import { withDatabase } from '../database/connection';
import { generateCheckInReport } from '../pdfGenerator';
import { getDocuments } from './documentService';

// Browser-Erkennung
const isBrowser = typeof window !== 'undefined';

export const submitCheckIn = async (data: CheckIn): Promise<{ success: boolean, message: string, reportUrl?: string }> => {
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
      // Diese Funktion wird im Server ausgeführt
      (db) => {
        console.log("Server-Umgebung: Speichere Check-in in SQLite");
        
        // CheckIn-Daten vorbereiten
        const checkInData = {
          id: Date.now().toString(),
          ...data,
          timezone: 'Europe/Berlin',
          timestamp: berlinTimestamp,
          acceptedDocuments: JSON.stringify(data.acceptedDocuments || [])
        };
        
        // In SQLite-Datenbank speichern
        const stmt = db.prepare(`
          INSERT INTO checkins (
            id, firstName, lastName, fullName, company, 
            visitReason, visitDate, visitTime, acceptedRules, 
            acceptedDocuments, timestamp, timezone
          ) VALUES (
            ?, ?, ?, ?, ?, 
            ?, ?, ?, ?, 
            ?, ?, ?
          )
        `);
        
        stmt.run(
          checkInData.id,
          checkInData.firstName || null,
          checkInData.lastName || null,
          checkInData.fullName,
          checkInData.company,
          checkInData.visitReason || null,
          checkInData.visitDate ? new Date(checkInData.visitDate).toISOString() : null,
          checkInData.visitTime || null,
          checkInData.acceptedRules ? 1 : 0,
          checkInData.acceptedDocuments,
          checkInData.timestamp,
          checkInData.timezone
        );
        
        // URL für PDF-Vorschau erstellen
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
    // Diese Funktion wird im Server ausgeführt
    (db) => {
      console.log("Server-Umgebung: Lade Check-ins aus SQLite");
      
      try {
        const stmt = db.prepare(`
          SELECT id, firstName, lastName, fullName, company, 
                 visitReason, visitDate, visitTime, acceptedRules, 
                 acceptedDocuments, timestamp, timezone
          FROM checkins
          ORDER BY timestamp DESC
        `);
        
        const rows = stmt.all();
        
        // Daten für die Clientseite aufbereiten
        return rows.map((row: any) => ({
          ...row,
          acceptedRules: Boolean(row.acceptedRules),
          acceptedDocuments: JSON.parse(row.acceptedDocuments || '[]')
        }));
      } catch (error) {
        console.error('Fehler beim Laden der Check-ins aus SQLite:', error);
        return [];
      }
    },
    // Fallback zu localStorage im Browser
    () => {
      console.log("Browser-Umgebung: Lade Check-ins aus localStorage");
      const checkIns = JSON.parse(localStorage.getItem('checkIns') || '[]');
      return checkIns;
    }
  );
};
