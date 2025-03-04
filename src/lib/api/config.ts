
// API Konfigurationsmodul mit SMTP-Einstellungen

// Browser-Erkennung-Funktion
export const isBrowser = () => typeof window !== 'undefined';

// SMTP Konfiguration für E-Mail-Versand
// Verwende import.meta.env für Vite statt process.env
export const SMTP_HOST = isBrowser() ? import.meta.env.VITE_SMTP_HOST || "smtp.example.com" : process.env.VITE_SMTP_HOST || "smtp.example.com";
export const SMTP_PORT = parseInt(isBrowser() ? import.meta.env.VITE_SMTP_PORT || "587" : process.env.VITE_SMTP_PORT || "587", 10);
export const SMTP_USER = isBrowser() ? import.meta.env.VITE_SMTP_USER || "user@example.com" : process.env.VITE_SMTP_USER || "user@example.com";
export const SMTP_PASS = isBrowser() ? import.meta.env.VITE_SMTP_PASS || "password" : process.env.VITE_SMTP_PASS || "password";
export const SMTP_FROM = isBrowser() ? import.meta.env.VITE_SMTP_FROM || "noreply@example.com" : process.env.VITE_SMTP_FROM || "noreply@example.com";
export const SMTP_TO = isBrowser() ? import.meta.env.VITE_SMTP_TO || "admin@example.com" : process.env.VITE_SMTP_TO || "admin@example.com";

// Standard-Unternehmensdaten
export const DEFAULT_COMPANY_SETTINGS = {
  id: '1',
  address: 'Musterfirma GmbH\nMusterstraße 123\n12345 Musterstadt\nDeutschland',
  logo: null,
  updatedAt: new Date().toISOString()
};
