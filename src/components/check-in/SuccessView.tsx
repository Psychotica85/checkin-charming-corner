
import { Button } from "@/components/ui/button";

interface SuccessViewProps {
  firstName: string;
  onReset: () => void;
  reportUrl: string | null;
}

const SuccessView = ({ firstName, onReset, reportUrl }: SuccessViewProps) => {
  return (
    <div className="w-full px-6 py-8 glass rounded-2xl space-y-6 animate-fade-in">
      <div className="space-y-4 text-center">
        <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center text-primary mx-auto">
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 6L9 17l-5-5" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold">Check-In erfolgreich!</h2>
        <p className="text-muted-foreground">
          Vielen Dank für Ihren Check-In, {firstName}. Wir wünschen Ihnen einen angenehmen Aufenthalt.
        </p>
      </div>

      {reportUrl && (
        <div className="rounded-lg border border-border overflow-hidden">
          <div className="bg-muted/30 p-4">
            <h3 className="font-medium">Ihre Check-In Bestätigung</h3>
          </div>
          <iframe 
            src={reportUrl} 
            className="w-full h-[900px]" 
            title="Check-In Bestätigung"
          />
          <div className="p-4 bg-muted/10">
            <Button
              onClick={() => window.open(reportUrl, "_blank")}
              variant="outline"
              className="w-full"
            >
              PDF herunterladen
            </Button>
          </div>
        </div>
      )}

      <div className="flex justify-center">
        <Button onClick={onReset} variant="outline">
          Neuer Check-In
        </Button>
      </div>
    </div>
  );
};

export default SuccessView;
