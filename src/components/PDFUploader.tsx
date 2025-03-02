
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface PDFDocument {
  id: string;
  name: string;
  description: string;
  file: string; // Base64 encoded PDF
  createdAt: Date;
}

const PDFUploader = () => {
  const [documents, setDocuments] = useState<PDFDocument[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  // Load documents from localStorage on component mount
  useEffect(() => {
    const storedDocs = localStorage.getItem("pdfDocuments");
    if (storedDocs) {
      setDocuments(JSON.parse(storedDocs));
    }
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    if (file.type !== "application/pdf") {
      toast.error("Bitte laden Sie nur PDF-Dateien hoch");
      return;
    }
    
    if (!name.trim()) {
      toast.error("Bitte geben Sie einen Namen für das Dokument ein");
      return;
    }

    setLoading(true);
    
    try {
      // Convert file to base64
      const base64File = await fileToBase64(file);
      
      // Create new document
      const newDocument: PDFDocument = {
        id: Date.now().toString(),
        name: name,
        description: description,
        file: base64File,
        createdAt: new Date(),
      };
      
      const updatedDocuments = [...documents, newDocument];
      
      // Save to localStorage
      localStorage.setItem("pdfDocuments", JSON.stringify(updatedDocuments));
      setDocuments(updatedDocuments);
      
      // Reset form
      setName("");
      setDescription("");
      e.target.value = "";
      
      toast.success("Dokument erfolgreich hochgeladen");
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Fehler beim Hochladen des Dokuments");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDocument = (id: string) => {
    const updatedDocuments = documents.filter(doc => doc.id !== id);
    localStorage.setItem("pdfDocuments", JSON.stringify(updatedDocuments));
    setDocuments(updatedDocuments);
    toast.success("Dokument erfolgreich gelöscht");
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <h2 className="text-xl font-medium">Neues Dokument hochladen</h2>
        <div className="grid gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">Dokumentname</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="z.B. Sicherheitsrichtlinien"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Beschreibung</Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Kurze Beschreibung des Dokuments"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="file">PDF-Datei auswählen</Label>
            <Input
              id="file"
              type="file"
              accept="application/pdf"
              onChange={handleFileUpload}
              disabled={loading}
              className="cursor-pointer"
            />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-medium">Hochgeladene Dokumente</h2>
        {documents.length === 0 ? (
          <p className="text-muted-foreground italic">Keine Dokumente vorhanden</p>
        ) : (
          <div className="grid gap-4">
            {documents.map((doc) => (
              <div key={doc.id} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <div className="space-y-1">
                  <h3 className="font-medium">{doc.name}</h3>
                  {doc.description && <p className="text-sm text-muted-foreground">{doc.description}</p>}
                  <p className="text-xs text-muted-foreground">
                    Hochgeladen am {new Date(doc.createdAt).toLocaleDateString('de-DE')}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(doc.file, '_blank')}
                  >
                    Anzeigen
                  </Button>
                  <Button 
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDeleteDocument(doc.id)}
                  >
                    Löschen
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PDFUploader;
