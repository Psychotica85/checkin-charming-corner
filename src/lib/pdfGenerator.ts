
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

export const generateCheckInReport = async (data: CheckInData, documents: any[], companySettings: any = null): Promise<Blob> => {
  // Create a new PDF document
  const doc = new jsPDF();
  
  // Set initial Y position for content
  let yPosition = 20;
  
  // Add company address if available
  if (companySettings && companySettings.address) {
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    
    // Split address by newlines and render each line
    const addressLines = companySettings.address.split('\n');
    addressLines.forEach(line => {
      doc.text(line, 20, yPosition);
      yPosition += 5;
    });
    
    yPosition += 5; // Add some spacing
  }
  
  // Add company logo if available
  if (companySettings && companySettings.logo) {
    try {
      const logoImg = companySettings.logo;
      const maxWidth = 250;
      
      // Calculate image dimensions while maintaining aspect ratio
      let imgWidth = 0;
      let imgHeight = 0;
      
      // Create temporary image to get dimensions
      const img = new Image();
      img.src = logoImg;
      
      if (img.width > 0 && img.height > 0) {
        // Calculate dimensions maintaining aspect ratio
        if (img.width > maxWidth) {
          imgWidth = maxWidth;
          imgHeight = (img.height * maxWidth) / img.width;
        } else {
          imgWidth = img.width;
          imgHeight = img.height;
        }
        
        // Position the logo on the right side
        doc.addImage(logoImg, 'JPEG', doc.internal.pageSize.getWidth() - imgWidth - 20, 20, imgWidth, imgHeight);
      }
    } catch (error) {
      console.error("Error adding logo to PDF:", error);
    }
  }
  
  // Reset Y position if neither logo nor address were added
  if (!companySettings || (!companySettings.address && !companySettings.logo)) {
    yPosition = 20;
  } else {
    yPosition += 10; // Add spacing after logo/address
  }
  
  // Add title
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text("Besucherregistrierung", 105, yPosition, { align: "center" });
  yPosition += 10;
  
  // Add date
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  const dateFormatted = format(new Date(), "PPP", { locale: de });
  doc.text(`Erstellt am: ${dateFormatted}`, 20, yPosition);
  yPosition += 10;
  
  // Add visitor information
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Besucherinformationen", 20, yPosition);
  yPosition += 10;
  
  doc.setFont("helvetica", "normal");
  doc.text(`Name: ${data.firstName} ${data.lastName}`, 20, yPosition);
  yPosition += 7;
  doc.text(`Unternehmen: ${data.company}`, 20, yPosition);
  yPosition += 7;
  doc.text(`Grund des Besuchs: ${data.visitReason}`, 20, yPosition);
  yPosition += 7;
  
  const visitDateFormatted = format(new Date(data.visitDate), "PPP", { locale: de });
  doc.text(`Besuchsdatum: ${visitDateFormatted}`, 20, yPosition);
  yPosition += 7;
  doc.text(`Ankunftszeit: ${data.visitTime} Uhr`, 20, yPosition);
  yPosition += 12;
  
  // Add accepted documents with the new title
  doc.setFont("helvetica", "bold");
  doc.text("Ich habe die folgenden Dokumente vollständig gelesen und verstanden", 20, yPosition);
  yPosition += 7;
  
  doc.setFont("helvetica", "normal");
  if (documents.length === 0 || data.acceptedDocuments.length === 0) {
    doc.text("Keine Dokumente wurden bestätigt", 20, yPosition);
    yPosition += 7;
  } else {
    const acceptedDocs = documents.filter(doc => 
      data.acceptedDocuments.includes(doc.id)
    );
    
    acceptedDocs.forEach((document, index) => {
      doc.text(`${index + 1}. ${document.name}`, 20, yPosition);
      yPosition += 7;
    });
  }
  
  // Add signature field
  yPosition = Math.max(yPosition, 160); // Ensure minimum position for signature
  doc.setFont("helvetica", "bold");
  doc.text("Unterschrift des Besuchers", 20, yPosition);
  
  doc.setLineWidth(0.5);
  doc.line(20, yPosition + 10, 100, yPosition + 10);
  
  // Add timestamp
  doc.setFontSize(8);
  doc.setFont("helvetica", "italic");
  doc.text(`Check-in Zeitstempel: ${format(new Date(data.timestamp), "PPP, HH:mm:ss", { locale: de })}`, 20, yPosition + 20);
  doc.text("Dieses Dokument wurde elektronisch erstellt und benötigt keine handschriftliche Signatur.", 20, yPosition + 25);
  
  // Return as blob
  return doc.output('blob');
};
