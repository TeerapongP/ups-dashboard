export interface SearchAndControlsProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedDate: string;
  onDateChange: (value: string) => void;
  onAddDevice: () => void;
  onGenerateReport: () => void;
}
