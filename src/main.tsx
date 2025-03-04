
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Die MongoDB-Verbindung wird in einer Browser-Umgebung nicht hergestellt
// Wir können ein Flag setzen, dass wir uns in einer Browser-Umgebung befinden
window.IS_BROWSER = true;

// Für Entwicklungszwecke: Lokalen Speicher vorbereiten, wenn er noch nicht existiert
if (!localStorage.getItem('users')) {
  localStorage.setItem('users', JSON.stringify([{
    id: '1',
    username: 'admin',
    password: 'admin',
    role: 'admin',
    createdAt: new Date().toISOString()
  }]));
}

if (!localStorage.getItem('checkIns')) {
  localStorage.setItem('checkIns', JSON.stringify([]));
}

createRoot(document.getElementById("root")!).render(<App />);
