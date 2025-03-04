
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
      {pdfUrl && (
        <div className="h-full overflow-hidden">
          <PDFViewer url={pdfUrl} />
        </div>
      )}
    </DialogContent>
  );
};

export default CheckInPDFDialog;
