
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Define IS_BROWSER property on window
declare global {
  interface Window {
    IS_BROWSER?: boolean;
  }
}

// Flag setzen, dass wir uns in einer Browser-Umgebung befinden
window.IS_BROWSER = true;

// Für Entwicklungszwecke: Lokalen Speicher vorbereiten, wenn er noch nicht existiert
if (!localStorage.getItem('documents')) {
  localStorage.setItem('documents', JSON.stringify([]));
}

if (!localStorage.getItem('checkIns')) {
  localStorage.setItem('checkIns', JSON.stringify([]));
}

// Immediate render to avoid white page
const container = document.getElementById('root');
if (container) {
  createRoot(container).render(<App />);
} else {
  console.error('Root element not found!');
}
