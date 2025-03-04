
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Setze globales Flag für Browser-Umgebung
if (typeof window !== 'undefined') {
  window.IS_BROWSER = true;
}

// Initialisierung des lokalen Speichers für die Browser-Umgebung
const initializeLocalStorage = () => {
  if (typeof window === 'undefined') return;
  
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
      address: 'Musterfirma GmbH\nMusterstraße 123\n12345 Musterstadt\nDeutschland',
      logo: '',
      updatedAt: new Date().toISOString()
    }));
  }
  
  console.log('LocalStorage wurde initialisiert');
};

// Browser-Umgebung initialisieren
initializeLocalStorage();

// React-App rendern
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
