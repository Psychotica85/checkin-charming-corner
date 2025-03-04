
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  authenticateUser,
  ADMIN_USERNAME,
  ADMIN_PASSWORD,
} from "@/lib/api";
import { User } from "@/lib/database/models";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PDFUploader from "@/components/PDFUploader";
import CompanySettingsForm from "@/components/CompanySettingsForm";
import CheckInTable from "@/components/CheckInTable";

const Admin = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [editUserId, setEditUserId] = useState<string | null>(null);
  const [editUsername, setEditUsername] = useState("");
  const [editPassword, setEditPassword] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    // Check if already authenticated
    const storedAuth = localStorage.getItem("isAuthenticated");
    if (storedAuth === "true") {
      setIsAuthenticated(true);
      fetchUsers();
    }
  }, []);

  const fetchUsers = async () => {
    try {
      const usersData = await getUsers();
      setUsers(usersData);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to fetch users");
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const success = await authenticateUser(username, password);
      if (success) {
        setIsAuthenticated(true);
        localStorage.setItem("isAuthenticated", "true");
        fetchUsers();
        toast.success("Login successful");
      } else {
        toast.error("Invalid credentials");
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Login failed");
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem("isAuthenticated");
    setUsers([]);
    navigate("/");
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const newUser = {
        username: newUsername,
        password: newPassword,
        role: "user" as "admin" | "user", // Fix: Explicitly cast to the correct type
      };
      const success = await createUser(newUser);
      if (success) {
        fetchUsers();
        setNewUsername("");
        setNewPassword("");
        toast.success("User created successfully");
      } else {
        toast.error("Failed to create user");
      }
    } catch (error) {
      console.error("Error creating user:", error);
      toast.error("Failed to create user");
    }
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editUserId) return;
    try {
      const updatedUser = {
        username: editUsername,
        password: editPassword,
        role: "user" as "admin" | "user", // Fix: Explicitly cast to the correct type
      };
      const success = await updateUser(editUserId, updatedUser); // Fix: Pass id and userData separately
      if (success) {
        fetchUsers();
        setEditUserId(null);
        setEditUsername("");
        setEditPassword("");
        toast.success("User updated successfully");
      } else {
        toast.error("Failed to update user");
      }
    } catch (error) {
      console.error("Error updating user:", error);
      toast.error("Failed to update user");
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        const success = await deleteUser(id);
        if (success) {
          fetchUsers();
          toast.success("User deleted successfully");
        } else {
          toast.error("Failed to delete user");
        }
      } catch (error) {
        console.error("Error deleting user:", error);
        toast.error("Failed to delete user");
      }
    }
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
            ) : null}
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
              <Button type="submit">Anmelden</Button>
            </form>
          </Card>
        ) : (
          <Tabs defaultValue="check-ins" className="space-y-4">
            <TabsList className="grid w-full grid-cols-1 md:grid-cols-4">
              <TabsTrigger value="check-ins">Check-ins</TabsTrigger>
              <TabsTrigger value="documents">Dokumente</TabsTrigger>
              <TabsTrigger value="users">Benutzer</TabsTrigger>
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
            
            <TabsContent value="users" className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Benutzer verwalten</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Create User Form */}
                <Card>
                  <CardHeader>
                    <CardTitle>Benutzer erstellen</CardTitle>
                  </CardHeader>
                  <form onSubmit={handleCreateUser} className="p-4 space-y-4">
                    <div>
                      <Label htmlFor="newUsername">Benutzername</Label>
                      <Input
                        type="text"
                        id="newUsername"
                        value={newUsername}
                        onChange={(e) => setNewUsername(e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="newPassword">Passwort</Label>
                      <Input
                        type="password"
                        id="newPassword"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                      />
                    </div>
                    <Button type="submit">Benutzer erstellen</Button>
                  </form>
                </Card>
                
                {/* User List */}
                <Card>
                  <CardHeader>
                    <CardTitle>Benutzerliste</CardTitle>
                  </CardHeader>
                  <div className="p-4">
                    {users.map((user) => (
                      <div key={user.id} className="py-2 border-b last:border-b-0">
                        <div className="flex items-center justify-between">
                          <div>{user.username}</div>
                          <div>
                            {editUserId === user.id ? (
                              <form onSubmit={handleUpdateUser} className="flex items-center space-x-2">
                                <Input
                                  type="text"
                                  value={editUsername}
                                  onChange={(e) => setEditUsername(e.target.value)}
                                  placeholder="Benutzername"
                                  className="w-24"
                                />
                                <Input
                                  type="password"
                                  value={editPassword}
                                  onChange={(e) => setEditPassword(e.target.value)}
                                  placeholder="Passwort"
                                  className="w-24"
                                />
                                <Button type="submit" size="sm">
                                  Speichern
                                </Button>
                              </form>
                            ) : (
                              <div className="flex space-x-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setEditUserId(user.id);
                                    setEditUsername(user.username);
                                    setEditPassword("");
                                  }}
                                >
                                  Bearbeiten
                                </Button>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => handleDeleteUser(user.id)}
                                >
                                  Löschen
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
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
