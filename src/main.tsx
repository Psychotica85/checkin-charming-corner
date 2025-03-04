
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Überprüfe, ob das Root-Element existiert
const rootElement = document.getElementById('root');

if (!rootElement) {
  console.error('Root-Element nicht gefunden!');
} else {
  // Rendern der App in das Root-Element
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
}
