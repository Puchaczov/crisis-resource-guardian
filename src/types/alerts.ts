import { ResourceCategory } from './resources';

export type AlertSeverity = 'critical' | 'warning' | 'info';

export interface SystemAlert {
  id: string;
  title: string;
  description: string;
  severity: AlertSeverity;
  timestamp: string;
  category?: ResourceCategory;
  actionLink?: string;
  actionText?: string;
  dismissed?: boolean;
}
