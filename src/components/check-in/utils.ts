
// Generate time options every 15 minutes
export const generateTimeOptions = () => {
  const times = [];
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 15) {
      const formattedHour = hour.toString().padStart(2, '0');
      const formattedMinute = minute.toString().padStart(2, '0');
      times.push(`${formattedHour}:${formattedMinute}`);
    }
  }
  return times;
};

export const formSteps = [
  {
    title: "Willkommen",
    description: "Bitte geben Sie Ihre persönlichen Daten ein."
  },
  {
    title: "Dokumente",
    description: "Bitte lesen und bestätigen Sie die folgenden Dokumente."
  },
  {
    title: "Bestätigung",
    description: "Überprüfen Sie Ihre Daten und schließen Sie den Check-In ab."
  }
];
