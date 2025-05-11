import { RESOURCE_CATEGORIES, RESOURCE_STATUSES } from '@/constants/resources';

export type ResourceStatus = typeof RESOURCE_STATUSES[keyof typeof RESOURCE_STATUSES];
export type ResourceCategory = typeof RESOURCE_CATEGORIES[keyof typeof RESOURCE_CATEGORIES];

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

export interface ResourceFormData {
  name: string;
  description: string;
  quantity: number;
  unit: string;
  category: ResourceCategory | '';
  status: ResourceStatus;
  organization: string;
  location: {
    name: string;
    address: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
}

export interface ResourceFilter {
  search: string;
  category: ResourceCategory | '';
  status: ResourceStatus | '';
  organization: string | '';
}
