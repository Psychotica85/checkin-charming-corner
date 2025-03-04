
// Typdefinitionen für die Frontend-Interaktion
// Diese Typen werden in der gesamten Anwendung verwendet

export interface User {
  id: string;
  username: string;
  password: string;
  role: 'admin' | 'user';
  createdAt: string;
}

export interface Document {
  id: string;
  name: string;
  description: string;
  file: string;
  createdAt: string | Date;
}

// Make PDFDocument explicitly compatible with Document by using the same interface
export type PDFDocument = Document;

export type CheckInData = {
  firstName: string;
  lastName: string;
  fullName: string;
  company: string;
  visitReason: string;
  visitDate: Date | string;
  visitTime: string;
  acceptedRules: boolean;
  acceptedDocuments: string[];
  timestamp: Date | string;
};

export interface ICheckIn {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  company: string;
  visitReason: string;
  visitDate: Date | string;
  visitTime: string;
  acceptedRules: boolean;
  acceptedDocuments: string[];
  timestamp: Date | string;
  timezone: string;
  reportUrl?: string;
}
