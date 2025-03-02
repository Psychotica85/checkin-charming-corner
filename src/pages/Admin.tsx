
import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import Logo from "@/components/Logo";
import { Toaster } from "sonner";
import PDFUploader from "@/components/PDFUploader";

const Admin = () => {
  const [authenticated, setAuthenticated] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check if admin is already logged in
    const isAuthenticated = localStorage.getItem("adminAuthenticated") === "true";
    setAuthenticated(isAuthenticated);
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simple authentication for demo purposes
    if (username === "admin" && password === "admin") {
      localStorage.setItem("adminAuthenticated", "true");
      setAuthenticated(true);
      toast.success("Erfolgreich angemeldet");
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
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tight">Admin-Bereich</h1>
              <p className="text-muted-foreground">
                Laden Sie PDFs hoch, die Besuchern beim Check-In angezeigt werden.
              </p>
            </div>

            <div className="glass p-6 rounded-xl space-y-6">
              <PDFUploader />
            </div>
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
