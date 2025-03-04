
import mongoose from 'mongoose';

// Mongo-Verbindungs-URI
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/checkin';

// Verbindungszustand
let isConnected = false;

/**
 * Verbindet zur MongoDB-Datenbank
 */
export const connectToDatabase = async (): Promise<void> => {
  // Browser-Erkennung
  const isBrowser = typeof window !== 'undefined';
  
  if (isBrowser) {
    console.log('Browser-Umgebung erkannt, verwende localStorage...');
    return Promise.resolve();
  }
  
  try {
    // Mit MongoDB verbinden, falls noch nicht verbunden
    if (!isConnected) {
      const options = {
        serverSelectionTimeoutMS: 5000, // Timeout nach 5 Sekunden
        socketTimeoutMS: 45000, // Abbruch nach 45 Sekunden Inaktivität
        family: 4 // IPv4
      };
      
      await mongoose.connect(MONGODB_URI, options);
      isConnected = true;
      console.log('MongoDB erfolgreich verbunden');
    }
  } catch (error) {
    console.error('Fehler bei der MongoDB-Verbindung:', error);
    throw new Error('Konnte keine Verbindung zur MongoDB herstellen.');
  }
};

/**
 * Trennt die MongoDB-Verbindung
 */
export const disconnectFromDatabase = async (): Promise<void> => {
  // Browser-Erkennung
  const isBrowser = typeof window !== 'undefined';
  
  if (isBrowser) {
    return Promise.resolve();
  }
  
  try {
    await mongoose.disconnect();
    isConnected = false;
    console.log('MongoDB-Verbindung getrennt');
  } catch (error) {
    console.error('Fehler beim Trennen der MongoDB-Verbindung:', error);
  }
};
