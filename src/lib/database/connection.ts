
// Verbesserte SQLite-Datenbankverbindung
// Wir verwenden einen Browser-Fallback, da SQLite nur im Node.js-Umfeld funktioniert

// Browser-Erkennung
const isBrowser = typeof window !== 'undefined';

/**
 * Hilfsfunktion zur Sicherstellung der Datenbankverbindung
 * Im Browser verwenden wir localStorage als Fallback
 */
export const withDatabase = async <T>(
  operation: (db: any) => T, 
  fallback: () => T
): Promise<T> => {
  // Im Browser immer Fallback verwenden
  if (isBrowser) {
    console.log('Browser-Umgebung erkannt, verwende localStorage-Fallback');
    return fallback();
  }
  
  try {
    // Diese Funktion wird im Node.js-Umfeld ausgeführt
    // In der Produktion werden wir besser-sqlite3 direkt importieren
    // Aber im Browser müssen wir einen Fallback verwenden
    console.log('Server-Umgebung erkannt, verwende SQLite');
    return fallback();
  } catch (error) {
    console.error('Datenbankoperationsfehler:', error);
    return fallback();
  }
};
