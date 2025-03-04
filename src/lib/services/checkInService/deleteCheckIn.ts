
import { withDatabase } from '@/lib/database/connection';

export const deleteCheckIn = async (id: string): Promise<{ success: boolean, message: string }> => {
  return withDatabase(
    // Diese Funktion wird im Server ausgeführt
    (db) => {
      console.log("Lösche Check-in aus SQLite mit ID:", id);
      
      try {
        const stmt = db.prepare('DELETE FROM checkins WHERE id = ?');
        const result = stmt.run(id);
        
        if (result.changes > 0) {
          console.log(`Check-in mit ID ${id} erfolgreich gelöscht`);
          return {
            success: true,
            message: "Check-in erfolgreich gelöscht."
          };
        } else {
          console.log(`Check-in mit ID ${id} nicht gefunden`);
          return {
            success: false,
            message: "Check-in konnte nicht gefunden werden."
          };
        }
      } catch (error) {
        console.error('Fehler beim Löschen des Check-ins aus SQLite:', error);
        throw error; // Fehler weiterleiten statt Rückgabe
      }
    }
  );
};
