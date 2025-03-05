
// Konfiguration für SMTP-Versand
export const SMTP_HOST = import.meta.env.VITE_SMTP_HOST || 'smtp.example.com';
export const SMTP_PORT = parseInt(import.meta.env.VITE_SMTP_PORT || '587');
export const SMTP_USER = import.meta.env.VITE_SMTP_USER || '';
export const SMTP_PASS = import.meta.env.VITE_SMTP_PASS || '';
export const SMTP_FROM = import.meta.env.VITE_SMTP_FROM || 'checkin@example.com';
export const SMTP_TO = import.meta.env.VITE_SMTP_TO || 'empfang@example.com';
export const SMTP_SUBJECT = import.meta.env.VITE_SMTP_SUBJECT || 'Neuer Besucher Check-In';

// Standard-Einstellungen für das Unternehmen
export const DEFAULT_COMPANY_SETTINGS = {
  id: '1',
  address: 'Beispielfirma GmbH\nMusterstraße 123\n12345 Musterstadt\nDeutschland',
  logo: '',
  updatedAt: new Date().toISOString()
};
