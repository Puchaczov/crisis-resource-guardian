import { ResourceCategory } from '@/types/resources';

export type AlertSeverity = 'critical' | 'warning' | 'info';

export interface SystemAlert {
  id: string;
  title: string;
  description: string;
  severity: AlertSeverity;
  timestamp: string;
  category?: ResourceCategory;
  resourceId?: string;
  actionLink?: string;
  actionText?: string;
  dismissed?: boolean;
}

// Mock alerts with categories
const mockAlerts: SystemAlert[] = [
  {
    id: '1',
    title: 'Krytyczny poziom paliwa w agregacie',
    description: 'Agregat prądotwórczy 20kVA w lokalizacji Magazyn Miejski wymaga natychmiastowego uzupełnienia paliwa.',
    severity: 'critical',
    category: 'power',
    resourceId: 'kr1',
    timestamp: new Date().toISOString(),
    actionLink: '/resources/kr1',
    actionText: 'Zobacz szczegóły'
  },
  {
    id: '2',
    title: 'Zbliżający się termin przeglądu',
    description: 'Trzy zasoby wymagają przeglądu technicznego w ciągu najbliższych 7 dni.',
    severity: 'warning',
    category: 'vehicle',
    timestamp: new Date().toISOString(),
    actionLink: '/resources',
    actionText: 'Lista zasobów'
  },
  {
    id: '3',
    title: 'Awaria systemu chłodzenia',
    description: 'Wykryto awarię systemu chłodzenia w mobilnej stacji uzdatniania wody. Wymagana natychmiastowa interwencja.',
    severity: 'critical',
    category: 'water',
    resourceId: 'r4',
    timestamp: new Date().toISOString(),
    actionLink: '/resources/r4',
    actionText: 'Sprawdź urządzenie'
  },
  {
    id: '4',
    title: 'Niski stan paliwa w pojazdach',
    description: 'Trzy pojazdy ratownicze mają stan paliwa poniżej 25%. Należy uzupełnić paliwo przed kolejną zmianą.',
    severity: 'warning',
    category: 'vehicle',
    timestamp: new Date().toISOString(),
    actionLink: '/resources?category=vehicle',
    actionText: 'Lista pojazdów'
  },
  {
    id: '5',
    title: 'Przekroczony limit temperatury',
    description: 'Temperatura w magazynie żywności przekroczyła 15°C. Ryzyko uszkodzenia zapasów żywności.',
    severity: 'critical',
    category: 'food',
    timestamp: new Date().toISOString(),
    actionLink: '/resources?category=food',
    actionText: 'Sprawdź magazyn'
  },
  {
    id: '6',
    title: 'Kończący się termin ważności',
    description: 'Za 14 dni upływa termin ważności 200 racji żywnościowych.',
    severity: 'warning',
    category: 'food',
    resourceId: 'r7',
    timestamp: new Date().toISOString(),
    actionLink: '/resources/r7',
    actionText: 'Szczegóły zasobu'
  },
  {
    id: '7',
    title: 'Brak łączności z zespołem',
    description: 'Utracono łączność z zespołem ratownictwa medycznego #3. Ostatni kontakt: 15 minut temu.',
    severity: 'critical',
    category: 'personnel',
    resourceId: 'r6',
    timestamp: new Date().toISOString(),
    actionLink: '/resources/r6',
    actionText: 'Lokalizacja zespołu'
  },
  {
    id: '8',
    title: 'Niski poziom baterii',
    description: 'Wykryto niski poziom baterii w 3 defibrylatorach AED. Wymagane natychmiastowe ładowanie.',
    severity: 'warning',
    category: 'medical',
    resourceId: 'r9',
    timestamp: new Date().toISOString(),
    actionLink: '/resources/r9',
    actionText: 'Lista urządzeń'
  }
];

export const getAllAlerts = async (): Promise<SystemAlert[]> => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  return [...mockAlerts];
};

