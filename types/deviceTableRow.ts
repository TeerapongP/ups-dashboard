import { Device } from "@/lib/device";

export interface DeviceTableRowProps {
  device: Device;
  onView: (device: Device) => void;
  onEdit: (device: Device) => void;
  onDelete: (device: Device) => void;
}