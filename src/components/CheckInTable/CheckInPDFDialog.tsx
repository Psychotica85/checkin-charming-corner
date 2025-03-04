
import React from 'react';
import { DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import PDFViewer from '../PDFViewer';
import { CheckIn } from '@/lib/database/models';

interface CheckInPDFDialogProps {
  checkIn: CheckIn | null;
  pdfUrl: string | null;
}

const CheckInPDFDialog = ({ checkIn, pdfUrl }: CheckInPDFDialogProps) => {
  if (!checkIn) return null;
  
  return (
    <DialogContent className="max-w-4xl h-[90vh]">
      <DialogHeader>
        <DialogTitle>PDF-Bericht für {checkIn.fullName}</DialogTitle>
      </DialogHeader>
      <div className="h-full overflow-hidden mt-4">
        {pdfUrl ? (
          <PDFViewer url={pdfUrl} />
        ) : (
          <div className="flex items-center justify-center h-full">
            <p>Lade PDF-Bericht...</p>
          </div>
        )}
      </div>
    </DialogContent>
  );
};

export default CheckInPDFDialog;
