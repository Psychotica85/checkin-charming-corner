
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Setze globales Flag für Browser-Umgebung
window.IS_BROWSER = true;

// Initialisierung des lokalen Speichers für die Browser-Umgebung
const initializeLocalStorage = () => {
  // Check-ins initialisieren
  if (!localStorage.getItem('checkIns')) {
    localStorage.setItem('checkIns', JSON.stringify([]));
  }
  
  // Dokumente initialisieren
  if (!localStorage.getItem('pdfDocuments')) {
    localStorage.setItem('pdfDocuments', JSON.stringify([]));
  }
  
  // Unternehmenseinstellungen initialisieren
  if (!localStorage.getItem('companySettings')) {
    localStorage.setItem('companySettings', JSON.stringify({
      id: '1',
      companyName: 'Beispielfirma GmbH',
      address: 'Musterstraße 123, 12345 Berlin',
      contactEmail: 'info@beispielfirma.de',
      contactPhone: '+49 123 4567890',
      updatedAt: new Date().toISOString()
    }));
  }
  
  console.log('LocalStorage wurde initialisiert');
};

// Browser-Umgebung initialisieren
initializeLocalStorage();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
