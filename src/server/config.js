
import dotenv from 'dotenv';

// Lade Umgebungsvariablen
dotenv.config();

// Server-Konfiguration
export const PORT = process.env.PORT || 3000;
export const NODE_ENV = process.env.NODE_ENV || 'development';

// Admin-Konfiguration
export const ADMIN_USERNAME = process.env.VITE_ADMIN_USERNAME || 'admin';

// Datenbank-Konfiguration
export const DB_CONFIG = {
  host: process.env.DB_HOST || 'mysql',
  port: process.env.DB_PORT || '3306',
  user: process.env.DB_USER || 'checkin',
  password: process.env.DB_PASSWORD || 'checkin',
  database: process.env.DB_NAME || 'checkin_db'
};

// SMTP-Konfiguration
export const SMTP_CONFIG = {
  host: process.env.VITE_SMTP_HOST,
  port: parseInt(process.env.VITE_SMTP_PORT || '587'),
  user: process.env.VITE_SMTP_USER,
  pass: process.env.VITE_SMTP_PASS,
  from: process.env.VITE_SMTP_FROM,
  to: process.env.VITE_SMTP_TO || process.env.VITE_SMTP_FROM,
  subject: process.env.VITE_SMTP_SUBJECT || 'Neuer Besucher Check-In'
};

// Prüft, ob die SMTP-Konfiguration vollständig ist
export const isSmtpConfigured = () => {
  return !!(SMTP_CONFIG.host && SMTP_CONFIG.user && SMTP_CONFIG.pass && SMTP_CONFIG.from);
};
