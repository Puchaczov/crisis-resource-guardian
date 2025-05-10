
import { Resource, ResourceCategory, ResourceStatus } from "@/types/resources";

// Mock data
const mockResources: Resource[] = [
  {
    id: "r1",
    name: "Agregat prądotwórczy 15kVA",
    description: "Agregat prądotwórczy 15kVA diesel, mobilny na przyczepie",
    quantity: 2,
    unit: "szt",
    category: "power",
    status: "available",
    location: {
      name: "Magazyn Główny PSP",
      address: "ul. Strażacka 1, 00-001 Warszawa",
      coordinates: {
        lat: 52.2297,
        lng: 21.0122
      }
    },
    organization: "Straż Pożarna",
    lastUpdated: "2023-05-10T10:30:00Z",
    telemetry: {
      battery: 100,
      fuel: 98,
      temperature: 21,
      lastSignal: "2023-05-10T10:25:00Z"
    }
  },
  {
    id: "r2",
    name: "Wóz strażacki GCBA 5/32",
    description: "Ciężki samochód gaśniczy na podwoziu MAN",
    quantity: 1,
    unit: "szt",
    category: "vehicle",
    status: "unavailable",
    location: {
      name: "Jednostka Ratowniczo-Gaśnicza nr 3",
      address: "ul. Polna 14, 00-625 Warszawa",
      coordinates: {
        lat: 52.2180,
        lng: 21.0220
      }
    },
    organization: "Straż Pożarna",
    lastUpdated: "2023-05-09T16:45:00Z",
    telemetry: {
      fuel: 45,
      lastSignal: "2023-05-09T16:40:00Z"
    }
  },
  {
    id: "r3",
    name: "Materace składane",
    description: "Materace składane pojedyncze 190x90 cm",
    quantity: 50,
    unit: "szt",
    category: "shelter",
    status: "available",
    location: {
      name: "Magazyn Miejski",
      address: "ul. Magazynowa 8, 00-811 Warszawa",
      coordinates: {
        lat: 52.2310,
        lng: 20.9800
      }
    },
    organization: "Urząd Miasta",
    lastUpdated: "2023-04-28T09:15:00Z"
  },
  {
    id: "r4",
    name: "Stacja uzdatniania wody mobilna",
    description: "Mobilna stacja uzdatniająca wodę, wydajność 2000l/h",
    quantity: 1,
    unit: "szt",
    category: "water",
    status: "maintenance",
    location: {
      name: "Magazyn Miejski",
      address: "ul. Magazynowa 8, 00-811 Warszawa",
      coordinates: {
        lat: 52.2310,
        lng: 20.9800
      }
    },
    organization: "Urząd Miasta",
    lastUpdated: "2023-05-02T13:40:00Z",
    telemetry: {
      battery: 78,
      lastSignal: "2023-05-01T18:20:00Z"
    }
  },
  {
    id: "r5",
    name: "Namiot pneumatyczny 6x10m",
    description: "Namiot pneumatyczny 6x10m, ogrzewany, 50 miejsc",
    quantity: 4,
    unit: "szt",
    category: "shelter",
    status: "available",
    location: {
      name: "Magazyn PCK",
      address: "ul. Czerwonego Krzyża 5, 00-355 Warszawa",
      coordinates: {
        lat: 52.2400,
        lng: 21.0000
      }
    },
    organization: "Czerwony Krzyż",
    lastUpdated: "2023-05-08T11:20:00Z"
  },
  {
    id: "r6",
    name: "Zespół ratownictwa medycznego",
    description: "ZRM podstawowy: 2 ratowników medycznych + kierowca",
    quantity: 8,
    unit: "zespół",
    category: "personnel",
    status: "reserved",
    location: {
      name: "Stacja Pogotowia Ratunkowego",
      address: "ul. Hoża 56, 00-682 Warszawa",
      coordinates: {
        lat: 52.2220,
        lng: 21.0150
      }
    },
    organization: "Pogotowie Ratunkowe",
    lastUpdated: "2023-05-10T08:00:00Z"
  },
  {
    id: "r7",
    name: "Racje żywnościowe długoterminowe",
    description: "Racje żywnościowe 2000kcal/dzień, termin ważności 5 lat",
    quantity: 1000,
    unit: "szt",
    category: "food",
    status: "available",
    location: {
      name: "Magazyn Wojewódzki",
      address: "ul. Reymonta 28, 01-842 Warszawa",
      coordinates: {
        lat: 52.2500,
        lng: 20.9500
      }
    },
    organization: "Urząd Wojewódzki",
    lastUpdated: "2023-03-15T13:30:00Z"
  },
  {
    id: "r8",
    name: "Woda pitna butelkowana 1,5L",
    description: "Woda pitna niegazowana w butelkach 1,5L",
    quantity: 5000,
    unit: "szt",
    category: "water",
    status: "available",
    location: {
      name: "Magazyn Miejski",
      address: "ul. Magazynowa 8, 00-811 Warszawa",
      coordinates: {
        lat: 52.2310,
        lng: 20.9800
      }
    },
    organization: "Urząd Miasta",
    lastUpdated: "2023-04-20T09:45:00Z"
  },
  {
    id: "r9",
    name: "Defibrylator AED",
    description: "Automatyczny defibrylator zewnętrzny z instrukcjami głosowymi",
    quantity: 10,
    unit: "szt",
    category: "medical",
    status: "available",
    location: {
      name: "Magazyn PCK",
      address: "ul. Czerwonego Krzyża 5, 00-355 Warszawa",
      coordinates: {
        lat: 52.2400,
        lng: 21.0000
      }
    },
    organization: "Czerwony Krzyż",
    lastUpdated: "2023-04-28T14:15:00Z",
    telemetry: {
      battery: 95,
      lastSignal: "2023-04-28T14:10:00Z"
    }
  },
  {
    id: "r10",
    name: "Łódka ratunkowa",
    description: "Łódź ratunkowa z silnikiem zaburtowym 15KM",
    quantity: 3,
    unit: "szt",
    category: "equipment",
    status: "available",
    location: {
      name: "Jednostka Ratownictwa Wodnego",
      address: "ul. Wybrzeże Kościuszkowskie 2, 00-390 Warszawa",
      coordinates: {
        lat: 52.2370,
        lng: 21.0380
      }
    },
    organization: "WOPR",
    lastUpdated: "2023-05-01T09:30:00Z",
    telemetry: {
      fuel: 100,
      lastSignal: "2023-05-01T09:25:00Z"
    }
  },
  {
    id: "r11",
    name: "Koce termiczne",
    description: "Koce termiczne ratunkowe, folia NRC",
    quantity: 500,
    unit: "szt",
    category: "medical",
    status: "available",
    location: {
      name: "Magazyn PCK",
      address: "ul. Czerwonego Krzyża 5, 00-355 Warszawa",
      coordinates: {
        lat: 52.2400,
        lng: 21.0000
      }
    },
    organization: "Czerwony Krzyż",
    lastUpdated: "2023-04-15T10:00:00Z"
  },
  {
    id: "r12",
    name: "Zestaw pomp wysokowydajnych",
    description: "Pompy wysokowydajne 4000l/min, elektryczne",
    quantity: 5,
    unit: "zestaw",
    category: "equipment",
    status: "available",
    location: {
      name: "Magazyn Główny PSP",
      address: "ul. Strażacka 1, 00-001 Warszawa",
      coordinates: {
        lat: 52.2297,
        lng: 21.0122
      }
    },
    organization: "Straż Pożarna",
    lastUpdated: "2023-05-05T11:30:00Z",
    telemetry: {
      battery: 100,
      lastSignal: "2023-05-05T11:25:00Z"
    }
  }
];

