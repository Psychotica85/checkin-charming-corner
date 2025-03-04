
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import Logo from "@/components/Logo";
import { Toaster } from "sonner";
import PDFUploader from "@/components/PDFUploader";
import { getCheckIns, deleteCheckIn, authenticateUser } from "@/lib/api";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { Link } from "react-router-dom";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// Vereinfachte User-Schnittstelle für die Admin-Komponente
interface User {
  id: string;
  username: string;
  role: "admin" | "user";
  createdAt: string;
}

const Admin = () => {
  const [authenticated, setAuthenticated] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkIns, setCheckIns] = useState<any[]>([]);
  const [isLoadingCheckIns, setIsLoadingCheckIns] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [deletingCheckIn, setDeletingCheckIn] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  useEffect(() => {
    // Check if admin is already logged in
    const isAuthenticated = localStorage.getItem("adminAuthenticated") === "true";
    const savedUser = localStorage.getItem("currentUser");
    
    if (isAuthenticated && savedUser) {
      setAuthenticated(true);
      setCurrentUser(JSON.parse(savedUser));
      
      // Load check-ins
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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log("Versuche Anmeldung mit:", username, password);
      const result = await authenticateUser(username, password);
      console.log("Authentifizierungsergebnis:", result);
      
      if (result.success && result.user) {
        localStorage.setItem("adminAuthenticated", "true");
        localStorage.setItem("currentUser", JSON.stringify(result.user));
        setCurrentUser(result.user as User);
        setAuthenticated(true);
        toast.success("Erfolgreich angemeldet");
        loadCheckIns();
      } else {
        toast.error(result.message || "Falsche Anmeldeinformationen");
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Fehler bei der Anmeldung");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("adminAuthenticated");
    localStorage.removeItem("currentUser");
    setAuthenticated(false);
    setCurrentUser(null);
    toast.success("Abgemeldet");
  };

  const openDeleteDialog = (id: string) => {
    setDeletingCheckIn(id);
    setShowDeleteDialog(true);
  };

  const closeDeleteDialog = () => {
    setShowDeleteDialog(false);
    setDeletingCheckIn(null);
  };

  const confirmDelete = async () => {
    if (!deletingCheckIn) return;
    
    try {
      const result = await deleteCheckIn(deletingCheckIn);
      if (result.success) {
        toast.success(result.message);
        loadCheckIns(); // Neu laden nach dem Löschen
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error("Error deleting check-in:", error);
      toast.error("Fehler beim Löschen des Check-Ins");
    } finally {
      closeDeleteDialog();
    }
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
        <header className="w-full py-6 px-4 sm:px-6 glass border-b border-border/50 sticky top-0 z-10 bg-background/95 backdrop-blur">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <Logo />
            <div className="flex items-center gap-4">
              <Button variant="outline" asChild>
                <Link to="/">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                    <polyline points="9 22 9 12 15 12 15 22"/>
                  </svg>
                  Zur Startseite
                </Link>
              </Button>
              <span className="text-sm text-muted-foreground">
                Angemeldet als {currentUser?.username || 'Admin'}
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
                            <th className="p-3 font-medium">PDF</th>
                            <th className="p-3 font-medium">Aktionen</th>
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
                              <td className="p-3">
                                {checkIn.reportUrl ? (
                                  <a 
                                    href={checkIn.reportUrl} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-primary hover:text-primary/80 flex items-center gap-1"
                                  >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                      <polyline points="14 2 14 8 20 8" />
                                      <line x1="16" y1="13" x2="8" y2="13" />
                                      <line x1="16" y1="17" x2="8" y2="17" />
                                      <polyline points="10 9 9 9 8 9" />
                                    </svg>
                                    PDF
                                  </a>
                                ) : (
                                  <span className="text-muted-foreground">N/A</span>
                                )}
                              </td>
                              <td className="p-3">
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => openDeleteDialog(checkIn.id)}
                                  className="text-destructive hover:bg-destructive/10"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M3 6h18"></path>
                                    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                                    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                                    <line x1="10" y1="11" x2="10" y2="17"></line>
                                    <line x1="14" y1="11" x2="14" y2="17"></line>
                                  </svg>
                                  <span className="sr-only">Löschen</span>
                                </Button>
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

        {/* Lösch-Bestätigungsdialog */}
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Check-In löschen</AlertDialogTitle>
              <AlertDialogDescription>
                Sind Sie sicher, dass Sie diesen Check-In löschen möchten? 
                Diese Aktion kann nicht rückgängig gemacht werden.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={closeDeleteDialog}>
                Abbrechen
              </AlertDialogCancel>
              <AlertDialogAction 
                onClick={confirmDelete}
                className="bg-destructive hover:bg-destructive/90"
              >
                Löschen
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
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
