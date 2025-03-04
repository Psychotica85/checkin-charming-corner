
// API interface with SQLite and email functionality
// This file re-exports all functionality from our service modules

export { submitCheckIn, getCheckIns } from './services/checkInService';
export { getDocuments, saveDocument, deleteDocument } from './services/documentService';
export { 
  getUsers, createUser, updateUser, deleteUser, authenticateUser 
} from './services/userService';

// Environment variables for email functionality (to be implemented)
export const SMTP_HOST = import.meta.env.VITE_SMTP_HOST || '';
export const SMTP_PORT = import.meta.env.VITE_SMTP_PORT || '587';
export const SMTP_USER = import.meta.env.VITE_SMTP_USER || '';
export const SMTP_PASS = import.meta.env.VITE_SMTP_PASS || '';
export const SMTP_FROM = import.meta.env.VITE_SMTP_FROM || '';
export const SMTP_TO = import.meta.env.VITE_SMTP_TO || '';
