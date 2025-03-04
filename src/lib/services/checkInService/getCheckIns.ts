
import { CheckIn } from '@/lib/database/models';
import { withDatabase } from '@/lib/database/connection';

export const getCheckIns = async (): Promise<CheckIn[]> => {
  return withDatabase(
    // Diese Funktion wird im Server ausgeführt
    (db) => {
      console.log("Lade Check-ins aus SQLite");
      
      try {
        // Stelle sicher, dass die Tabelle existiert
        db.exec(`
          CREATE TABLE IF NOT EXISTS checkins (
            id TEXT PRIMARY KEY,
            firstName TEXT,
            lastName TEXT,
            fullName TEXT NOT NULL,
            company TEXT NOT NULL,
            visitReason TEXT,
            visitDate TEXT,
            visitTime TEXT,
            acceptedRules INTEGER DEFAULT 0,
            acceptedDocuments TEXT,
            timestamp TEXT NOT NULL,
            timezone TEXT NOT NULL,
            pdfData TEXT
          );
        `);
        
        const stmt = db.prepare(`
          SELECT id, firstName, lastName, fullName, company, 
                 visitReason, visitDate, visitTime, acceptedRules, 
                 acceptedDocuments, timestamp, timezone, pdfData
          FROM checkins
          ORDER BY timestamp DESC
        `);
        
        const rows = stmt.all();
        console.log(`${rows.length} Check-ins aus Datenbank geladen`);
        
        // Daten für die Clientseite aufbereiten
        return rows.map((row: any) => {
          // Erstelle eine URL für das PDF, wenn PDF-Daten vorhanden sind
          let reportUrl = undefined;
          if (row.pdfData) {
            try {
              // PDF-Daten in Blob umwandeln und URL erstellen
              const pdfDataURL = row.pdfData;
              const byteString = atob(pdfDataURL.split(',')[1]);
              const mimeString = pdfDataURL.split(',')[0].split(':')[1].split(';')[0];
              const ab = new ArrayBuffer(byteString.length);
              const ia = new Uint8Array(ab);
              for (let i = 0; i < byteString.length; i++) {
                ia[i] = byteString.charCodeAt(i);
              }
              const blob = new Blob([ab], { type: mimeString });
              reportUrl = URL.createObjectURL(blob);
            } catch (error) {
              console.error('Fehler beim Erstellen der PDF-URL:', error);
            }
          }
          
          return {
            ...row,
            acceptedRules: Boolean(row.acceptedRules),
            acceptedDocuments: JSON.parse(row.acceptedDocuments || '[]'),
            reportUrl
          };
        });
      } catch (error) {
        console.error('Fehler beim Laden der Check-ins aus SQLite:', error);
        throw error; // Fehler weiterleiten
      }
    }
  );
};
