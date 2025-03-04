
import React from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface FilterBarProps {
  nameFilter: string;
  setNameFilter: (value: string) => void;
  companyFilter: string;
  setCompanyFilter: (value: string) => void;
  dateFilter: string;
  setDateFilter: (value: string) => void;
  timeFilter: string;
  setTimeFilter: (value: string) => void;
}

const FilterBar = ({
  nameFilter,
  setNameFilter,
  companyFilter,
  setCompanyFilter,
  dateFilter,
  setDateFilter,
  timeFilter,
  setTimeFilter
}: FilterBarProps) => {
  return (
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
  );
};

export default FilterBar;
