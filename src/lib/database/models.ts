
import mongoose from 'mongoose';

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
export const CheckInModel = mongoose.models.CheckIn || mongoose.model('CheckIn', CheckInSchema, 'checkins');
export const DocumentModel = mongoose.models.Document || mongoose.model('Document', DocumentSchema, 'documents');
export const UserModel = mongoose.models.User || mongoose.model('User', UserSchema, 'users');

// Interfaces
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

export interface User {
  id: string;
  username: string;
  password: string; // In production, this would be hashed
  role: 'admin' | 'user';
  createdAt: string;
}

export interface Document {
  id: string;
  name: string;
  description: string;
  file: string;
  createdAt: Date;
}
