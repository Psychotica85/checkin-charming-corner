
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { getCompanySettings } from "@/lib/api";

interface LogoProps {
  className?: string;
}

const Logo = ({ className }: LogoProps) => {
  const [companyLogo, setCompanyLogo] = useState<string | null>(null);

  useEffect(() => {
    const loadCompanyLogo = async () => {
      try {
        const settings = await getCompanySettings();
        if (settings && settings.logo) {
          setCompanyLogo(settings.logo);
        }
      } catch (error) {
        console.error("Failed to load company logo:", error);
      }
    };

    loadCompanyLogo();
  }, []);

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {companyLogo ? (
        <img 
          src={companyLogo} 
          alt="Company Logo" 
          className="w-10 h-10 object-contain"
        />
      ) : (
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/80 to-primary flex items-center justify-center text-white font-bold text-lg shadow-lg">
          CI
        </div>
      )}
      <h1 className="text-xl font-medium">Check-In</h1>
    </div>
  );
};

export default Logo;
