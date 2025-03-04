
// Typdefinitionen für die Frontend-Interaktion
// Hinweis: Diese sind unabhängig von den Prisma-Modellen

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
  createdAt: string;
}

export interface IDocument extends Document {
  // Erweitert Document für bessere Kompatibilität mit DocumentService
}

export type CheckInData = {
  firstName: string;
  lastName: string;
  fullName: string;
  company: string;
  visitReason: string;
  visitDate: Date;
  visitTime: string;
  acceptedRules: boolean;
  acceptedDocuments: string[];
  timestamp: Date;
};

export interface ICheckIn {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  company: string;
  visitReason: string;
  visitDate: Date;
  visitTime: string;
  acceptedRules: boolean;
  acceptedDocuments: string[];
  timestamp: Date;
  timezone: string;
  reportUrl?: string;
}
