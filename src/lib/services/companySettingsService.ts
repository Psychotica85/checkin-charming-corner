
import { CompanySettings } from '../database/models';
import { withDatabase } from '../database/connection';

// Standardeinstellung für erste Nutzung
const DEFAULT_SETTINGS: CompanySettings = {
  id: '1', // Wir verwenden immer die gleiche ID für die Unternehmenseinstellungen
  address: 'Musterfirma GmbH\nMusterstraße 123\n12345 Musterstadt\nDeutschland',
  logo: '',
  updatedAt: new Date().toISOString()
};

// Holt die aktuellen Unternehmenseinstellungen
export const getCompanySettings = async (): Promise<CompanySettings> => {
  return withDatabase(
    // Server-Umgebung (MySQL)
    async (conn) => {
      console.log("Lade Unternehmenseinstellungen aus MySQL");
      
      try {
        // Prüfe, ob bereits Einstellungen existieren
        const [rows] = await conn.query('SELECT * FROM company_settings WHERE id = ?', ['1']);
        
        if (rows && (rows as any[]).length > 0) {
          console.log("Vorhandene Unternehmenseinstellungen geladen");
          return (rows as any[])[0] as CompanySettings;
        } else {
          // Standardeinstellungen einfügen
          await conn.query(`
            INSERT INTO company_settings (id, address, logo, updatedAt)
            VALUES (?, ?, ?, ?)
          `, [
            DEFAULT_SETTINGS.id,
            DEFAULT_SETTINGS.address,
            DEFAULT_SETTINGS.logo,
            DEFAULT_SETTINGS.updatedAt
          ]);
          
          console.log("Standardeinstellungen in Datenbank angelegt");
          return DEFAULT_SETTINGS;
        }
      } catch (error) {
        console.error('Fehler beim Laden der Unternehmenseinstellungen:', error);
        throw error;
      }
    }
  );
};

// Speichert aktualisierte Unternehmenseinstellungen
export const updateCompanySettings = async (settings: Partial<CompanySettings>): Promise<{ success: boolean, message: string }> => {
  // Aktuelle Einstellungen laden und aktualisieren
  try {
    const currentSettings = await getCompanySettings();
    const updatedSettings: CompanySettings = {
      ...currentSettings,
      ...settings,
      id: '1', // Immer die gleiche ID verwenden
      updatedAt: new Date().toISOString()
    };
    
    return withDatabase(
      // Server-Umgebung (MySQL)
      async (conn) => {
        console.log("Aktualisiere Unternehmenseinstellungen in MySQL");
        
        try {
          await conn.query(`
            UPDATE company_settings
            SET address = ?, logo = ?, updatedAt = ?
            WHERE id = ?
          `, [
            updatedSettings.address,
            updatedSettings.logo,
            updatedSettings.updatedAt,
            updatedSettings.id
          ]);
          
          console.log("Unternehmenseinstellungen erfolgreich aktualisiert");
          return {
            success: true,
            message: "Unternehmenseinstellungen erfolgreich aktualisiert."
          };
        } catch (error) {
          console.error('Fehler beim Aktualisieren der Unternehmenseinstellungen:', error);
          throw error;
        }
      }
    );
  } catch (error) {
    console.error('Fehler beim Aktualisieren der Unternehmenseinstellungen:', error);
    return {
      success: false,
      message: `Ein Fehler ist aufgetreten: ${error.message}`
    };
  }
};
