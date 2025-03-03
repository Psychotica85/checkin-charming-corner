
import mongoose, { Document } from 'mongoose';

// Interface für das Document-Modell
export interface IDocument extends Document {
  name: string;
  description: string;
  file: string;
  createdAt: Date;
}

// Interface für das CheckIn-Modell
export interface ICheckIn extends Document {
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

// Interface für das User-Modell
export interface IUser extends Document {
  username: string;
  password: string;
  role: 'admin' | 'user';
  createdAt: Date;
}

// Define Mongoose schemas
const CheckInSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  fullName: String,
  company: String,
  visitReason: String,
  visitDate: Date,
  visitTime: String,
  acceptedRules: Boolean,
  acceptedDocuments: [String],
  timestamp: Date,
  timezone: String,
  reportUrl: String,
  pdfData: Buffer // Store PDF as Buffer type for binary data
});

const DocumentSchema = new mongoose.Schema({
  name: String,
  description: String,
  file: String, // Base64 encoded PDF string
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['admin', 'user'],
    default: 'user'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Define models (only create once)
export const CheckInModel = mongoose.models.CheckIn || mongoose.model<ICheckIn>('CheckIn', CheckInSchema, 'checkins');
export const DocumentModel = mongoose.models.Document || mongoose.model<IDocument>('Document', DocumentSchema, 'documents');
export const UserModel = mongoose.models.User || mongoose.model<IUser>('User', UserSchema, 'users');

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

// Type für User ohne Mongoose-Dokument-Eigenschaften
export interface User {
  id: string;
  username: string;
  password: string; // In production, this would be hashed
  role: 'admin' | 'user';
  createdAt: string;
}

// Type für Document ohne Mongoose-Dokument-Eigenschaften
export interface Document {
  id: string;
  name: string;
  description: string;
  file: string;
  createdAt: Date;
}