// Generate resources for Kraków
const krakowResources: Resource[] = [
  {
    id: "kr1",
    name: "Agregat prądotwórczy 20kVA",
    description: "Agregat prądotwórczy 20kVA diesel, stacjonarny",
    quantity: 1,
    unit: "szt",
    category: "power",
    status: "available",
    location: {
      name: "Magazyn Miejski Kraków",
      address: "ul. Centralna 53, 31-586 Kraków",
      coordinates: {
        lat: 50.0647,
        lng: 19.9450
      }
    },
    organization: "Urząd Miasta Kraków",
    lastUpdated: "2023-05-08T14:30:00Z",
    telemetry: {
      battery: 100,
      fuel: 87,
      temperature: 22,
      lastSignal: "2023-05-08T14:25:00Z"
    }
  },
  {
    id: "kr2",
    name: "Samochód terenowy 4x4",
    description: "Land Rover Defender, wyposażenie ratunkowe",
    quantity: 2,
    unit: "szt",
    category: "vehicle",
    status: "available",
    location: {
      name: "Komenda Miejska PSP Kraków",
      address: "ul. Westerplatte 19, 31-033 Kraków",
      coordinates: {
        lat: 50.0591,
        lng: 19.9400
      }
    },
    organization: "Straż Pożarna",
    lastUpdated: "2023-05-09T09:15:00Z",
    telemetry: {
      fuel: 95,
      lastSignal: "2023-05-09T09:10:00Z"
    }
  },
  {
    id: "kr3",
    name: "Łóżka polowe",
    description: "Łóżka polowe składane z materacami",
    quantity: 75,
    unit: "szt",
    category: "shelter",
    status: "available",
    location: {
      name: "Magazyn PCK Kraków",
      address: "ul. Studencka 19, 31-116 Kraków",
      coordinates: {
        lat: 50.0637,
        lng: 19.9318
      }
    },
    organization: "Czerwony Krzyż",
    lastUpdated: "2023-05-01T10:45:00Z"
  }
];

