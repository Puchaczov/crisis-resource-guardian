import { AlertSeverity } from '@/services/alertsService';

export const getAlertStyles = (severity: AlertSeverity) => {
  switch (severity) {
    case 'critical':
      return {
        bg: 'bg-destructive/10',
        border: 'border-destructive/50',
        text: 'text-destructive',
        badge: 'bg-destructive/20 text-destructive'
      };
    case 'warning':
      return {
        bg: 'bg-warning/10',
        border: 'border-warning/50',
        text: 'text-warning',
        badge: 'bg-warning/20 text-warning'
      };
    case 'info':
      return {
        bg: 'bg-blue-500/10',
        border: 'border-blue-500/50',
        text: 'text-blue-500',
        badge: 'bg-blue-500/20 text-blue-500'
      };
  }
};
