
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { getCompanySettings } from "@/lib/api";

interface LogoProps {
  className?: string;
}

const Logo = ({ className }: LogoProps) => {
  const [companyLogo, setCompanyLogo] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadCompanyLogo = async () => {
      try {
        setIsLoading(true);
        console.log("Logo-Komponente lädt Unternehmenseinstellungen...");
        const settings = await getCompanySettings();
        console.log("Unternehmenseinstellungen für Logo geladen:", settings);
        if (settings && settings.logo) {
          setCompanyLogo(settings.logo);
        }
      } catch (error) {
        console.error("Failed to load company logo:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadCompanyLogo();
  }, []);

  // Fallback-Logo während des Ladens oder wenn kein Logo verfügbar ist
  return (
    <div className={cn("flex items-center gap-2", className)}>
      {isLoading ? (
        <div className="w-20 h-20 rounded-xl bg-muted animate-pulse"></div>
      ) : companyLogo ? (
        <img 
          src={companyLogo} 
          alt="Company Logo" 
          className="w-20 h-20 object-contain"
        />
      ) : (
        <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-primary/80 to-primary flex items-center justify-center text-white font-bold text-lg shadow-lg">
          CI
        </div>
      )}
      <h1 className="text-xl font-medium">Check-In</h1>
    </div>
  );
};

export default Logo;
