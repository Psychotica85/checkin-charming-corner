
import { CompanySettings } from '../database/models';
import { getCompanySettings as getSettings, updateCompanySettings as updateSettings } from './companySettingsService';

// Re-exporte der Funktionen aus companySettingsService
export const getCompanySettings = getSettings;
export const updateCompanySettings = updateSettings;
