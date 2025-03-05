import React, { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { getCompanySettings, updateCompanySettings } from "@/lib/api";
import { CompanySettings } from "@/lib/database/models";
import { isBrowser } from "@/lib/api/config";

const MAX_LOGO_SIZE = 2 * 1024 * 1024; // 2MB in bytes

const CompanySettingsForm = () => {
  const [settings, setSettings] = useState<CompanySettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoInputMethod, setLogoInputMethod] = useState<'upload' | 'base64'>('upload');
  const [base64Input, setBase64Input] = useState('');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const data = await getCompanySettings();
      setSettings(data);
      if (data.logo) {
        setLogoPreview(data.logo);
        setBase64Input(data.logo);
      }
    } catch (error) {
      console.error("Error loading company settings:", error);
      toast.error("Fehler beim Laden der Unternehmenseinstellungen");
    } finally {
      setLoading(false);
    }
  };

  const handleAddressChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (settings) {
      setSettings({
        ...settings,
        address: e.target.value
      });
    }
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error("Bitte wählen Sie eine Bilddatei aus");
      return;
    }

    // Validate file size
    if (file.size > MAX_LOGO_SIZE) {
      toast.error("Die Bilddatei darf maximal 2MB groß sein");
      return;
    }

    // Convert to base64
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      if (settings) {
        setSettings({
          ...settings,
          logo: base64
        });
        setLogoPreview(base64);
        setBase64Input(base64);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleBase64InputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setBase64Input(value);
    
    // Validate if it's a proper base64 image
    if (value.startsWith('data:image/') && value.includes('base64,')) {
      if (settings) {
        setSettings({
          ...settings,
          logo: value
        });
        setLogoPreview(value);
      }
    } else if (value === '') {
      // Clear the logo if input is empty
      if (settings) {
        setSettings({
          ...settings,
          logo: ''
        });
        setLogoPreview(null);
      }
    } else {
      // Invalid input
      toast.error("Ungültiges Base64-Format. Format sollte data:image/png;base64,... oder data:image/jpeg;base64,... sein");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;

    setSaving(true);
    try {
      const result = await updateCompanySettings(settings);
      
      if (result.success) {
        toast.success(result.message || "Unternehmenseinstellungen erfolgreich gespeichert");
        
        // Im Browser-Kontext fügen wir eine zusätzliche Nachricht hinzu
        if (isBrowser) {
          toast.info("Hinweis: Im Browser-Modus werden Änderungen im SessionStorage gespeichert");
        }
        
        await loadSettings(); // Reload settings to get the latest data
      } else {
        toast.error(result.message || "Fehler beim Speichern der Einstellungen");
      }
    } catch (error) {
      console.error("Error saving company settings:", error);
      toast.error("Fehler beim Speichern der Unternehmenseinstellungen");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Einstellungen werden geladen...</div>;
  }

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>Unternehmenseinstellungen</CardTitle>
        <CardDescription>
          Diese Informationen werden auf der generierten PDF angezeigt.
          {isBrowser && (
            <div className="mt-2 text-amber-500">
              Hinweis: Im Browser-Modus werden Änderungen nur simuliert.
            </div>
          )}
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          {/* Firmenanschrift */}
          <div className="space-y-2">
            <Label htmlFor="address">Firmenanschrift</Label>
            <Textarea
              id="address"
              rows={5}
              placeholder="Geben Sie Ihre vollständige Firmenanschrift ein"
              value={settings?.address || ''}
              onChange={handleAddressChange}
            />
            <p className="text-xs text-muted-foreground">
              Verwenden Sie Zeilenumbrüche, um die Adresse zu formatieren.
            </p>
          </div>

          {/* Firmenlogo */}
          <div className="space-y-4">
            <Label>Firmenlogo</Label>
            <Tabs 
              value={logoInputMethod} 
              onValueChange={(value) => setLogoInputMethod(value as 'upload' | 'base64')}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="upload">Datei hochladen</TabsTrigger>
                <TabsTrigger value="base64">Base64 Code eingeben</TabsTrigger>
              </TabsList>
              <TabsContent value="upload" className="space-y-2">
                <Input
                  id="logo"
                  type="file"
                  accept="image/*"
                  onChange={handleLogoChange}
                  className="cursor-pointer"
                />
                <p className="text-xs text-muted-foreground">
                  Wählen Sie eine JPG- oder PNG-Datei (max. 2MB).
                </p>
              </TabsContent>
              <TabsContent value="base64" className="space-y-2">
                <Textarea
                  id="base64Logo"
                  rows={3}
                  placeholder="data:image/png;base64,..."
                  value={base64Input || ''}
                  onChange={handleBase64InputChange}
                />
                <p className="text-xs text-muted-foreground">
                  Geben Sie einen Base64-codierten Bildstring im Format data:image/png;base64,... ein.
                </p>
              </TabsContent>
            </Tabs>
          </div>

          {/* Logo preview */}
          {logoPreview && (
            <div className="mt-4">
              <Label>Vorschau des Logos</Label>
              <div className="mt-2 border rounded-md p-4 bg-muted/10 flex justify-center">
                <img 
                  src={logoPreview} 
                  alt="Firmenlogo" 
                  className="max-w-[250px] h-auto object-contain"
                />
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter>
          <Button type="submit" disabled={saving}>
            {saving ? "Wird gespeichert..." : "Einstellungen speichern"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default CompanySettingsForm;
