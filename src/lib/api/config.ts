
// API Konfigurationsmodul mit SMTP-Einstellungen

// Browser Erkennung
export const isBrowser = typeof window !== 'undefined';

// SMTP Konfiguration für E-Mail-Versand
export const SMTP_HOST = import.meta.env.VITE_SMTP_HOST || "smtp.example.com";
export const SMTP_PORT = parseInt(import.meta.env.VITE_SMTP_PORT || "587", 10);
export const SMTP_USER = import.meta.env.VITE_SMTP_USER || "user@example.com";
export const SMTP_PASS = import.meta.env.VITE_SMTP_PASS || "password";
export const SMTP_FROM = import.meta.env.VITE_SMTP_FROM || "noreply@example.com";
export const SMTP_TO = import.meta.env.VITE_SMTP_TO || "admin@example.com";

// Standard-Unternehmensdaten
export const DEFAULT_COMPANY_SETTINGS = {
  id: '1',
  address: 'Musterfirma GmbH\nMusterstraße 123\n12345 Musterstadt\nDeutschland',
  logo: null,
  updatedAt: new Date().toISOString()
};
