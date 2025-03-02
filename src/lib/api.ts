
// This is a mock implementation. In a real application, this would connect to your backend API
// which would then handle the MongoDB operations

interface CheckInData {
  fullName: string;
  company: string;
  acceptedRules: boolean;
  acceptedDocuments?: string[];
  timestamp: Date;
}

export const submitCheckIn = async (data: CheckInData): Promise<{ success: boolean, message: string }> => {
  console.log('Check-in data submitted:', data);
  
  // Simulate API call with a delay
  return new Promise((resolve) => {
    setTimeout(() => {
      if (data.fullName && data.company) {
        // Store the check-in data in localStorage
        const checkIns = JSON.parse(localStorage.getItem('checkIns') || '[]');
        checkIns.push({
          ...data,
          id: Date.now().toString(),
          timestamp: new Date().toISOString()
        });
        localStorage.setItem('checkIns', JSON.stringify(checkIns));
        
        resolve({ 
          success: true, 
          message: "Check-in erfolgreich gespeichert. Willkommen!" 
        });
      } else {
        resolve({ 
          success: false, 
          message: "Bitte füllen Sie alle erforderlichen Felder aus." 
        });
      }
    }, 800);
  });
};

export const getCheckIns = async (): Promise<any[]> => {
  console.log('Fetching check-ins');
  
  // Simulate API call with a delay
  return new Promise((resolve) => {
    setTimeout(() => {
      const checkIns = JSON.parse(localStorage.getItem('checkIns') || '[]');
      resolve(checkIns);
    }, 500);
  });
};
