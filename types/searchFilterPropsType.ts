import { UPSData } from "./ups";

export interface SearchFilterProps {
    upsData: UPSData[];
    onFilter: (filteredData: UPSData[], groupBy: string) => void;
  }
  