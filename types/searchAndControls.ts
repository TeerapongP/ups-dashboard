export type SearchAndControlsProps = {
  searchTerm: string;
  onSearchChange: (v: string) => void;
  selectedDate: Date | null;
  onDateChange: (d: Date | null) => void;
  onAddDevice: () => void;
  onGenerateReport: () => void;
  isGenerating?: boolean; // ✅ เพิ่มเพื่อคุมปุ่ม
};
