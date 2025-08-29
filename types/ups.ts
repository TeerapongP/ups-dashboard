export interface UPSData {
  id: string;
  status: 'Online' | 'Offline';
  ip: string;
  brand: string;
  model: string;
  location: string;

  batteryPercent: number | null;
  batteryVDC: number | null;
  backupTimeMin: number | null;
  temperatureC: number | null;

  input: {
    L1V: number | null;
    L2V: number | null;
    L3V: number | null;
    L1A: number | null;
    L2A: number | null;
    L3A: number | null;
    freqHz: number | null;
  };

  output: {
    L1V: number | null;
    L2V: number | null;
    L3V: number | null;
    L1A: number | null;
    L2A: number | null;
    L3A: number | null;
    freqHz: number | null;
  };

  loadVA: number | null;
  loadW: number | null;
  inputMax: number | null;
  inputMin: number | null;

  // ฟิลด์ที่เพิ่มเข้ามาจาก backend
  manufacturer: string | null;
  firmwareVersion: string | null;
  ratingVoltageV: number | null;
  ratingFrequencyHz: number | null;
  ratingBatteryVoltageV: number | null;
  batteryChargeVoltageV: number | null;
  batteryCount: number | null;
  lastBatteryReplaceDate: string | null;
}

// ถ้าคุณเรียก endpoint /ups แบบรวม
export interface UPSListResponse {
  count: number;
  items: UPSData[];
}
