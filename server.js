
import express from 'express';
import { PORT } from './src/server/config.js';
import { setupMiddleware } from './src/server/middleware.js';
import routes from './src/server/routes.js';
import { initializeServer, logServerInfo } from './src/server/startup.js';

// Erstelle Express-App
const app = express();

// Middleware einrichten
setupMiddleware(app);

// Routen einrichten
app.use(routes);

// Starte den Server nach Initialisierung der Datenbank
const startServer = async () => {
  console.log("Starte Besucher Check-In System...");
  
  const initialized = await initializeServer();
  
  if (!initialized) {
    console.error("Server konnte nicht initialisiert werden, Anwendung wird beendet.");
    process.exit(1);
  }
  
  // Starte den Express-Server
  app.listen(PORT, () => {
    logServerInfo();
  });
};

// Starte den Server
startServer();
