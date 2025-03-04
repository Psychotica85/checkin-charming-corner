
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

console.log("🚀 Application starting...");

// Define IS_BROWSER property on window
declare global {
  interface Window {
    IS_BROWSER?: boolean;
  }
}

// Flag setzen, dass wir uns in einer Browser-Umgebung befinden
window.IS_BROWSER = true;
console.log("✅ Browser environment flag set");

// Für Entwicklungszwecke: Lokalen Speicher vorbereiten, wenn er noch nicht existiert
try {
  if (!localStorage.getItem('documents')) {
    localStorage.setItem('documents', JSON.stringify([]));
    console.log("✅ Documents localStorage initialized");
  }

  if (!localStorage.getItem('checkIns')) {
    localStorage.setItem('checkIns', JSON.stringify([]));
    console.log("✅ CheckIns localStorage initialized");
  }
} catch (error) {
  console.error("❌ Error initializing localStorage:", error);
}

// Immediate render to avoid white page
const container = document.getElementById('root');
if (container) {
  console.log("✅ Root element found, rendering application");
  createRoot(container).render(<App />);
} else {
  console.error("❌ Root element not found!");
}
