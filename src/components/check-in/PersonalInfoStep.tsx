
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { de } from "date-fns/locale";

interface PersonalInfo {
  firstName: string;
  lastName: string;
  company: string;
  visitReason: string;
  date: Date;
  time: string;
}

interface PersonalInfoStepProps {
  formData: PersonalInfo;
  updateFormData: (field: string, value: any) => void;
  timeOptions: string[];
}

const PersonalInfoStep = ({ formData, updateFormData, timeOptions }: PersonalInfoStepProps) => {
  return (
    <div className="space-y-4 animate-slide-up">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName">Vorname</Label>
          <Input
            id="firstName"
            placeholder="Max"
            value={formData.firstName}
            onChange={(e) => updateFormData("firstName", e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName">Nachname</Label>
          <Input
            id="lastName"
            placeholder="Mustermann"
            value={formData.lastName}
            onChange={(e) => updateFormData("lastName", e.target.value)}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="company">Unternehmen / Organisation</Label>
        <Input
          id="company"
          placeholder="Firma GmbH"
          value={formData.company}
          onChange={(e) => updateFormData("company", e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="visitReason">Grund des Besuches</Label>
        <Textarea
          id="visitReason"
          placeholder="Besprechung, Meeting, etc."
          value={formData.visitReason}
          onChange={(e) => updateFormData("visitReason", e.target.value)}
          required
          className="resize-none"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="date">Datum</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                id="date"
                variant="outline"
                className="w-full justify-start text-left font-normal"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {formData.date ? (
                  format(formData.date, "PPP", { locale: de })
                ) : (
                  <span>Datum wählen</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={formData.date}
                onSelect={(date) => date && updateFormData("date", date)}
                initialFocus
                locale={de}
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-2">
          <Label htmlFor="time">Uhrzeit</Label>
          <Select 
            value={formData.time} 
            onValueChange={(value) => updateFormData("time", value)}
          >
            <SelectTrigger id="time" className="w-full">
              <SelectValue placeholder="Wählen Sie eine Uhrzeit" />
            </SelectTrigger>
            <SelectContent>
              {timeOptions.map((time) => (
                <SelectItem key={time} value={time}>
                  {time} Uhr
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};

export default PersonalInfoStep;
