
// Server-Konfiguration
export const PORT = process.env.PORT || 3000;
export const NODE_ENV = process.env.NODE_ENV || 'development';

// Datenbank-Konfiguration (aus Umgebungsvariablen)
export const DB_CONFIG = {
  host: process.env.DB_HOST || 'mysql',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'checkin',
  password: process.env.DB_PASSWORD || 'checkin',
  database: process.env.DB_NAME || 'checkin_db'
};

// SMTP-Konfiguration für E-Mail-Versand
export const SMTP_CONFIG = {
  host: process.env.VITE_SMTP_HOST,
  port: parseInt(process.env.VITE_SMTP_PORT || '587'),
  user: process.env.VITE_SMTP_USER,
  pass: process.env.VITE_SMTP_PASS,
  from: process.env.VITE_SMTP_FROM,
  to: process.env.VITE_SMTP_TO,
  subject: process.env.VITE_SMTP_SUBJECT || 'Neuer Besucher Check-In'
};

// Prüfen, ob SMTP konfiguriert ist
export const isSmtpConfigured = () => {
  return Boolean(
    SMTP_CONFIG.host && 
    SMTP_CONFIG.port && 
    SMTP_CONFIG.user && 
    SMTP_CONFIG.pass && 
    SMTP_CONFIG.from && 
    SMTP_CONFIG.to
  );
};

// Admin-Zugangsdaten (aus Umgebungsvariablen)
export const ADMIN_CONFIG = {
  username: process.env.VITE_ADMIN_USERNAME || 'admin',
  password: process.env.VITE_ADMIN_PASSWORD || 'admin'
};
