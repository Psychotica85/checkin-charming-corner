
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
    // Direkt den Service aufrufen, unabhängig vom Kontext
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
    
    // Direkt den Service aufrufen
    const result = await companyServiceUpdateCompanySettings(settingsData);
    
    return {
      success: Boolean(result),
      message: result ? "Unternehmenseinstellungen wurden erfolgreich gespeichert" : "Fehler beim Speichern der Einstellungen"
    };
  } catch (error) {
    console.error("API error - updateCompanySettings:", error);
    return { success: false, message: "Failed to update company settings" };
  }
};