// Add Kraków resources to the mock data
mockResources.push(...krakowResources);

// Generate resources for Gdańsk
const gdanskResources: Resource[] = [
  {
    id: "gd1",
    name: "Kontener mieszkalny",
    description: "Kontenery mieszkalne ocieplone 6x2,4m z wyposażeniem",
    quantity: 8,
    unit: "szt",
    category: "shelter",
    status: "available",
    location: {
      name: "Baza Logistyczna Gdańsk",
      address: "ul. Oliwska 35, 80-563 Gdańsk",
      coordinates: {
        lat: 54.3520,
        lng: 18.6466
      }
    },
    organization: "Urząd Wojewódzki Pomorski",
    lastUpdated: "2023-05-07T12:10:00Z"
  },
  {
    id: "gd2",
    name: "Łódź ratownicza motorowa",
    description: "Łódź motorowa ratunkowa 15 osób",
    quantity: 4,
    unit: "szt",
    category: "vehicle",
    status: "available",
    location: {
      name: "Baza WOPR Gdańsk",
      address: "ul. Stogi 20, 80-642 Gdańsk",
      coordinates: {
        lat: 54.3700,
        lng: 18.6700
      }
    },
    organization: "WOPR",
    lastUpdated: "2023-05-06T09:30:00Z",
    telemetry: {
      fuel: 100,
      lastSignal: "2023-05-06T09:25:00Z"
    }
  },
  {
    id: "gd3",
    name: "Zespół nurków ratownictwa",
    description: "Zespół nurków ratownictwa wodnego z wyposażeniem",
    quantity: 2,
    unit: "zespół",
    category: "personnel",
    status: "available",
    location: {
      name: "Baza WOPR Gdańsk",
      address: "ul. Stogi 20, 80-642 Gdańsk",
      coordinates: {
        lat: 54.3700,
        lng: 18.6700
      }
    },
    organization: "WOPR",
    lastUpdated: "2023-05-09T08:15:00Z"
  }
];

// Add Gdańsk resources to the mock data
mockResources.push(...gdanskResources);

export const getAllResources = (): Promise<Resource[]> => {
  return Promise.resolve([...mockResources]);
};

export const getResourceById = (id: string): Promise<Resource | undefined> => {
  const resource = mockResources.find(resource => resource.id === id);
  return Promise.resolve(resource);
};

export const getResourcesByCategory = (category: ResourceCategory): Promise<Resource[]> => {
  const resources = mockResources.filter(resource => resource.category === category);
  return Promise.resolve(resources);
};

export const getResourcesByStatus = (status: ResourceStatus): Promise<Resource[]> => {
  const resources = mockResources.filter(resource => resource.status === status);
  return Promise.resolve(resources);
};

export const getResourcesByOrganization = (organization: string): Promise<Resource[]> => {
  const resources = mockResources.filter(resource => resource.organization === organization);
  return Promise.resolve(resources);
};

export const filterResources = (
  search: string = '',
  category: string = '',
  status: string = '',
  organization: string = ''
): Promise<Resource[]> => {
  let filtered = [...mockResources];
  
  if (search) {
    const searchLower = search.toLowerCase();
    filtered = filtered.filter(resource => 
      resource.name.toLowerCase().includes(searchLower) || 
      resource.description.toLowerCase().includes(searchLower) ||
      resource.location.name.toLowerCase().includes(searchLower) ||
      resource.location.address.toLowerCase().includes(searchLower)
    );
  }
  
  if (category) {
    filtered = filtered.filter(resource => resource.category === category);
  }
  
  if (status) {
    filtered = filtered.filter(resource => resource.status === status);
  }
  
  if (organization) {
    filtered = filtered.filter(resource => resource.organization === organization);
  }
  
  return Promise.resolve(filtered);
};

