export interface UPSData {
    id: string;
    status: 'Online' | 'Offline';
    ip: string;
    brand: string;
    model: string;
    location: string;
    batteryPercent: number;
    batteryVDC: number;
    backupTimeMin: number;
    temperatureC: number;
    input: {
      L1V: number;
      L2V: number;
      L3V: number;
      L1A: number;
      L2A: number;
      L3A: number;
      freqHz: number;
    };
    output: {
      L1V: number;
      L2V: number;
      L3V: number;
      L1A: number;
      L2A: number;
      L3A: number;
      freqHz: number;
    };
    loadVA: number;
    loadW: number;
    inputMax: number;
    inputMin: number;
  }