export type AlertSeverity = 'critical' | 'warning' | 'info';

export interface SystemAlert {
  id: string;
  title: string;
  description: string;
  severity: AlertSeverity;
  timestamp: string;
  actionLink?: string;
  actionText?: string;
  dismissed?: boolean;
}

// Mock alerts data
const mockAlerts: SystemAlert[] = [
  {
    id: '1',
    title: 'Krytyczny poziom paliwa w agregacie',
    description: 'Agregat prądotwórczy 20kVA w lokalizacji Magazyn Miejski wymaga natychmiastowego uzupełnienia paliwa.',
    severity: 'critical',
    timestamp: new Date().toISOString(),
    actionLink: '/resources/kr1',
    actionText: 'Zobacz szczegóły'
  },
  {
    id: '2',
    title: 'Zbliżający się termin przeglądu',
    description: 'Trzy zasoby wymagają przeglądu technicznego w ciągu najbliższych 7 dni.',
    severity: 'warning',
    timestamp: new Date().toISOString(),
    actionLink: '/resources',
    actionText: 'Lista zasobów'
  },
  {
    id: '3',
    title: 'Awaria systemu chłodzenia',
    description: 'Wykryto awarię systemu chłodzenia w mobilnej stacji uzdatniania wody. Wymagana natychmiastowa interwencja.',
    severity: 'critical',
    timestamp: new Date().toISOString(),
    actionLink: '/resources/r4',
    actionText: 'Sprawdź urządzenie'
  },
  {
    id: '4',
    title: 'Niski stan paliwa w pojazdach',
    description: 'Trzy pojazdy ratownicze mają stan paliwa poniżej 25%. Należy uzupełnić paliwo przed kolejną zmianą.',
    severity: 'warning',
    timestamp: new Date().toISOString(),
    actionLink: '/resources?category=vehicle',
    actionText: 'Lista pojazdów'
  },
  {
    id: '5',
    title: 'Przekroczony limit temperatury',
    description: 'Temperatura w magazynie żywności przekroczyła 15°C. Ryzyko uszkodzenia zapasów żywności.',
    severity: 'critical',
    timestamp: new Date().toISOString(),
    actionLink: '/resources?category=food',
    actionText: 'Sprawdź magazyn'
  },
  {
    id: '6',
    title: 'Kończący się termin ważności',
    description: 'Za 14 dni upływa termin ważności 200 racji żywnościowych.',
    severity: 'warning',
    timestamp: new Date().toISOString(),
    actionLink: '/resources/r7',
    actionText: 'Szczegóły zasobu'
  },
  {
    id: '7',
    title: 'Brak łączności z zespołem',
    description: 'Utracono łączność z zespołem ratownictwa medycznego #3. Ostatni kontakt: 15 minut temu.',
    severity: 'critical',
    timestamp: new Date().toISOString(),
    actionLink: '/resources/r6',
    actionText: 'Lokalizacja zespołu'
  },
  {
    id: '8',
    title: 'Niski poziom baterii',
    description: 'Wykryto niski poziom baterii w 3 defibrylatorach AED. Wymagane natychmiastowe ładowanie.',
    severity: 'warning',
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

export const getSeverityColor = (severity: AlertSeverity): string => {
  const colors: Record<AlertSeverity, string> = {
    critical: 'destructive',
    warning: 'warning',
    info: 'blue-500'
  };
  
  return colors[severity] || 'default';
};