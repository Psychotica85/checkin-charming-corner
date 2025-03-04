
// Definition für PDF-Dokumente
export interface PDFDocument {
  id: string;
  name: string;
  description: string;
  file: string; // base64-encoded PDF
  createdAt: string; // ISO string format
}

// Definition für Benutzer
export interface User {
  id: string;
  username: string;
  password: string;
  role: 'admin' | 'user'; // Typed role für bessere Typsicherheit
  createdAt: string; // ISO string format
}

// Definition für Check-ins
export interface CheckIn {
  id?: string;
  firstName?: string;
  lastName?: string;
  fullName: string;
  company: string;
  visitReason?: string;
  visitDate?: Date | string;
  visitTime?: string;
  acceptedRules: boolean;
  acceptedDocuments?: string[];
  timestamp: Date | string;
  timezone?: string;
  pdfData?: string; // base64-encoded PDF
  reportUrl?: string; // URL to generated PDF report
}

// Definition für CheckInData (Eingabedaten für das Formular)
export interface CheckInData {
  firstName?: string;
  lastName?: string;
  fullName: string;
  company: string;
  visitReason?: string;
  visitDate?: Date | string;
  visitTime?: string;
  acceptedRules: boolean;
  acceptedDocuments?: string[];
  timestamp: Date | string;
}

// Hilfstypen für Backend-Operationen
export interface ApiResponse {
  success: boolean;
  message: string;
  data?: any;
  error?: any;
  reportUrl?: string;
}
