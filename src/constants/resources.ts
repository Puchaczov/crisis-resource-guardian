export const RESOURCE_CATEGORIES = {
  EQUIPMENT: 'equipment',
  MEDICAL: 'medical',
  VEHICLE: 'vehicle',
  SHELTER: 'shelter',
  PERSONNEL: 'personnel',
  FOOD: 'food',
  WATER: 'water',
  POWER: 'power',
  OTHER: 'other'
} as const;

export const RESOURCE_STATUSES = {
  AVAILABLE: 'available',
  RESERVED: 'reserved',
  UNAVAILABLE: 'unavailable',
  MAINTENANCE: 'maintenance'
} as const;
