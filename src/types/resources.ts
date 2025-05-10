
export type ResourceStatus = 'available' | 'reserved' | 'unavailable' | 'maintenance';

export type ResourceCategory = 
  'equipment' | 
  'medical' | 
  'vehicle' | 
  'shelter' | 
  'personnel' | 
  'food' | 
  'water' | 
  'power' | 
  'other';

export interface Resource {
  id: string;
  name: string;
  description: string;
  quantity: number;
  unit: string;
  category: ResourceCategory;
  status: ResourceStatus;
  location: {
    name: string;
    address: string;
    coordinates: {
      lat: number;
      lng: number;
    }
  };
  organization: string;
  lastUpdated: string;
  qrCode?: string;
  telemetry?: {
    battery?: number;
    fuel?: number;
    temperature?: number;
    lastSignal?: string;
  }
}

export interface ResourceFilter {
  search: string;
  category: ResourceCategory | '';
  status: ResourceStatus | '';
  organization: string | '';
}
