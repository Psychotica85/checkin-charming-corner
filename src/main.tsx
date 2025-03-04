
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Starten der Anwendung vereinfachen
const rootElement = document.getElementById('root');
if (!rootElement) {
  console.error('Root-Element nicht gefunden!');
} else {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
  console.log('Anwendung erfolgreich gestartet');
}
