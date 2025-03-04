
import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { getCheckIns, deleteCheckIn } from '@/lib/api';
import { CheckIn } from '@/lib/database/models';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { Eye, Trash2 } from 'lucide-react';
import PDFViewer from './PDFViewer';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

const CheckInTable = () => {
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
  const [filteredCheckIns, setFilteredCheckIns] = useState<CheckIn[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    fullName: '',
    company: '',
    visitDate: '',
    visitTime: '',
  });
  const [selectedPdf, setSelectedPdf] = useState<string | null>(null);

  useEffect(() => {
    fetchCheckIns();
  }, []);

  useEffect(() => {
    filterCheckIns();
  }, [checkIns, filters]);

  const fetchCheckIns = async () => {
    try {
      setLoading(true);
      const data = await getCheckIns();
      setCheckIns(data);
      setFilteredCheckIns(data);
    } catch (error) {
      console.error('Error fetching check-ins:', error);
      toast.error('Fehler beim Laden der Check-ins');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Sind Sie sicher, dass Sie diesen Check-in löschen möchten?')) {
      try {
        await deleteCheckIn(id);
        toast.success('Check-in erfolgreich gelöscht');
        fetchCheckIns();
      } catch (error) {
        console.error('Error deleting check-in:', error);
        toast.error('Fehler beim Löschen des Check-ins');
      }
    }
  };

  const handleFilterChange = (key: keyof typeof filters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const filterCheckIns = () => {
    let filtered = [...checkIns];

    // Apply filters only if they have at least 3 characters
    if (filters.fullName.length >= 3) {
      filtered = filtered.filter(item => 
        item.fullName.toLowerCase().includes(filters.fullName.toLowerCase())
      );
    }
    
    if (filters.company.length >= 3) {
      filtered = filtered.filter(item => 
        item.company.toLowerCase().includes(filters.company.toLowerCase())
      );
    }
    
    if (filters.visitDate.length >= 3) {
      filtered = filtered.filter(item => {
        const date = item.visitDate ? new Date(item.visitDate) : null;
        return date ? format(date, 'dd.MM.yyyy').includes(filters.visitDate) : false;
      });
    }
    
    if (filters.visitTime.length >= 3) {
      filtered = filtered.filter(item => 
        item.visitTime ? item.visitTime.includes(filters.visitTime) : false
      );
    }

    setFilteredCheckIns(filtered);
  };

  const formatDate = (dateString: string | Date) => {
    try {
      const date = new Date(dateString);
      return format(date, 'dd.MM.yyyy');
    } catch (error) {
      return 'Ungültiges Datum';
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-4 gap-4">
        <div>
          <Input 
            placeholder="Nach Namen filtern"
            value={filters.fullName}
            onChange={(e) => handleFilterChange('fullName', e.target.value)}
          />
        </div>
        <div>
          <Input 
            placeholder="Nach Firma filtern"
            value={filters.company}
            onChange={(e) => handleFilterChange('company', e.target.value)}
          />
        </div>
        <div>
          <Input 
            placeholder="Nach Datum filtern"
            value={filters.visitDate}
            onChange={(e) => handleFilterChange('visitDate', e.target.value)}
          />
        </div>
        <div>
          <Input 
            placeholder="Nach Zeit filtern"
            value={filters.visitTime}
            onChange={(e) => handleFilterChange('visitTime', e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-4">Lade Check-ins...</div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Firma</TableHead>
                <TableHead>Datum</TableHead>
                <TableHead>Zeit</TableHead>
                <TableHead className="text-right">Aktionen</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCheckIns.length > 0 ? (
                filteredCheckIns.map((checkIn) => (
                  <TableRow key={checkIn.id}>
                    <TableCell>{checkIn.fullName}</TableCell>
                    <TableCell>{checkIn.company}</TableCell>
                    <TableCell>{checkIn.visitDate ? formatDate(checkIn.visitDate) : '-'}</TableCell>
                    <TableCell>{checkIn.visitTime || '-'}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        {checkIn.pdfData && (
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedPdf(checkIn.pdfData || null)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-4xl">
                              <DialogHeader>
                                <DialogTitle>Check-in PDF</DialogTitle>
                              </DialogHeader>
                              <div className="mt-4 h-[70vh]">
                                <PDFViewer pdfData={checkIn.pdfData} />
                              </div>
                            </DialogContent>
                          </Dialog>
                        )}
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => checkIn.id && handleDelete(checkIn.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-4">
                    Keine Check-ins gefunden
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default CheckInTable;
