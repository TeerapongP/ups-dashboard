export interface Device {
  data: Record<string, unknown>;
  ups_id: string;
  ip: string;
  brand: string;
  model: string;
  location: string;
  status: 'online' | 'powerFail' | 'offline' | 'powerCut';
  temperature?: number | null;
  last_seen: string;
  profile_name: string | null;
}
