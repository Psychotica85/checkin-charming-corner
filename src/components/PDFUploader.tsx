
import React, { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { saveDocument, deleteDocument, getDocuments } from "@/lib/api";
import { toast } from "sonner";
import { PDFDocument } from "@/lib/database/models";

const PDFUploader = () => {
  const [documents, setDocuments] = useState<PDFDocument[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Load existing documents
  useEffect(() => {
    const loadDocuments = async () => {
      try {
        const docs = await getDocuments();
        setDocuments(docs);
      } catch (error) {
        console.error("Error loading documents:", error);
        toast.error("Fehler beim Laden der Dokumente");
      }
    };
    
    loadDocuments();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedFile) {
      toast.error("Bitte wählen Sie eine PDF-Datei aus");
      return;
    }

    if (!formData.name) {
      toast.error("Bitte geben Sie einen Namen für das Dokument ein");
      return;
    }

    setIsUploading(true);

    try {
      // Convert file to base64
      const base64 = await fileToBase64(selectedFile);
      
      // Create document
      const newDocument: PDFDocument = {
        id: Date.now().toString(), // This will be replaced by MongoDB's _id
        name: formData.name,
        description: formData.description,
        file: base64,
        createdAt: new Date().toISOString(), // Store as string for consistency
      };
      
      // Save to MongoDB via API
      const success = await saveDocument(newDocument);
      
      if (success) {
        // Refresh documents list
        const updatedDocs = await getDocuments();
        setDocuments(updatedDocs);
        
        // Reset form
        setFormData({ name: "", description: "" });
        setSelectedFile(null);
        
        // Show success toast
        toast.success("Dokument erfolgreich hochgeladen");
      } else {
        toast.error("Fehler beim Speichern des Dokuments");
      }
    } catch (error) {
      console.error("Error uploading document:", error);
      toast.error("Fehler beim Hochladen des Dokuments");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Sind Sie sicher, dass Sie dieses Dokument löschen möchten?")) {
      return;
    }
    
    setIsDeleting(true);
    
    try {
      await deleteDocument(id);
      
      // Refresh documents list
      const updatedDocs = await getDocuments();
      setDocuments(updatedDocs);
      
      toast.success("Dokument erfolgreich gelöscht");
    } catch (error) {
      console.error("Error deleting document:", error);
      toast.error("Fehler beim Löschen des Dokuments");
    } finally {
      setIsDeleting(false);
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  // Function to create blob URL from base64 for PDF viewing
  const createBlobUrl = (base64Data: string): string => {
    try {
      // Handle the case when base64Data might already be a blob URL
      if (base64Data.startsWith('blob:')) {
        return base64Data;
      }
      
      // Extract base64 part from data URL
      const base64Content = base64Data.split(',')[1];
      const mimeType = base64Data.split(',')[0].split(':')[1].split(';')[0];
      
      // Convert base64 to binary
      const binaryString = atob(base64Content);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      
      // Create blob and return URL
      const blob = new Blob([bytes.buffer], { type: mimeType });
      return URL.createObjectURL(blob);
    } catch (error) {
      console.error('Error creating blob URL:', error);
      return '';
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold mb-2">Dokumente hochladen</h2>
        <p className="text-muted-foreground">
          Laden Sie Dokumente hoch, die von Besuchern gelesen und akzeptiert werden müssen.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="name">Dokumentname</Label>
          <Input
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="z.B. Besucherregeln"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Beschreibung</Label>
          <Textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="Kurze Beschreibung des Dokuments"
            className="resize-none"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="pdf">PDF-Datei</Label>
          <Input
            id="pdf"
            type="file"
            accept="application/pdf"
            onChange={handleFileChange}
            className="cursor-pointer"
            required
          />
        </div>

        <Button type="submit" disabled={isUploading}>
          {isUploading ? "Wird hochgeladen..." : "Dokument hochladen"}
        </Button>
      </form>

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Hochgeladene Dokumente</h3>
        
        {documents.length === 0 ? (
          <p className="text-muted-foreground">Keine Dokumente vorhanden.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {documents.map((doc) => (
              <Card key={doc.id}>
                <CardHeader>
                  <CardTitle className="text-base">{doc.name}</CardTitle>
                  <CardDescription className="text-sm line-clamp-2">
                    {doc.description || "Keine Beschreibung"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">
                    Hochgeladen am:{" "}
                    {new Date(doc.createdAt).toLocaleDateString("de-DE", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    })}
                  </p>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(createBlobUrl(doc.file), "_blank")}
                  >
                    Anzeigen
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(doc.id)}
                    disabled={isDeleting}
                  >
                    Löschen
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PDFUploader;
