
import CheckInForm from "@/components/CheckInForm";
import Logo from "@/components/Logo";
import { Toaster } from "sonner";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="min-h-screen w-full flex flex-col bg-gradient-to-br from-background to-muted">
      <Toaster position="top-center" />
      
      {/* Header */}
      <header className="w-full py-6 px-4 sm:px-6 glass border-b border-border/50 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Logo />
          <div className="flex items-center gap-4">
            <div className="text-sm text-muted-foreground">
              {new Date().toLocaleDateString('de-DE', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </div>
            <Link 
              to="/admin" 
              className="text-sm text-primary hover:text-primary/80 transition-colors"
            >
              Admin-Bereich
            </Link>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="max-w-7xl w-full mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-20 items-center">
          <div className="space-y-6 animate-slide-down">
            <div className="space-y-2">
              <div className="text-sm font-medium text-primary px-3 py-1 bg-primary/10 rounded-full w-fit">
                Willkommen
              </div>
              <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
                Digitaler Gäste Check-In
              </h1>
              <p className="text-lg text-muted-foreground max-w-md">
                Wir freuen uns, Sie in unserem Unternehmen begrüßen zu dürfen. Bitte füllen Sie das Formular aus, um Ihren Besuch zu registrieren.
              </p>
            </div>
            
            <ul className="space-y-3">
              {["Schneller und effizienter Check-In Prozess", 
                "Datenschutzkonforme Besuchererfassung", 
                "Digitale Bestätigung der Dokumente"].map((feature, index) => (
                <li key={index} className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                  </div>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>
          
          <CheckInForm />
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-4 px-6 text-center text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} Ihr Unternehmen. Alle Rechte vorbehalten.</p>
      </footer>
    </div>
  );
};

export default Index;