export const addResource = (resource: Omit<Resource, 'id'>): Promise<Resource> => {
  const newResource: Resource = {
    ...resource,
    id: `r${mockResources.length + 1}`,
    lastUpdated: new Date().toISOString()
  };
  
  mockResources.push(newResource);
  return Promise.resolve(newResource);
};

export const updateResource = (resource: Resource): Promise<Resource> => {
  const index = mockResources.findIndex(r => r.id === resource.id);
  
  if (index === -1) {
    return Promise.reject(new Error("Resource not found"));
  }
  
  const updatedResource = {
    ...resource,
    lastUpdated: new Date().toISOString()
  };
  
  mockResources[index] = updatedResource;
  return Promise.resolve(updatedResource);
};

export const deleteResource = (id: string): Promise<boolean> => {
  const index = mockResources.findIndex(resource => resource.id === id);
  
  if (index === -1) {
    return Promise.reject(new Error("Resource not found"));
  }
  
  mockResources.splice(index, 1);
  return Promise.resolve(true);
};

export const getCategoryLabel = (category: ResourceCategory): string => {
  const labels: Record<ResourceCategory, string> = {
    equipment: 'Sprzęt',
    medical: 'Zasoby medyczne',
    vehicle: 'Pojazdy',
    shelter: 'Schronienie',
    personnel: 'Personel',
    food: 'Żywność',
    water: 'Woda',
    power: 'Zasilanie',
    other: 'Inne'
  };
  
  return labels[category] || category;
};

export const getStatusLabel = (status: ResourceStatus): string => {
  const labels: Record<ResourceStatus, string> = {
    available: 'Dostępny',
    reserved: 'Zarezerwowany',
    unavailable: 'Niedostępny',
    maintenance: 'W serwisie'
  };
  
  return labels[status] || status;
};

export const getStatusClass = (status: ResourceStatus): string => {
  const classes: Record<ResourceStatus, string> = {
    available: 'status-indicator-available',
    reserved: 'status-indicator-reserved',
    unavailable: 'status-indicator-unavailable',
    maintenance: 'status-indicator-maintenance'
  };
  
  return classes[status] || '';
};

// Categories for selection
export const resourceCategories: { value: ResourceCategory | 'all'; label: string }[] = [
  { value: 'all', label: 'Wszystkie kategorie' },
  { value: 'equipment', label: 'Sprzęt' },
  { value: 'medical', label: 'Zasoby medyczne' },
  { value: 'vehicle', label: 'Pojazdy' },
  { value: 'shelter', label: 'Schronienie' },
  { value: 'personnel', label: 'Personel' },
  { value: 'food', label: 'Żywność' },
  { value: 'water', label: 'Woda' },
  { value: 'power', label: 'Zasilanie' },
  { value: 'other', label: 'Inne' }
];

// Statuses for selection
export const resourceStatuses: { value: ResourceStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'Wszystkie statusy' },
  { value: 'available', label: 'Dostępny' },
  { value: 'reserved', label: 'Zarezerwowany' },
  { value: 'unavailable', label: 'Niedostępny' },
  { value: 'maintenance', label: 'W serwisie' }
];

// Organizations for selection
export const resourceOrganizations: { value: string; label: string }[] = [
  { value: 'all', label: 'Wszystkie organizacje' },
  { value: 'Straż Pożarna', label: 'Straż Pożarna' },
  { value: 'Urząd Miasta', label: 'Urząd Miasta' },
  { value: 'Czerwony Krzyż', label: 'Czerwony Krzyż' },
  { value: 'Pogotowie Ratunkowe', label: 'Pogotowie Ratunkowe' },
  { value: 'Urząd Wojewódzki', label: 'Urząd Wojewódzki' },
  { value: 'WOPR', label: 'WOPR' },
  { value: 'Urząd Miasta Kraków', label: 'Urząd Miasta Kraków' },
  { value: 'Urząd Wojewódzki Pomorski', label: 'Urząd Wojewódzki Pomorski' }
];
