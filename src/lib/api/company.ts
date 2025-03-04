
import { useLocalStorage } from "@/lib/database/connection";
import {
  getCompanySettings as companyServiceGetCompanySettings,
  updateCompanySettings as companyServiceUpdateCompanySettings,
} from "@/lib/services/companySettingsService";

// Standard-Unternehmenseinstellungen
const DEFAULT_COMPANY_SETTINGS = {
  id: '1',
  address: 'Musterfirma GmbH\nMusterstraße 123\n12345 Musterstadt\nDeutschland',
  logo: null,
  updatedAt: new Date().toISOString()
};

/**
 * Lädt die Unternehmenseinstellungen
 */
export const getCompanySettings = async () => {
  console.log("getCompanySettings aufgerufen");
  try {
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
    return await companyServiceUpdateCompanySettings(settingsData);
  } catch (error) {
    console.error("API error - updateCompanySettings:", error);
    return { success: false, message: "Failed to update company settings" };
  }
};
