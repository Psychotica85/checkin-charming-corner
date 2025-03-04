
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
    // Server-Umgebung (SQLite)
    (db) => {
      console.log("Server-Umgebung: Lade Unternehmenseinstellungen");
      
      try {
        // Erstelle die Tabelle, falls sie noch nicht existiert
        db.prepare(`
          CREATE TABLE IF NOT EXISTS company_settings (
            id TEXT PRIMARY KEY,
            address TEXT,
            logo TEXT,
            updatedAt TEXT
          )
        `).run();
        
        // Prüfe, ob bereits Einstellungen existieren
        const settings = db.prepare('SELECT * FROM company_settings WHERE id = ?').get('1');
        
        if (settings) {
          return settings as CompanySettings;
        } else {
          // Standardeinstellungen einfügen
          const stmt = db.prepare(`
            INSERT INTO company_settings (id, address, logo, updatedAt)
            VALUES (?, ?, ?, ?)
          `);
          
          stmt.run(
            DEFAULT_SETTINGS.id,
            DEFAULT_SETTINGS.address,
            DEFAULT_SETTINGS.logo,
            DEFAULT_SETTINGS.updatedAt
          );
          
          return DEFAULT_SETTINGS;
        }
      } catch (error) {
        console.error('Fehler beim Laden der Unternehmenseinstellungen:', error);
        return DEFAULT_SETTINGS;
      }
    },
    // Browser-Umgebung (localStorage)
    () => {
      console.log("Browser-Umgebung: Lade Unternehmenseinstellungen aus localStorage");
      
      try {
        const settings = localStorage.getItem('companySettings');
        if (settings) {
          return JSON.parse(settings) as CompanySettings;
        } else {
          // Standardeinstellungen speichern
          localStorage.setItem('companySettings', JSON.stringify(DEFAULT_SETTINGS));
          return DEFAULT_SETTINGS;
        }
      } catch (error) {
        console.error('Fehler beim Laden der Unternehmenseinstellungen aus localStorage:', error);
        return DEFAULT_SETTINGS;
      }
    }
  );
};

// Speichert aktualisierte Unternehmenseinstellungen
export const updateCompanySettings = async (settings: Partial<CompanySettings>): Promise<{ success: boolean, message: string }> => {
  // Aktuelle Einstellungen laden und aktualisieren
  const currentSettings = await getCompanySettings();
  const updatedSettings: CompanySettings = {
    ...currentSettings,
    ...settings,
    id: '1', // Immer die gleiche ID verwenden
    updatedAt: new Date().toISOString()
  };
  
  return withDatabase(
    // Server-Umgebung (SQLite)
    (db) => {
      console.log("Server-Umgebung: Aktualisiere Unternehmenseinstellungen");
      
      try {
        const stmt = db.prepare(`
          UPDATE company_settings
          SET address = ?, logo = ?, updatedAt = ?
          WHERE id = ?
        `);
        
        stmt.run(
          updatedSettings.address,
          updatedSettings.logo,
          updatedSettings.updatedAt,
          updatedSettings.id
        );
        
        return {
          success: true,
          message: "Unternehmenseinstellungen erfolgreich aktualisiert."
        };
      } catch (error) {
        console.error('Fehler beim Aktualisieren der Unternehmenseinstellungen:', error);
        return {
          success: false,
          message: "Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut."
        };
      }
    },
    // Browser-Umgebung (localStorage)
    () => {
      console.log("Browser-Umgebung: Aktualisiere Unternehmenseinstellungen in localStorage");
      
      try {
        localStorage.setItem('companySettings', JSON.stringify(updatedSettings));
        return {
          success: true,
          message: "Unternehmenseinstellungen erfolgreich aktualisiert."
        };
      } catch (error) {
        console.error('Fehler beim Aktualisieren der Unternehmenseinstellungen in localStorage:', error);
        return {
          success: false,
          message: "Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut."
        };
      }
    }
  );
};
