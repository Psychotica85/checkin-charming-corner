
// Haupt-API-Modul, das alle API-Funktionen exportiert

// Export der Check-In API-Funktionen
export {
  getCheckIns,
  submitCheckIn,
  updateCheckIn,
  deleteCheckIn,
  generatePdfReport
} from './checkIn';

// Export der Unternehmens-API-Funktionen
export {
  getCompanySettings,
  updateCompanySettings
} from './company';

// Export der Dokument-API-Funktionen
export {
  saveDocument,
  getDocuments,
  deleteDocument
} from './document';

// Export der Benutzer-API-Funktionen
export {
  authenticateUser
} from './user';

// Export der Konfigurationswerte
export {
  SMTP_HOST,
  SMTP_PORT,
  SMTP_USER,
  SMTP_PASS,
  SMTP_FROM,
  SMTP_TO,
  DEFAULT_COMPANY_SETTINGS,
  isBrowser
} from './config';
