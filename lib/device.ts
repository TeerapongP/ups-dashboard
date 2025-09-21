export interface Device {
  data: {};
  ups_id: string;               
  ip: string;
  brand: string;
  model: string;
  location: string;
  status: 'online' | 'powerFail' | 'offline';
  temperature?: number | null;   
  last_seen: string;        
  profile_name: null;
}
