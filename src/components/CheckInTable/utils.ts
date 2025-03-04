
import { CheckIn } from '@/lib/database/models';

export const formatDate = (dateString: string) => {
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

export const formatTime = (timeString: string) => {
  return timeString || 'Keine Zeit';
};

export const filterCheckIns = (
  checkIns: CheckIn[], 
  nameFilter: string, 
  companyFilter: string, 
  dateFilter: string, 
  timeFilter: string
) => {
  return checkIns.filter(checkIn => {
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
};
