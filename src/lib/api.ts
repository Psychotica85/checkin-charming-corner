// API interface with MongoDB and email functionality
import { formatInTimeZone } from 'date-fns-tz';
import { generateCheckInReport } from './pdfGenerator';
import mongoose from 'mongoose';

// Environment variables will be injected via process.env in Node.js
const MONGODB_URI = import.meta.env.VITE_MONGODB_URI || 'mongodb://localhost:27017/checkin';
const SMTP_HOST = import.meta.env.VITE_SMTP_HOST || '';
const SMTP_PORT = import.meta.env.VITE_SMTP_PORT || '587';
const SMTP_USER = import.meta.env.VITE_SMTP_USER || '';
const SMTP_PASS = import.meta.env.VITE_SMTP_PASS || '';
const SMTP_FROM = import.meta.env.VITE_SMTP_FROM || '';
const SMTP_TO = import.meta.env.VITE_SMTP_TO || '';

// Connect to MongoDB
let isConnected = false;

const connectToDatabase = async () => {
  if (isConnected) return;
  
  try {
    await mongoose.connect(MONGODB_URI);
    isConnected = true;
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw new Error('Failed to connect to MongoDB');
  }
};

// Define Mongoose schemas and models
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
  pdfData: Buffer
});

const DocumentSchema = new mongoose.Schema({
  name: String,
  description: String,
  file: String,
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
const CheckInModel = mongoose.models.CheckIn || mongoose.model('CheckIn', CheckInSchema, 'checkins');
const DocumentModel = mongoose.models.Document || mongoose.model('Document', DocumentSchema, 'documents');
const UserModel = mongoose.models.User || mongoose.model('User', UserSchema, 'users');

interface CheckInData {
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

export const submitCheckIn = async (data: CheckInData): Promise<{ success: boolean, message: string, reportUrl?: string }> => {
  console.log('Check-in data submitted:', data);
  
  try {
    await connectToDatabase();
    
    // Create timestamp with Berlin timezone
    const berlinTimestamp = formatInTimeZone(new Date(), 'Europe/Berlin', "yyyy-MM-dd'T'HH:mm:ssXXX");
    
    // Get documents from MongoDB - Using exec() to fix TypeScript error
    const documents = await DocumentModel.find().lean().exec();
    
    // Generate PDF report
    const pdfBlob = await generateCheckInReport({
      firstName: data.firstName || '',
      lastName: data.lastName || '',
      company: data.company,
      visitReason: data.visitReason || '',
      visitDate: data.visitDate || new Date(),
      visitTime: data.visitTime || '',
      acceptedDocuments: data.acceptedDocuments || [],
      timestamp: new Date(berlinTimestamp)
    }, documents);
    
    // Convert the blob to Buffer to store in MongoDB
    const arrayBuffer = await pdfBlob.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Create a new check-in record
    const newCheckIn = new CheckInModel({
      ...data,
      timestamp: berlinTimestamp,
      timezone: 'Europe/Berlin',
      pdfData: buffer
    });
    
    // Save to MongoDB
    await newCheckIn.save();
    
    // Create a URL for the PDF (for preview in browser)
    const pdfUrl = URL.createObjectURL(pdfBlob);
    
    return { 
      success: true, 
      message: "Check-in erfolgreich gespeichert. Willkommen!",
      reportUrl: pdfUrl
    };
  } catch (error) {
    console.error('Error processing check-in:', error);
    return {
      success: false,
      message: "Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut."
    };
  }
};

export const getCheckIns = async (): Promise<any[]> => {
  console.log('Fetching check-ins from MongoDB');
  
  try {
    await connectToDatabase();
    const checkIns = await CheckInModel.find().sort({ timestamp: -1 }).lean().exec();
    
    // Create object URLs for PDF data
    return checkIns.map(checkIn => {
      const { pdfData, ...rest } = checkIn;
      
      // If we have PDF data, create a blob URL for it
      let reportUrl = null;
      if (pdfData) {
        const blob = new Blob([Buffer.from(pdfData)], { type: 'application/pdf' });
        reportUrl = URL.createObjectURL(blob);
      }
      
      return { ...rest, reportUrl, _id: checkIn._id.toString() };
    });
  } catch (error) {
    console.error('Error fetching check-ins:', error);
    return [];
  }
};

// Document management functions
export const getDocuments = async () => {
  try {
    await connectToDatabase();
    return await DocumentModel.find().lean().exec();
  } catch (error) {
    console.error('Error fetching documents:', error);
    
    // Fallback to localStorage if MongoDB fails
    return JSON.parse(localStorage.getItem('pdfDocuments') || '[]');
  }
};

export const saveDocument = async (document: any) => {
  try {
    await connectToDatabase();
    const newDoc = new DocumentModel(document);
    await newDoc.save();
    return true;
  } catch (error) {
    console.error('Error saving document:', error);
    
    // Fallback to localStorage if MongoDB fails
    const docs = JSON.parse(localStorage.getItem('pdfDocuments') || '[]');
    docs.push(document);
    localStorage.setItem('pdfDocuments', JSON.stringify(docs));
    return false;
  }
};

export const deleteDocument = async (documentId: string) => {
  try {
    await connectToDatabase();
    await DocumentModel.findByIdAndDelete(documentId).exec();
    return true;
  } catch (error) {
    console.error('Error deleting document:', error);
    
    // Fallback to localStorage if MongoDB fails
    const docs = JSON.parse(localStorage.getItem('pdfDocuments') || '[]');
    const updatedDocs = docs.filter((doc: any) => doc.id !== documentId);
    localStorage.setItem('pdfDocuments', JSON.stringify(updatedDocs));
    return false;
  }
};

// User management functions for admin
interface User {
  id: string;
  username: string;
  password: string; // In production, this would be hashed
  role: 'admin' | 'user';
  createdAt: string;
}

export const getUsers = async (): Promise<User[]> => {
  try {
    await connectToDatabase();
    
    // Check if any users exist
    const count = await UserModel.countDocuments().exec();
    
    // If no users exist, create the default admin user
    if (count === 0) {
      const defaultAdmin = new UserModel({
        username: 'admin',
        password: 'admin', // In production, this would be hashed
        role: 'admin',
        createdAt: new Date()
      });
      
      await defaultAdmin.save();
      
      // Return the created admin user
      return [{
        id: defaultAdmin._id.toString(),
        username: defaultAdmin.username,
        password: defaultAdmin.password,
        role: defaultAdmin.role,
        createdAt: defaultAdmin.createdAt.toISOString()
      }];
    }
    
    // Otherwise, return all users
    const users = await UserModel.find().lean().exec();
    
    return users.map(user => ({
      id: user._id.toString(),
      username: user.username,
      password: user.password,
      role: user.role as 'admin' | 'user',
      createdAt: user.createdAt.toISOString()
    }));
  } catch (error) {
    console.error('Error fetching users:', error);
    
    // Fallback to localStorage if MongoDB fails
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    
    // If no users exist, create the default admin user
    if (users.length === 0) {
      const defaultAdmin = {
        id: '1',
        username: 'admin',
        password: 'admin',
        role: 'admin' as const,
        createdAt: new Date().toISOString()
      };
      localStorage.setItem('users', JSON.stringify([defaultAdmin]));
      return [defaultAdmin];
    }
    
    return users;
  }
};

export const createUser = async (userData: Omit<User, 'id' | 'createdAt'>): Promise<{ success: boolean, message: string }> => {
  try {
    await connectToDatabase();
    
    // Check if username already exists
    const existingUser = await UserModel.findOne({ username: userData.username }).exec();
    
    if (existingUser) {
      return { success: false, message: 'Benutzername bereits vergeben' };
    }
    
    // Create new user
    const newUser = new UserModel({
      username: userData.username,
      password: userData.password,
      role: userData.role,
      createdAt: new Date()
    });
    
    await newUser.save();
    
    return { success: true, message: 'Benutzer erfolgreich erstellt' };
  } catch (error) {
    console.error('Error creating user:', error);
    
    // Fallback to localStorage if MongoDB fails
    try {
      const users = await getUsers();
      
      // Check if username already exists
      if (users.some(user => user.username === userData.username)) {
        return { success: false, message: 'Benutzername bereits vergeben' };
      }
      
      const newUser = {
        ...userData,
        id: Date.now().toString(),
        createdAt: new Date().toISOString()
      };
      
      users.push(newUser);
      localStorage.setItem('users', JSON.stringify(users));
      
      return { success: true, message: 'Benutzer erfolgreich erstellt' };
    } catch (localStorageError) {
      console.error('Error creating user in localStorage:', localStorageError);
      return { success: false, message: 'Fehler beim Erstellen des Benutzers' };
    }
  }
};

export const updateUser = async (id: string, userData: Partial<Omit<User, 'id' | 'createdAt'>>): Promise<{ success: boolean, message: string }> => {
  try {
    await connectToDatabase();
    
    // If changing username, check if it's already taken by another user
    if (userData.username) {
      const existingUser = await UserModel.findOne({ 
        username: userData.username,
        _id: { $ne: id }
      }).exec();
      
      if (existingUser) {
        return { success: false, message: 'Benutzername bereits vergeben' };
      }
    }
    
    // Update user
    const updatedUser = await UserModel.findByIdAndUpdate(
      id,
      { $set: userData },
      { new: true }
    ).exec();
    
    if (!updatedUser) {
      return { success: false, message: 'Benutzer nicht gefunden' };
    }
    
    return { success: true, message: 'Benutzer erfolgreich aktualisiert' };
  } catch (error) {
    console.error('Error updating user:', error);
    
    // Fallback to localStorage if MongoDB fails
    try {
      const users = await getUsers();
      const userIndex = users.findIndex(user => user.id === id);
      
      if (userIndex === -1) {
        return { success: false, message: 'Benutzer nicht gefunden' };
      }
      
      // If changing username, check if it's already taken by another user
      if (userData.username && userData.username !== users[userIndex].username) {
        const usernameExists = users.some(
          user => user.id !== id && user.username === userData.username
        );
        
        if (usernameExists) {
          return { success: false, message: 'Benutzername bereits vergeben' };
        }
      }
      
      // Update user data
      users[userIndex] = {
        ...users[userIndex],
        ...userData
      };
      
      localStorage.setItem('users', JSON.stringify(users));
      
      return { success: true, message: 'Benutzer erfolgreich aktualisiert' };
    } catch (localStorageError) {
      console.error('Error updating user in localStorage:', localStorageError);
      return { success: false, message: 'Fehler beim Aktualisieren des Benutzers' };
    }
  }
};

export const deleteUser = async (id: string): Promise<{ success: boolean, message: string }> => {
  try {
    await connectToDatabase();
    
    // Get all admin users
    const adminUsers = await UserModel.find({ role: 'admin' }).lean().exec();
    
    // Get the user to delete
    const userToDelete = await UserModel.findById(id).lean().exec();
    
    if (!userToDelete) {
      return { success: false, message: 'Benutzer nicht gefunden' };
    }
    
    // Prevent deleting the last admin user
    if (userToDelete.role === 'admin' && adminUsers.length <= 1) {
      return { success: false, message: 'Der letzte Admin-Benutzer kann nicht gelöscht werden' };
    }
    
    // Delete the user
    await UserModel.findByIdAndDelete(id).exec();
    
    return { success: true, message: 'Benutzer erfolgreich gelöscht' };
  } catch (error) {
    console.error('Error deleting user:', error);
    
    // Fallback to localStorage if MongoDB fails
    try {
      const users = await getUsers();
      
      // Prevent deleting the last admin user
      const admins = users.filter(user => user.role === 'admin');
      const userToDelete = users.find(user => user.id === id);
      
      if (!userToDelete) {
        return { success: false, message: 'Benutzer nicht gefunden' };
      }
      
      if (userToDelete.role === 'admin' && admins.length <= 1) {
        return { success: false, message: 'Der letzte Admin-Benutzer kann nicht gelöscht werden' };
      }
      
      const updatedUsers = users.filter(user => user.id !== id);
      localStorage.setItem('users', JSON.stringify(updatedUsers));
      
      return { success: true, message: 'Benutzer erfolgreich gelöscht' };
    } catch (localStorageError) {
      console.error('Error deleting user in localStorage:', localStorageError);
      return { success: false, message: 'Fehler beim Löschen des Benutzers' };
    }
  }
};

export const authenticateUser = async (username: string, password: string): Promise<{ success: boolean, message: string, user?: Omit<User, 'password'> }> => {
  try {
    await connectToDatabase();
    
    // Find user by username and password
    const user = await UserModel.findOne({ 
      username: username,
      password: password 
    }).lean().exec();
    
    if (!user) {
      return { success: false, message: 'Ungültiger Benutzername oder Passwort' };
    }
    
    // Return user without password
    return { 
      success: true, 
      message: 'Anmeldung erfolgreich', 
      user: {
        id: user._id.toString(),
        username: user.username,
        role: user.role as 'admin' | 'user',
        createdAt: user.createdAt.toISOString()
      }
    };
  } catch (error) {
    console.error('Error authenticating user:', error);
    
    // Fallback to localStorage if MongoDB fails
    try {
      const users = await getUsers();
      const user = users.find(user => user.username === username && user.password === password);
      
      if (!user) {
        return { success: false, message: 'Ungültiger Benutzername oder Passwort' };
      }
      
      // Return user without password
      const { password: _, ...userWithoutPassword } = user;
      
      return { 
        success: true, 
        message: 'Anmeldung erfolgreich', 
        user: userWithoutPassword 
      };
    } catch (localStorageError) {
      console.error('Error authenticating user from localStorage:', localStorageError);
      return { success: false, message: 'Fehler bei der Anmeldung' };
    }
  }
};
