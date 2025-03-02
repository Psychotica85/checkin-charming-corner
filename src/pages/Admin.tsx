
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import Logo from "@/components/Logo";
import { Toaster } from "sonner";
import PDFUploader from "@/components/PDFUploader";
import { getCheckIns } from "@/lib/api";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format, parseISO } from "date-fns";
import { de } from "date-fns/locale";

const Admin = () => {
  const [authenticated, setAuthenticated] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkIns, setCheckIns] = useState<any[]>([]);
  const [isLoadingCheckIns, setIsLoadingCheckIns] = useState(false);

  useEffect(() => {
    // Check if admin is already logged in
    const isAuthenticated = localStorage.getItem("adminAuthenticated") === "true";
    setAuthenticated(isAuthenticated);
    
    // Load check-ins if authenticated
    if (isAuthenticated) {
      loadCheckIns();
    }
  }, []);

  const loadCheckIns = async () => {
    try {
      setIsLoadingCheckIns(true);
      const data = await getCheckIns();
      setCheckIns(data);
    } catch (error) {
      console.error("Error loading check-ins:", error);
      toast.error("Fehler beim Laden der Check-Ins");
    } finally {
      setIsLoadingCheckIns(false);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simple authentication for demo purposes
    if (username === "admin" && password === "admin") {
      localStorage.setItem("adminAuthenticated", "true");
      setAuthenticated(true);
      toast.success("Erfolgreich angemeldet");
      loadCheckIns();
    } else {
      toast.error("Falsche Anmeldeinformationen");
    }
    
    setLoading(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("adminAuthenticated");
    setAuthenticated(false);
    toast.success("Abgemeldet");
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd.MM.yyyy HH:mm", { locale: de });
    } catch (error) {
      return dateString;
    }
  };

  if (authenticated) {
    return (
      <div className="min-h-screen w-full flex flex-col bg-gradient-to-br from-background to-muted">
        <Toaster position="top-center" />
        
        {/* Header */}
        <header className="w-full py-6 px-4 sm:px-6 glass border-b border-border/50 sticky top-0 z-10">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <Logo />
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">
                Angemeldet als Admin
              </span>
              <Button variant="outline" onClick={handleLogout}>
                Abmelden
              </Button>
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 p-6">
          <div className="max-w-6xl mx-auto space-y-8">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tight">Admin-Bereich</h1>
              <p className="text-muted-foreground">
                Verwalten Sie Dokumente und sehen Sie Check-In Daten ein.
              </p>
            </div>

            <Tabs defaultValue="documents" className="w-full">
              <TabsList className="grid w-full max-w-md grid-cols-2">
                <TabsTrigger value="documents">Dokumente</TabsTrigger>
                <TabsTrigger value="check-ins">Check-Ins</TabsTrigger>
              </TabsList>
              
              <TabsContent value="documents" className="mt-6">
                <div className="glass p-6 rounded-xl space-y-6">
                  <PDFUploader />
                </div>
              </TabsContent>
              
              <TabsContent value="check-ins" className="mt-6">
                <div className="glass p-6 rounded-xl space-y-6">
                  <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold">Besucher Check-Ins</h2>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={loadCheckIns}
                      disabled={isLoadingCheckIns}
                    >
                      {isLoadingCheckIns ? "Wird geladen..." : "Aktualisieren"}
                    </Button>
                  </div>
                  
                  {checkIns.length === 0 ? (
                    <div className="p-8 text-center rounded-lg bg-muted/50">
                      <p className="text-muted-foreground">
                        Keine Check-Ins vorhanden. Sobald Besucher sich anmelden, werden ihre Daten hier angezeigt.
                      </p>
                    </div>
                  ) : (
                    <div className="overflow-auto">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="bg-muted/50 text-left">
                            <th className="p-3 font-medium">Name</th>
                            <th className="p-3 font-medium">Firma</th>
                            <th className="p-3 font-medium">Grund des Besuchs</th>
                            <th className="p-3 font-medium">Datum & Zeit</th>
                            <th className="p-3 font-medium">Erstellungsdatum</th>
                            <th className="p-3 font-medium">Dokumente</th>
                          </tr>
                        </thead>
                        <tbody>
                          {checkIns.map((checkIn, index) => (
                            <tr key={checkIn.id || index} className="border-b border-border/50 hover:bg-muted/30">
                              <td className="p-3">
                                {checkIn.firstName} {checkIn.lastName}
                              </td>
                              <td className="p-3">{checkIn.company}</td>
                              <td className="p-3">{checkIn.visitReason}</td>
                              <td className="p-3">
                                {checkIn.visitDate && format(new Date(checkIn.visitDate), "dd.MM.yyyy", { locale: de })}, {checkIn.visitTime}
                              </td>
                              <td className="p-3">{formatDate(checkIn.timestamp)}</td>
                              <td className="p-3">
                                {checkIn.acceptedDocuments?.length > 0 ? (
                                  <span className="inline-flex items-center gap-1 text-green-600">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                      <path d="M20 6L9 17l-5-5" />
                                    </svg>
                                    {checkIn.acceptedDocuments.length} bestätigt
                                  </span>
                                ) : (
                                  <span className="text-muted-foreground">Keine</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </main>

        {/* Footer */}
        <footer className="w-full py-4 px-6 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Ihr Unternehmen. Alle Rechte vorbehalten.</p>
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <Toaster position="top-center" />
      <div className="w-full max-w-md glass rounded-2xl p-8 space-y-6">
        <div className="flex flex-col items-center space-y-2 text-center">
          <Logo />
          <h1 className="text-2xl font-bold">Admin-Anmeldung</h1>
          <p className="text-muted-foreground">
            Melden Sie sich an, um Dokumente für den Gäste-Check-In zu verwalten.
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">Benutzername</Label>
            <Input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">Passwort</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Anmelden..." : "Anmelden"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Admin;
