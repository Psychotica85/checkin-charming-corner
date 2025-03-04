
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Für Entwicklungszwecke: Lokalen Speicher vorbereiten, wenn er noch nicht existiert
if (typeof window !== 'undefined') {
  // Flag setzen, dass wir uns in einer Browser-Umgebung befinden
  window.IS_BROWSER = true;
  
  if (!localStorage.getItem('users')) {
    localStorage.setItem('users', JSON.stringify([{
      id: '1',
      username: 'admin',
      password: 'admin',
      role: 'admin',
      createdAt: new Date().toISOString()
    }]));
  }

  if (!localStorage.getItem('documents')) {
    localStorage.setItem('documents', JSON.stringify([]));
  }

  if (!localStorage.getItem('checkIns')) {
    localStorage.setItem('checkIns', JSON.stringify([]));
  }
}

createRoot(document.getElementById("root")!).render(<App />);
