
import { DEFAULT_COMPANY_SETTINGS, isBrowser } from "./config";
import {
  getCompanySettings as companyServiceGetCompanySettings,
  updateCompanySettings as companyServiceUpdateCompanySettings,
} from "@/lib/services/companySettingsService";

/**
 * Lädt die Unternehmenseinstellungen
 */
export const getCompanySettings = async () => {
  console.log("getCompanySettings aufgerufen");
  try {
    // Prüfen, ob wir im Browser-Kontext sind
    if (isBrowser()) {
      console.log("Browser-Kontext erkannt für getCompanySettings");
      const localSettings = localStorage.getItem('companySettings');
      if (localSettings) {
        console.log("Lokale Unternehmenseinstellungen gefunden");
        return JSON.parse(localSettings);
      }
      // Standardwerte setzen, wenn keine Einstellungen vorhanden sind
      console.log("Keine lokalen Einstellungen gefunden, setze Standardeinstellungen");
      localStorage.setItem('companySettings', JSON.stringify(DEFAULT_COMPANY_SETTINGS));
      return DEFAULT_COMPANY_SETTINGS;
    }
    
    // Server-Kontext: Normale Datenbankabfrage
    const settings = await companyServiceGetCompanySettings();
    if (!settings) {
      console.log("Keine Unternehmenseinstellungen in der Datenbank gefunden, verwende Standardwerte");
      return DEFAULT_COMPANY_SETTINGS;
    }
    return settings;
  } catch (error) {
    console.error("API error - getCompanySettings:", error);
    console.log("Fehler beim Laden der Unternehmenseinstellungen, verwende Standardwerte");
    return DEFAULT_COMPANY_SETTINGS;
  }
};

/**
 * Aktualisiert die Unternehmenseinstellungen
 */
export const updateCompanySettings = async (settingsData: any) => {
  try {
    // Prüfen, ob wir im Browser-Kontext sind
    if (isBrowser()) {
      console.log("Browser-Kontext erkannt, aktualisiere lokale Einstellungen");
      const localSettings = localStorage.getItem('companySettings');
      const currentSettings = localSettings ? JSON.parse(localSettings) : DEFAULT_COMPANY_SETTINGS;
      const updatedSettings = {
        ...currentSettings,
        ...settingsData,
        updatedAt: new Date().toISOString()
      };
      localStorage.setItem('companySettings', JSON.stringify(updatedSettings));
      return { success: true, message: "Unternehmenseinstellungen erfolgreich aktualisiert" };
    }
    
    return await companyServiceUpdateCompanySettings(settingsData);
  } catch (error) {
    console.error("API error - updateCompanySettings:", error);
    return { success: false, message: "Failed to update company settings" };
  }
};
