
import cors from 'cors';
import express from 'express';

// Middleware-Funktionen für den Express-Server
export const setupMiddleware = (app) => {
  // CORS aktivieren
  app.use(cors());

  // JSON-Parser für Anfragen
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  // Logging Middleware
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
  });

  // Error-Handler
  app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Interner Serverfehler',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  });
};
