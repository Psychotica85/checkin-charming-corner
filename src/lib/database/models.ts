
import { Document as PrismaDocument, CheckIn as PrismaCheckIn, User as PrismaUser, Role } from '@prisma/client';

// Export Prisma types
export type { PrismaDocument, PrismaCheckIn, PrismaUser, Role };

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

// Interface for User model
export interface IUser {
  id?: string;
  username: string;
  password: string;
  role: 'ADMIN' | 'USER';
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

// Type für User ohne Prisma-Eigenschaften
export interface User {
  id: string;
  username: string;
  password: string; // In production, this would be hashed
  role: 'ADMIN' | 'USER';
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
