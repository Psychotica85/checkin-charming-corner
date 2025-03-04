
import React from 'react';
import { TableRow, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { CheckIn } from '@/lib/database/models';

interface CheckInTableRowProps {
  checkIn: CheckIn;
  formatDate: (dateString: string) => string;
  formatTime: (timeString: string) => string;
  onViewPDF: (checkIn: CheckIn) => void;
  onDelete: (id: string) => void;
}

const CheckInTableRow = ({ 
  checkIn, 
  formatDate, 
  formatTime, 
  onViewPDF, 
  onDelete 
}: CheckInTableRowProps) => {
  return (
    <TableRow key={checkIn.id}>
      <TableCell className="font-medium">{checkIn.fullName}</TableCell>
      <TableCell>{checkIn.company}</TableCell>
      <TableCell>{formatDate(checkIn.visitDate as string)}</TableCell>
      <TableCell>{formatTime(checkIn.visitTime || '')}</TableCell>
      <TableCell>
        <div className="flex space-x-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => onViewPDF(checkIn)}
              >
                PDF anzeigen
              </Button>
            </DialogTrigger>
          </Dialog>
          <Button 
            variant="destructive" 
            size="sm"
            onClick={() => onDelete(checkIn.id as string)}
          >
            Löschen
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
};

export default CheckInTableRow;
