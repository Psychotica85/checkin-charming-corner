
import { jsPDF } from "jspdf";
import { format } from "date-fns";
import { de } from "date-fns/locale";

interface CheckInData {
  firstName: string;
  lastName: string;
  company: string;
  visitReason: string;
  visitDate: Date;
  visitTime: string;
  acceptedDocuments: string[];
  timestamp: Date;
}

export const generateCheckInReport = async (data: CheckInData, documents: any[]): Promise<Blob> => {
  // Create a new PDF document
  const doc = new jsPDF();
  
  // Add company logo or header
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text("Besucherregistrierung", 105, 20, { align: "center" });
  
  // Add date
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  const dateFormatted = format(new Date(), "PPP", { locale: de });
  doc.text(`Erstellt am: ${dateFormatted}`, 20, 30);
  
  // Add visitor information
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Besucherinformationen", 20, 40);
  
  doc.setFont("helvetica", "normal");
  doc.text(`Name: ${data.firstName} ${data.lastName}`, 20, 50);
  doc.text(`Unternehmen: ${data.company}`, 20, 57);
  doc.text(`Grund des Besuchs: ${data.visitReason}`, 20, 64);
  
  const visitDateFormatted = format(new Date(data.visitDate), "PPP", { locale: de });
  doc.text(`Besuchsdatum: ${visitDateFormatted}`, 20, 71);
  doc.text(`Besuchszeit: ${data.visitTime} Uhr`, 20, 78);
  
  // Add accepted documents
  doc.setFont("helvetica", "bold");
  doc.text("Bestätigte Dokumente", 20, 90);
  
  doc.setFont("helvetica", "normal");
  if (documents.length === 0 || data.acceptedDocuments.length === 0) {
    doc.text("Keine Dokumente wurden bestätigt", 20, 97);
  } else {
    let yPosition = 97;
    
    const acceptedDocs = documents.filter(doc => 
      data.acceptedDocuments.includes(doc.id)
    );
    
    // Fix: Use `doc.text` instead of referring to document objects incorrectly
    acceptedDocs.forEach((document, index) => {
      doc.text(`${index + 1}. ${document.name}`, 20, yPosition);
      yPosition += 7;
    });
  }
  
  // Add signature field
  doc.setFont("helvetica", "bold");
  doc.text("Unterschrift des Besuchers", 20, 160);
  
  doc.setLineWidth(0.5);
  doc.line(20, 170, 100, 170);
  
  // Add timestamp
  doc.setFontSize(8);
  doc.setFont("helvetica", "italic");
  doc.text(`Check-in Zeitstempel: ${format(new Date(data.timestamp), "PPP, HH:mm:ss", { locale: de })}`, 20, 180);
  doc.text("Dieses Dokument wurde elektronisch erstellt und benötigt keine handschriftliche Signatur.", 20, 185);
  
  // Return as blob
  return doc.output('blob');
};
