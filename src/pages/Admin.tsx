
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { authenticateUser } from "@/lib/api";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PDFUploader from "@/components/PDFUploader";
import CompanySettingsForm from "@/components/CompanySettingsForm";
import CheckInTable from "@/components/CheckInTable";

const Admin = () => {
  useEffect(() => {
    console.log("Admin page mounted"); // Debug log
  }, []);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if already authenticated
    const storedAuth = localStorage.getItem("isAuthenticated");
    if (storedAuth === "true") {
      setIsAuthenticated(true);
    }
    console.log("Admin auth state:", isAuthenticated); // Debug log
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      console.log("Login attempt with:", username); // Debug log
      
      const result = await authenticateUser(username, password);
      console.log("Login result:", result);
      
      if (result.success) {
        setIsAuthenticated(true);
        localStorage.setItem("isAuthenticated", "true");
        localStorage.setItem("authUser", JSON.stringify(result.user));
        toast.success("Login erfolgreich");
      } else {
        toast.error(result.message || "Ungültige Anmeldedaten");
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Anmeldung fehlgeschlagen");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("authUser");
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="w-full py-4 bg-muted border-b">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-semibold">Admin-Bereich</h1>
            {isAuthenticated ? (
              <Button variant="outline" size="sm" onClick={handleLogout}>
                Abmelden
              </Button>
            ) : (
              <Button variant="outline" size="sm" onClick={() => navigate("/")}>
                Zurück zur Startseite
              </Button>
            )}
          </div>
        </div>
      </header>
      
      <main className="container mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {!isAuthenticated ? (
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle>Admin Login</CardTitle>
            </CardHeader>
            <form onSubmit={handleLogin} className="p-4 space-y-4">
              <div>
                <Label htmlFor="username">Benutzername</Label>
                <Input
                  type="text"
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="password">Passwort</Label>
                <Input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Anmeldung..." : "Anmelden"}
              </Button>
            </form>
          </Card>
        ) : (
          <Tabs defaultValue="check-ins" className="space-y-4">
            <TabsList className="grid w-full grid-cols-1 md:grid-cols-3">
              <TabsTrigger value="check-ins">Check-ins</TabsTrigger>
              <TabsTrigger value="documents">Dokumente</TabsTrigger>
              <TabsTrigger value="settings">Einstellungen</TabsTrigger>
            </TabsList>
            
            <TabsContent value="check-ins" className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Check-ins</h2>
              </div>
              <CheckInTable />
            </TabsContent>
            
            <TabsContent value="documents" className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Dokumente</h2>
              </div>
              <PDFUploader />
            </TabsContent>
            
            <TabsContent value="settings" className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Unternehmenseinstellungen</h2>
              </div>
              <CompanySettingsForm />
            </TabsContent>
          </Tabs>
        )}
      </main>
    </div>
  );
};

export default Admin;
