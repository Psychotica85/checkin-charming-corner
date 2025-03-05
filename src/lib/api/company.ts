import { API_BASE_URL } from "@/lib/database/connection";
import {
  getCompanySettings as companyServiceGetCompanySettings,
  updateCompanySettings as companyServiceUpdateCompanySettings,
} from "@/lib/services/companySettingsService";
import { DEFAULT_COMPANY_SETTINGS } from "@/lib/api/config";

// Bestimmen, ob wir im Browser-Kontext sind
const isBrowser = typeof window !== 'undefined';

/**
 * Lädt die Unternehmenseinstellungen
 */
export const getCompanySettings = async () => {
  console.log("getCompanySettings aufgerufen");
  try {
    // Im Browser: API-Aufruf
    if (isBrowser) {
      console.log("Browser-Kontext: Rufe API für Unternehmenseinstellungen auf");
      const response = await fetch(`${API_BASE_URL}/api/company-settings`);
      
      if (!response.ok) {
        throw new Error(`HTTP-Fehler: ${response.status}`);
      }
      
      const settings = await response.json();
      return settings || DEFAULT_COMPANY_SETTINGS;
    }
    
    // Im Server-Kontext: direkt den Service aufrufen
    const settings = await companyServiceGetCompanySettings();
    return settings || DEFAULT_COMPANY_SETTINGS;
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
    
    // Im Browser: API-Aufruf
    if (isBrowser) {
      console.log("Browser-Kontext: Sende Unternehmenseinstellungen an API");
      const response = await fetch(`${API_BASE_URL}/api/company-settings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(settingsData)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP-Fehler: ${response.status}`);
      }
      
      const result = await response.json();
      return {
        success: Boolean(result.success),
        message: result.success ? "Unternehmenseinstellungen wurden erfolgreich gespeichert" : "Fehler beim Speichern der Einstellungen"
      };
    }
    
    // Im Server-Kontext: direkt den Service aufrufen
    const result = await companyServiceUpdateCompanySettings(settingsData);
    
    return {
      success: Boolean(result.success),
      message: result.success ? "Unternehmenseinstellungen wurden erfolgreich gespeichert" : "Fehler beim Speichern der Einstellungen"
    };
  } catch (error) {
    console.error("API error - updateCompanySettings:", error);
    return { success: false, message: "Failed to update company settings" };
  }
};