export const getActiveAlerts = async (): Promise<SystemAlert[]> => {
  const alerts = await getAllAlerts();
  return alerts.filter(alert => !alert.dismissed);
};

export const getAlertById = async (id: string): Promise<SystemAlert | undefined> => {
  const alerts = await getAllAlerts();
  return alerts.find(alert => alert.id === id);
};

export const getAlertsBySeverity = async (severity: AlertSeverity): Promise<SystemAlert[]> => {
  const alerts = await getAllAlerts();
  return alerts.filter(alert => alert.severity === severity);
};

export const createAlert = async (alert: Omit<SystemAlert, 'id' | 'timestamp'>): Promise<SystemAlert> => {
  const newAlert: SystemAlert = {
    ...alert,
    id: `alert-${mockAlerts.length + 1}`,
    timestamp: new Date().toISOString()
  };
  
  mockAlerts.push(newAlert);
  return newAlert;
};

export const dismissAlert = async (id: string): Promise<boolean> => {
  const index = mockAlerts.findIndex(alert => alert.id === id);
  if (index === -1) {
    return false;
  }
  
  mockAlerts[index] = {
    ...mockAlerts[index],
    dismissed: true
  };
  
  return true;
};

export const dismissAllAlerts = async (): Promise<boolean> => {
  mockAlerts.forEach(alert => {
    alert.dismissed = true;
  });
  return true;
};

export const getSeverityLabel = (severity: AlertSeverity): string => {
  const labels: Record<AlertSeverity, string> = {
    critical: 'Krytyczny',
    warning: 'Ostrzeżenie',
    info: 'Informacja'
  };
  
  return labels[severity] || severity;
};

export const getSeverityColor = (severity: AlertSeverity): { bg: string; text: string } => {
  const colors: Record<AlertSeverity, { bg: string; text: string }> = {
    critical: { bg: 'bg-red-600', text: 'text-white' },
    warning: { bg: 'bg-amber-500', text: 'text-white' },
    info: { bg: 'bg-blue-500', text: 'text-white' }
  };
  
  return colors[severity] || { bg: 'bg-gray-500', text: 'text-white' };
};

export const getCategoryStyle = (category?: ResourceCategory): { bgColor: string; textColor: string; icon: string } => {
  switch (category) {
    case 'power':
      return { bgColor: 'bg-amber-100', textColor: 'text-amber-800', icon: 'zap' };
    case 'water':
      return { bgColor: 'bg-sky-100', textColor: 'text-sky-800', icon: 'droplet' };
    case 'medical':
      return { bgColor: 'bg-rose-100', textColor: 'text-rose-800', icon: 'heart-pulse' };
    case 'vehicle':
      return { bgColor: 'bg-violet-100', textColor: 'text-violet-800', icon: 'truck' };
    case 'shelter':
      return { bgColor: 'bg-emerald-100', textColor: 'text-emerald-800', icon: 'home' };
    case 'food':
      return { bgColor: 'bg-orange-100', textColor: 'text-orange-800', icon: 'utensils' };
    case 'personnel':
      return { bgColor: 'bg-indigo-100', textColor: 'text-indigo-800', icon: 'users' };
    case 'equipment':
      return { bgColor: 'bg-zinc-100', textColor: 'text-zinc-800', icon: 'wrench' };
    default:
      return { bgColor: 'bg-slate-100', textColor: 'text-slate-800', icon: 'alert-circle' };
  }
};

export const getCategoryLabel = (category?: ResourceCategory): string => {
  switch (category) {
    case 'power':
      return 'Zasilanie';
    case 'water':
      return 'Woda';
    case 'medical':
      return 'Medyczne';
    case 'vehicle':
      return 'Pojazdy';
    case 'shelter':
      return 'Schronienie';
    case 'food':
      return 'Żywność';
    case 'personnel':
      return 'Personel';
    case 'equipment':
      return 'Sprzęt';
    default:
      return 'Inne';
  }
};