
// We need to import the Prisma client instead of individual types
import { Prisma } from '@prisma/client';

// Interface for Document model
export interface IDocument {
  id: string;
  name: string;
  description: string;
  file: string;
  createdAt: Date;
}

// Interface for CheckIn model
export interface ICheckIn {
  id?: string;
  firstName?: string;
  lastName?: string;
  fullName: string;
  company: string;
  visitReason?: string;
  visitDate?: Date;
  visitTime?: string;
  acceptedRules: boolean;
  acceptedDocuments?: string[];
  timestamp: Date;
  timezone?: string;
  reportUrl?: string;
  pdfData?: Buffer;
}

// Interface for User model with lowercase role for compatibility with Admin.tsx
export interface IUser {
  id?: string;
  username: string;
  password: string;
  role: 'admin' | 'user'; // Lowercase for compatibility
  createdAt?: Date;
}

// Type für die Check-In-Daten
export interface CheckInData {
  firstName?: string;
  lastName?: string;
  fullName: string;
  company: string;
  visitReason?: string;
  visitDate?: Date;
  visitTime?: string;
  acceptedRules: boolean;
  acceptedDocuments?: string[];
  timestamp: Date;
}

// Type für User ohne Prisma-Eigenschaften mit lowercase role
export interface User {
  id: string;
  username: string;
  password: string;
  role: 'admin' | 'user'; // Lowercase for compatibility with Admin.tsx
  createdAt: string;
}

// Type für Document ohne Prisma-Eigenschaften
export interface Document {
  id: string;
  name: string;
  description: string;
  file: string;
  createdAt: Date;
}
