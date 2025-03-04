
import mongoose, { Schema, Document } from 'mongoose';

// Benutzer
export interface IUserDocument extends Document {
  username: string;
  password: string;
  role: 'ADMIN' | 'USER';
  createdAt: Date;
}

const UserSchema = new Schema<IUserDocument>({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['ADMIN', 'USER'], default: 'USER' },
  createdAt: { type: Date, default: Date.now }
});

// Dokument
export interface IDocumentDocument extends Document {
  name: string;
  description: string;
  file: string;
  createdAt: Date;
}

const DocumentSchema = new Schema<IDocumentDocument>({
  name: { type: String, required: true },
  description: { type: String },
  file: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

// Check-In
export interface ICheckInDocument extends Document {
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
  pdfData?: Buffer;
}

const CheckInSchema = new Schema<ICheckInDocument>({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  fullName: { type: String, required: true },
  company: { type: String, required: true },
  visitReason: { type: String, required: true },
  visitDate: { type: Date, required: true },
  visitTime: { type: String, required: true },
  acceptedRules: { type: Boolean, default: false },
  acceptedDocuments: [{ type: String }],
  timestamp: { type: Date, default: Date.now },
  timezone: { type: String, default: 'Europe/Berlin' },
  pdfData: { type: Buffer }
});

// Modelle exportieren - Lazy-Load für bessere Browser-Kompatibilität
export const getUserModel = () => {
  return mongoose.models.User || mongoose.model<IUserDocument>('User', UserSchema);
};

export const getDocumentModel = () => {
  return mongoose.models.Document || mongoose.model<IDocumentDocument>('Document', DocumentSchema);
};

export const getCheckInModel = () => {
  return mongoose.models.CheckIn || mongoose.model<ICheckInDocument>('CheckIn', CheckInSchema);
};
