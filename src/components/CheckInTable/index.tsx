
import React, { useState, useEffect } from 'react';
import { Table, TableHeader, TableRow, TableHead, TableBody } from "@/components/ui/table";
import { Dialog } from "@/components/ui/dialog";
import { toast } from "sonner";
import { getCheckIns, deleteCheckIn, generatePdfReport } from '@/lib/api';
import { CheckIn } from '@/lib/database/models';
import FilterBar from './FilterBar';
import CheckInTableRow from './CheckInTableRow';
import CheckInPDFDialog from './CheckInPDFDialog';
import { formatDate, formatTime, filterCheckIns } from './utils';

const CheckInTable = () => {
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
  const [loading, setLoading] = useState(true);
  const [nameFilter, setNameFilter] = useState('');
  const [companyFilter, setCompanyFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [timeFilter, setTimeFilter] = useState('');
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [selectedCheckIn, setSelectedCheckIn] = useState<CheckIn | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    loadCheckIns();
  }, []);

  const loadCheckIns = async () => {
    try {
      setLoading(true);
      const data = await getCheckIns();
      setCheckIns(data);
    } catch (error) {
      console.error("Error loading check-ins:", error);
      toast.error("Fehler beim Laden der Check-ins");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Sind Sie sicher, dass Sie diesen Check-in löschen möchten?")) {
      return;
    }

    try {
      const result = await deleteCheckIn(id);
      if (result.success) {
        setCheckIns(checkIns.filter(item => item.id !== id));
        toast.success("Check-in erfolgreich gelöscht");
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error("Error deleting check-in:", error);
      toast.error("Fehler beim Löschen des Check-ins");
    }
  };

  const handleGeneratePDF = async (id: string) => {
    try {
      setPdfUrl(null); // Reset pdfUrl to show loading indicator
      const result = await generatePdfReport(id);
      if (result.success && result.pdfUrl) {
        console.log("PDF URL received:", result.pdfUrl);
        setPdfUrl(result.pdfUrl);
        toast.success("PDF-Bericht wurde erstellt");
      } else {
        console.error("Error generating PDF:", result.message);
        toast.error(result.message || "Fehler beim Erstellen des PDF-Berichts");
      }
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error("Fehler beim Erstellen des PDF-Berichts");
    }
  };

  const handleViewPDF = (checkIn: CheckIn) => {
    console.log("Viewing PDF for check-in:", checkIn);
    setSelectedCheckIn(checkIn);
    setDialogOpen(true);
    
    // Use timeout to ensure dialog is open before loading PDF
    setTimeout(() => {
      if (checkIn.id) {
        handleGeneratePDF(checkIn.id as string);
      }
    }, 100);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setTimeout(() => {
      setSelectedCheckIn(null);
      setPdfUrl(null);
    }, 300); // Delay clearing data until after animation completes
  };

  const filteredCheckIns = filterCheckIns(
    checkIns, nameFilter, companyFilter, dateFilter, timeFilter
  );

  return (
    <div className="space-y-4">
      <FilterBar
        nameFilter={nameFilter}
        setNameFilter={setNameFilter}
        companyFilter={companyFilter}
        setCompanyFilter={setCompanyFilter}
        dateFilter={dateFilter}
        setDateFilter={setDateFilter}
        timeFilter={timeFilter}
        setTimeFilter={setTimeFilter}
      />

      {loading ? (
        <div className="text-center py-8">Daten werden geladen...</div>
      ) : checkIns.length === 0 ? (
        <div className="text-center py-8">Keine Check-ins vorhanden.</div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Besucher</TableHead>
                <TableHead>Firma</TableHead>
                <TableHead>Datum</TableHead>
                <TableHead>Uhrzeit</TableHead>
                <TableHead>Aktionen</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCheckIns.map((checkIn) => (
                <CheckInTableRow
                  key={checkIn.id}
                  checkIn={checkIn}
                  formatDate={formatDate}
                  formatTime={formatTime}
                  onViewPDF={handleViewPDF}
                  onDelete={handleDelete}
                />
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog 
        open={dialogOpen} 
        onOpenChange={(open) => {
          if (!open) handleDialogClose();
          setDialogOpen(open);
        }}
      >
        <CheckInPDFDialog 
          checkIn={selectedCheckIn} 
          pdfUrl={pdfUrl} 
        />
      </Dialog>
    </div>
  );
};

export default CheckInTable;
