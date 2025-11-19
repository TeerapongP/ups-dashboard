import { Device } from "@/lib/device";

type Mode = 'insert' | 'edit';
export interface UPSModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (device: Device, mode: Mode) => Promise<void> | void;
  device?: Device;
  mode: Mode;
}
