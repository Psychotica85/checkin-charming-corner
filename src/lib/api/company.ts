
import { useLocalStorage, isBrowser } from "@/lib/database/connection";
import {
  getCompanySettings as companyServiceGetCompanySettings,
  updateCompanySettings as companyServiceUpdateCompanySettings,
} from "@/lib/services/companySettingsService";
import { DEFAULT_COMPANY_SETTINGS } from "@/lib/api/config";

/**
 * Lädt die Unternehmenseinstellungen
 */
export const getCompanySettings = async () => {
  console.log("getCompanySettings aufgerufen");
  try {
    // Im Browser-Kontext verwenden wir sessionStorage für die Demo
    if (isBrowser) {
      console.log("Browser-Kontext erkannt, lade Unternehmenseinstellungen aus sessionStorage");
      
      const storedSettings = sessionStorage.getItem('companySettings');
      if (storedSettings) {
        return JSON.parse(storedSettings);
      }
      
      // Standardeinstellungen verwenden, wenn keine gespeichert sind
      sessionStorage.setItem('companySettings', JSON.stringify(DEFAULT_COMPANY_SETTINGS));
      return DEFAULT_COMPANY_SETTINGS;
    }
    
    // Im Server-Kontext den richtigen Service aufrufen
    return await companyServiceGetCompanySettings();
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
    console.log("updateCompanySettings aufgerufen mit:", settingsData);
    
    // Im Browser-Kontext verwenden wir sessionStorage für die Demo
    if (isBrowser) {
      console.log("Browser-Kontext erkannt, speichere Unternehmenseinstellungen in sessionStorage");
      
      // Einstellungen im sessionStorage speichern
      sessionStorage.setItem('companySettings', JSON.stringify({
        ...settingsData,
        updatedAt: new Date().toISOString()
      }));
      
      return {
        success: true,
        message: "Unternehmenseinstellungen wurden erfolgreich gespeichert"
      };
    }
    
    // Im Server-Kontext den richtigen Service aufrufen
    return await companyServiceUpdateCompanySettings(settingsData);
  } catch (error) {
    console.error("API error - updateCompanySettings:", error);
    return { success: false, message: "Failed to update company settings" };
  }
};
