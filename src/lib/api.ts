// API interface with MongoDB and email functionality
import { formatInTimeZone } from 'date-fns-tz';
import { generateCheckInReport } from './pdfGenerator';

// Environment variables will be injected via process.env in Node.js
const MONGODB_URI = import.meta.env.VITE_MONGODB_URI || 'mongodb://localhost:27017/checkin';
const SMTP_HOST = import.meta.env.VITE_SMTP_HOST || '';
const SMTP_PORT = import.meta.env.VITE_SMTP_PORT || '587';
const SMTP_USER = import.meta.env.VITE_SMTP_USER || '';
const SMTP_PASS = import.meta.env.VITE_SMTP_PASS || '';
const SMTP_FROM = import.meta.env.VITE_SMTP_FROM || '';
const SMTP_TO = import.meta.env.VITE_SMTP_TO || '';

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
    // Create timestamp with Berlin timezone
    const berlinTimestamp = formatInTimeZone(new Date(), 'Europe/Berlin', "yyyy-MM-dd'T'HH:mm:ssXXX");
    
    // Get documents from localStorage (this would come from MongoDB in production)
    const documents = JSON.parse(localStorage.getItem('pdfDocuments') || '[]');
    
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
    
    // In production, you'd upload this to MongoDB or a file storage service
    // For this mock implementation, we'll create an object URL
    const pdfUrl = URL.createObjectURL(pdfBlob);
    
    // Store the check-in data in localStorage (simulating MongoDB)
    const checkIns = JSON.parse(localStorage.getItem('checkIns') || '[]');
    
    // Create a new check-in record with the report URL
    const newCheckIn = {
      ...data,
      id: Date.now().toString(),
      timestamp: berlinTimestamp,
      timezone: 'Europe/Berlin',
      reportUrl: pdfUrl, // In production, this would be the MongoDB file ID or storage URL
    };
    
    checkIns.push(newCheckIn);
    localStorage.setItem('checkIns', JSON.stringify(checkIns));
    
    // In a real implementation, you would:
    // 1. Store the PDF in MongoDB GridFS or a file storage service
    // 2. Send the PDF via email using SMTP
    // 3. Store all data in MongoDB
    
    // For now, we just simulate the successful operation
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
  console.log('Fetching check-ins');
  
  // Simulate API call with a delay
  return new Promise((resolve) => {
    setTimeout(() => {
      const checkIns = JSON.parse(localStorage.getItem('checkIns') || '[]');
      resolve(checkIns);
    }, 500);
  });
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
  // Simulate fetching users from MongoDB
  const users = JSON.parse(localStorage.getItem('users') || '[]');
  
  // If no users exist, create the default admin user
  if (users.length === 0) {
    const defaultAdmin = {
      id: '1',
      username: 'admin',
      password: 'admin', // In production, this would be hashed
      role: 'admin' as const,
      createdAt: new Date().toISOString()
    };
    localStorage.setItem('users', JSON.stringify([defaultAdmin]));
    return [defaultAdmin];
  }
  
  return users;
};

export const createUser = async (userData: Omit<User, 'id' | 'createdAt'>): Promise<{ success: boolean, message: string }> => {
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
  } catch (error) {
    console.error('Error creating user:', error);
    return { success: false, message: 'Fehler beim Erstellen des Benutzers' };
  }
};

export const updateUser = async (id: string, userData: Partial<Omit<User, 'id' | 'createdAt'>>): Promise<{ success: boolean, message: string }> => {
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
  } catch (error) {
    console.error('Error updating user:', error);
    return { success: false, message: 'Fehler beim Aktualisieren des Benutzers' };
  }
};

export const deleteUser = async (id: string): Promise<{ success: boolean, message: string }> => {
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
  } catch (error) {
    console.error('Error deleting user:', error);
    return { success: false, message: 'Fehler beim Löschen des Benutzers' };
  }
};

export const authenticateUser = async (username: string, password: string): Promise<{ success: boolean, message: string, user?: Omit<User, 'password'> }> => {
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
  } catch (error) {
    console.error('Error authenticating user:', error);
    return { success: false, message: 'Fehler bei der Anmeldung' };
  }
};
