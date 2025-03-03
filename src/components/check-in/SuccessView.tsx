
interface SuccessViewProps {
  firstName: string;
  onReset: () => void;
}

import { Button } from "@/components/ui/button";

const SuccessView = ({ firstName, onReset }: SuccessViewProps) => {
  return (
    <div className="w-full max-w-md mx-auto px-6 py-8 glass rounded-2xl space-y-6 animate-fade-in">
      <div className="text-center space-y-2">
        <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 6L9 17l-5-5" />
          </svg>
        </div>
        <h2 className="text-2xl font-medium">Check-In erfolgreich</h2>
        <p className="text-muted-foreground">Vielen Dank, {firstName}! Sie wurden erfolgreich eingecheckt.</p>
      </div>
      <Button onClick={onReset} className="w-full">
        Neuer Check-In
      </Button>
    </div>
  );
};

export default SuccessView;
