import { ReactNode } from "react";

export type DeviceMeta = {
  last_sta: string;
  lastStatus: string;
  upsId: string;
  ip: string;
  brand: string;
  model: string;
  location: string;
  capacityVA?: number | null;
  capacityW?: number | null;
};

export type OfflineItem = {
  start?: string | null;   // ISO string
  end?: string | null;     // ISO string
  durationSec?: number | null;
  note?: string | null;
};

export type PowerFailItem = OfflineItem & {
  voltage?: number | null;
  threshold?: number | null;
};

export type DeviceReport = {
  meta: DeviceMeta;
  offline: OfflineItem[];
  powerFail: PowerFailItem[];
};

export type DailyReportPayload = {
  periodTotalMinutes: number;
  periodStart: ReactNode;
  periodEnd: ReactNode;
  generatedAt: ReactNode;
  reportDate: string;      // "YYYY-MM-DD"
  devices: DeviceReport[];
};
