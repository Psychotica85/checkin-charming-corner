
import { Button } from "@/components/ui/button";

interface SuccessViewProps {
  firstName: string;
  onReset: () => void;
  reportUrl: string | null;
}

const SuccessView = ({ firstName, onReset, reportUrl }: SuccessViewProps) => {
  return (
    <div className="w-full px-6 py-8 glass rounded-2xl space-y-6 animate-fade-in">
      <div className="text-center space-y-2">
        <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 6L9 17l-5-5" />
          </svg>
        </div>
        <h2 className="text-2xl font-medium">Check-In erfolgreich</h2>
        <p className="text-muted-foreground">Vielen Dank, {firstName}! Sie wurden erfolgreich eingecheckt.</p>
      </div>
      
      {reportUrl && (
        <div className="flex flex-col items-center gap-4">
          <p className="text-sm text-muted-foreground">Ihre Bestätigung wurde erstellt:</p>
          <div className="flex flex-col items-center w-full">
            <a 
              href={reportUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:text-primary/80 flex items-center gap-2 mb-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <polyline points="10 9 9 9 8 9" />
              </svg>
              Bestätigung als PDF öffnen
            </a>
            {/* Drastically increased the height of the PDF preview (3x taller) */}
            <div className="w-full rounded-lg overflow-hidden border shadow-md mt-2">
              <iframe 
                src={reportUrl} 
                className="w-full h-[900px]" 
                title="Check-In Bestätigung"
              />
            </div>
          </div>
        </div>
      )}
      
      <Button onClick={onReset} className="w-full">
        Neuer Check-In
      </Button>
    </div>
  );
};

export default SuccessView;
