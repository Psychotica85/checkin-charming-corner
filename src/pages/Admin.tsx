
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import Logo from "@/components/Logo";
import { Toaster } from "sonner";
import PDFUploader from "@/components/PDFUploader";
import { getCheckIns, getUsers, createUser, updateUser, deleteUser, authenticateUser } from "@/lib/api";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format, parseISO } from "date-fns";
import { de } from "date-fns/locale";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface User {
  id: string;
  username: string;
  password?: string;
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
  
  // User management state
  const [users, setUsers] = useState<User[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [isUserDialogOpen, setIsUserDialogOpen] = useState(false);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    role: "user" as "admin" | "user"  // Fix: explicitly type this as "admin" | "user"
  });
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    // Check if admin is already logged in
    const isAuthenticated = localStorage.getItem("adminAuthenticated") === "true";
    const savedUser = localStorage.getItem("currentUser");
    
    if (isAuthenticated && savedUser) {
      setAuthenticated(true);
      setCurrentUser(JSON.parse(savedUser));
      
      // Load check-ins and users if authenticated
      loadCheckIns();
      loadUsers();
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

  const loadUsers = async () => {
    try {
      setIsLoadingUsers(true);
      const data = await getUsers();
      setUsers(data);
    } catch (error) {
      console.error("Error loading users:", error);
      toast.error("Fehler beim Laden der Benutzer");
    } finally {
      setIsLoadingUsers(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await authenticateUser(username, password);
      
      if (result.success && result.user) {
        localStorage.setItem("adminAuthenticated", "true");
        localStorage.setItem("currentUser", JSON.stringify(result.user));
        setCurrentUser(result.user);
        setAuthenticated(true);
        toast.success("Erfolgreich angemeldet");
        loadCheckIns();
        loadUsers();
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

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd.MM.yyyy HH:mm", { locale: de });
    } catch (error) {
      return dateString;
    }
  };

  const handleOpenUserDialog = (user?: User) => {
    if (user) {
      setSelectedUser(user);
      setFormData({
        username: user.username,
        password: "",
        role: user.role
      });
    } else {
      setSelectedUser(null);
      setFormData({
        username: "",
        password: "",
        role: "user"
      });
    }
    setIsUserDialogOpen(true);
  };

  const handleOpenPasswordDialog = (user: User) => {
    setSelectedUser(user);
    setNewPassword("");
    setConfirmPassword("");
    setIsPasswordDialogOpen(true);
  };

  const handleOpenDeleteDialog = (user: User) => {
    setSelectedUser(user);
    setIsDeleteDialogOpen(true);
  };

  const handleCreateOrUpdateUser = async () => {
    if (!formData.username) {
      toast.error("Benutzername ist erforderlich");
      return;
    }

    if (!selectedUser && !formData.password) {
      toast.error("Passwort ist erforderlich");
      return;
    }

    setLoading(true);
    try {
      let result;
      
      if (selectedUser) {
        // Update existing user
        const updateData: any = {
          username: formData.username,
          role: formData.role
        };
        
        // Only include password if it's provided
        if (formData.password) {
          updateData.password = formData.password;
        }
        
        result = await updateUser(selectedUser.id, updateData);
      } else {
        // Create new user
        result = await createUser(formData);
      }
      
      if (result.success) {
        toast.success(result.message);
        setIsUserDialogOpen(false);
        loadUsers();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error("Error saving user:", error);
      toast.error("Fehler beim Speichern des Benutzers");
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!selectedUser) return;
    
    if (!newPassword) {
      toast.error("Passwort ist erforderlich");
      return;
    }
    
    if (newPassword !== confirmPassword) {
      toast.error("Passwörter stimmen nicht überein");
      return;
    }
    
    setLoading(true);
    try {
      const result = await updateUser(selectedUser.id, { password: newPassword });
      
      if (result.success) {
        toast.success("Passwort erfolgreich geändert");
        setIsPasswordDialogOpen(false);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error("Error changing password:", error);
      toast.error("Fehler beim Ändern des Passworts");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    
    setLoading(true);
    try {
      const result = await deleteUser(selectedUser.id);
      
      if (result.success) {
        toast.success(result.message);
        setIsDeleteDialogOpen(false);
        loadUsers();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error("Fehler beim Löschen des Benutzers");
    } finally {
      setLoading(false);
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
                Verwalten Sie Dokumente, Benutzer und sehen Sie Check-In Daten ein.
              </p>
            </div>

            <Tabs defaultValue="documents" className="w-full">
              <TabsList className="grid w-full max-w-md grid-cols-3">
                <TabsTrigger value="documents">Dokumente</TabsTrigger>
                <TabsTrigger value="check-ins">Check-Ins</TabsTrigger>
                <TabsTrigger value="users">Benutzer</TabsTrigger>
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
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="users" className="mt-6">
                <div className="glass p-6 rounded-xl space-y-6">
                  <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold">Benutzerverwaltung</h2>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => loadUsers()}
                        disabled={isLoadingUsers}
                      >
                        {isLoadingUsers ? "Wird geladen..." : "Aktualisieren"}
                      </Button>
                      <Button 
                        size="sm" 
                        onClick={() => handleOpenUserDialog()}
                      >
                        Neuer Benutzer
                      </Button>
                    </div>
                  </div>
                  
                  {users.length === 0 ? (
                    <div className="p-8 text-center rounded-lg bg-muted/50">
                      <p className="text-muted-foreground">
                        Keine Benutzer vorhanden.
                      </p>
                    </div>
                  ) : (
                    <div className="overflow-auto">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="bg-muted/50 text-left">
                            <th className="p-3 font-medium">Benutzername</th>
                            <th className="p-3 font-medium">Rolle</th>
                            <th className="p-3 font-medium">Erstellt am</th>
                            <th className="p-3 font-medium">Aktionen</th>
                          </tr>
                        </thead>
                        <tbody>
                          {users.map((user) => (
                            <tr key={user.id} className="border-b border-border/50 hover:bg-muted/30">
                              <td className="p-3">{user.username}</td>
                              <td className="p-3">
                                {user.role === 'admin' ? 'Administrator' : 'Benutzer'}
                              </td>
                              <td className="p-3">{formatDate(user.createdAt)}</td>
                              <td className="p-3">
                                <div className="flex gap-2">
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    onClick={() => handleOpenUserDialog(user)}
                                  >
                                    Bearbeiten
                                  </Button>
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => handleOpenPasswordDialog(user)}
                                  >
                                    Passwort
                                  </Button>
                                  <Button 
                                    variant="destructive" 
                                    size="sm"
                                    onClick={() => handleOpenDeleteDialog(user)}
                                    disabled={user.id === currentUser?.id || (user.role === 'admin' && users.filter(u => u.role === 'admin').length <= 1)}
                                  >
                                    Löschen
                                  </Button>
                                </div>
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
        
        {/* User Dialog */}
        <Dialog open={isUserDialogOpen} onOpenChange={setIsUserDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {selectedUser ? "Benutzer bearbeiten" : "Neuen Benutzer erstellen"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="username">Benutzername</Label>
                <Input
                  id="username"
                  value={formData.username}
                  onChange={(e) => setFormData({...formData, username: e.target.value})}
                  placeholder="Benutzername eingeben"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">
                  {selectedUser ? "Passwort (leer lassen, um nicht zu ändern)" : "Passwort"}
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  placeholder="Passwort eingeben"
                  required={!selectedUser}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Rolle</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value: "admin" | "user") => setFormData({ ...formData, role: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Rolle auswählen" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Administrator</SelectItem>
                    <SelectItem value="user">Benutzer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsUserDialogOpen(false)}>
                Abbrechen
              </Button>
              <Button onClick={handleCreateOrUpdateUser} disabled={loading}>
                {loading ? "Wird gespeichert..." : selectedUser ? "Speichern" : "Erstellen"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        {/* Password Dialog */}
        <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Passwort ändern</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="newPassword">Neues Passwort</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Neues Passwort eingeben"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Passwort bestätigen</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Passwort bestätigen"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsPasswordDialogOpen(false)}>
                Abbrechen
              </Button>
              <Button onClick={handleChangePassword} disabled={loading}>
                {loading ? "Wird gespeichert..." : "Passwort ändern"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        {/* Delete Confirmation Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Benutzer löschen</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <p>
                Sind Sie sicher, dass Sie den Benutzer "{selectedUser?.username}" löschen möchten?
                Diese Aktion kann nicht rückgängig gemacht werden.
              </p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                Abbrechen
              </Button>
              <Button variant="destructive" onClick={handleDeleteUser} disabled={loading}>
                {loading ? "Wird gelöscht..." : "Löschen"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
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
