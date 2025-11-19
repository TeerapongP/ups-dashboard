import { Device } from "@/lib/device";

export interface DeviceTableProps {
  devices: Device[];
  totalDevices: number;
  onViewDevice: (device: Device) => void;
  onEditDevice: (device: Device) => void;
  onDeleteDevice: (device: Device) => void;
  onAddDevice: () => void;
}
