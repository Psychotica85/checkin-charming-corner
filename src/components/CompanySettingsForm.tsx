
import React, { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { toast } from "sonner";
import { getCompanySettings, updateCompanySettings } from "@/lib/api";
import { CompanySettings } from "@/lib/database/models";

const MAX_LOGO_SIZE = 2 * 1024 * 1024; // 2MB in bytes

const CompanySettingsForm = () => {
  const [settings, setSettings] = useState<CompanySettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

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
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;

    setSaving(true);
    try {
      const result = await updateCompanySettings(settings);
      if (result.success) {
        toast.success("Unternehmenseinstellungen erfolgreich gespeichert");
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
          <div className="space-y-2">
            <Label htmlFor="logo">Firmenlogo (max. 2MB)</Label>
            <Input
              id="logo"
              type="file"
              accept="image/*"
              onChange={handleLogoChange}
              className="cursor-pointer"
            />
            <p className="text-xs text-muted-foreground">
              Das Logo wird auf der rechten Seite des PDFs angezeigt (max. Breite 250px).
            </p>
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
