
import React, { useState, useEffect } from 'react';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { getCheckIns, deleteCheckIn, generatePdfReport } from '@/lib/api';
import PDFViewer from './PDFViewer';
import { CheckIn } from '@/lib/database/models';

const CheckInTable = () => {
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
  const [loading, setLoading] = useState(true);
  const [nameFilter, setNameFilter] = useState('');
  const [companyFilter, setCompanyFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [timeFilter, setTimeFilter] = useState('');
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [selectedCheckIn, setSelectedCheckIn] = useState<CheckIn | null>(null);

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
      const result = await generatePdfReport(id);
      if (result.success) {
        setPdfUrl(result.pdfUrl);
        toast.success("PDF-Bericht wurde erstellt");
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error("Fehler beim Erstellen des PDF-Berichts");
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('de-DE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch (e) {
      return 'Ungültiges Datum';
    }
  };

  const formatTime = (timeString: string) => {
    return timeString || 'Keine Zeit';
  };

  const filteredCheckIns = checkIns.filter(checkIn => {
    // Name Filter (mindestens 3 Zeichen)
    const nameMatches = nameFilter.length < 3 || 
      checkIn.fullName.toLowerCase().includes(nameFilter.toLowerCase());
    
    // Firma Filter (mindestens 3 Zeichen)
    const companyMatches = companyFilter.length < 3 || 
      checkIn.company.toLowerCase().includes(companyFilter.toLowerCase());
    
    // Datum Filter
    const dateMatches = !dateFilter || 
      (checkIn.visitDate && typeof checkIn.visitDate === 'string' && 
       checkIn.visitDate.includes(dateFilter));
    
    // Zeit Filter
    const timeMatches = !timeFilter || 
      (checkIn.visitTime && checkIn.visitTime.includes(timeFilter));
    
    return nameMatches && companyMatches && dateMatches && timeMatches;
  });

  const handleViewPDF = (checkIn: CheckIn) => {
    setSelectedCheckIn(checkIn);
    handleGeneratePDF(checkIn.id as string);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <Label htmlFor="nameFilter">Besucher</Label>
          <Input
            id="nameFilter"
            placeholder="Filtern nach Name"
            value={nameFilter}
            onChange={(e) => setNameFilter(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="companyFilter">Firma</Label>
          <Input
            id="companyFilter"
            placeholder="Filtern nach Firma"
            value={companyFilter}
            onChange={(e) => setCompanyFilter(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="dateFilter">Datum</Label>
          <Input
            id="dateFilter"
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="timeFilter">Uhrzeit</Label>
          <Input
            id="timeFilter"
            type="time"
            value={timeFilter}
            onChange={(e) => setTimeFilter(e.target.value)}
          />
        </div>
      </div>

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
                <TableRow key={checkIn.id}>
                  <TableCell className="font-medium">{checkIn.fullName}</TableCell>
                  <TableCell>{checkIn.company}</TableCell>
                  <TableCell>{formatDate(checkIn.visitDate)}</TableCell>
                  <TableCell>{formatTime(checkIn.visitTime)}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleViewPDF(checkIn)}
                          >
                            PDF anzeigen
                          </Button>
                        </DialogTrigger>
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
                      </Dialog>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => handleDelete(checkIn.id)}
                      >
                        Löschen
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default CheckInTable;
