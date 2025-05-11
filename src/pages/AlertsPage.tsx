import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, Bell, CheckCircle2, XCircle, X, Zap, Droplet, HeartPulse, Truck, Home, Utensils, Users, Wrench, AlertCircle, Info } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertSeverity, SystemAlert } from '@/types/alerts';
import {
  getAllAlerts,
  dismissAlert,
  dismissAllAlerts,
  getSeverityLabel,
  getSeverityColor,
  getCategoryStyle,
  getCategoryLabel
} from '@/services/alertsService';
import { ResourceCategory } from '@/types/resources';
import { getAlertStyles } from '@/utils/alertStyles';

const AlertsPage = () => {
  const [alerts, setAlerts] = useState<SystemAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAlerts();
  }, []);

  const loadAlerts = async () => {
    try {
      setIsLoading(true);
      const data = await getAllAlerts();
      setAlerts(data);
    } catch (error) {
      console.error('Error loading alerts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDismiss = async (id: string) => {
    await dismissAlert(id);
    loadAlerts();
  };

  const handleDismissAll = async () => {
    await dismissAllAlerts();
    loadAlerts();
  };

  const getSeverityIcon = (severity: AlertSeverity) => {
    const styles = getAlertStyles(severity);
    switch (severity) {
      case 'critical':
        return <XCircle className={`h-5 w-5 ${styles.text}`} />;
      case 'warning':
        return <AlertTriangle className={`h-5 w-5 ${styles.text}`} />;
      case 'info':
        return <Info className={`h-5 w-5 ${styles.text}`} />;
    }
  };

  const getSeverityClass = (severity: AlertSeverity) => {
    const styles = getAlertStyles(severity);
    return styles.badge;
  };

  const getCategoryIcon = (category?: ResourceCategory) => {
    const style = getCategoryStyle(category);
    switch (style.icon) {
      case 'zap': return <Zap className={`h-5 w-5 ${style.textColor}`} />;
      case 'droplet': return <Droplet className={`h-5 w-5 ${style.textColor}`} />;
      case 'heart-pulse': return <HeartPulse className={`h-5 w-5 ${style.textColor}`} />;
      case 'truck': return <Truck className={`h-5 w-5 ${style.textColor}`} />;
      case 'home': return <Home className={`h-5 w-5 ${style.textColor}`} />;
      case 'utensils': return <Utensils className={`h-5 w-5 ${style.textColor}`} />;
      case 'users': return <Users className={`h-5 w-5 ${style.textColor}`} />;
      case 'wrench': return <Wrench className={`h-5 w-5 ${style.textColor}`} />;
      default: return <AlertCircle className={`h-5 w-5 ${style.textColor}`} />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Powiadomienia systemowe</h1>
          <p className="text-muted-foreground">
            Monitorowanie powiadomień systemowych
          </p>
        </div>
        {alerts.length > 0 && (
          <Button variant="outline" onClick={handleDismissAll}>
            <CheckCircle2 className="mr-2 h-4 w-4" />
            Oznacz wszystkie jako przeczytane
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-32">
          <p>Ładowanie powiadomień...</p>
        </div>
      ) : alerts.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8">
            <Bell className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground">Brak aktywnych powiadomień</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {alerts.map((alert) => (
            <Card 
              key={alert.id} 
              className={`${alert.dismissed ? 'opacity-60' : ''} ${getCategoryStyle(alert.category).bgColor}`}
            >
              <CardHeader className="flex flex-row items-start justify-between space-y-0">
                <div className="flex items-start gap-4">
                  {alert.category ? getCategoryIcon(alert.category) : getSeverityIcon(alert.severity)}
                  <div>
                    <CardTitle className="text-base">{alert.title}</CardTitle>
                    <CardDescription className="mt-1.5">
                      {alert.description}
                    </CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {alert.category && (
                    <Badge 
                      variant="secondary"
                      className={`${getCategoryStyle(alert.category).bgColor} ${getCategoryStyle(alert.category).textColor}`}
                    >
                      {getCategoryLabel(alert.category)}
                    </Badge>
                  )}
                  <Badge 
                    className={getSeverityClass(alert.severity)}
                  >
                    {getSeverityLabel(alert.severity)}
                  </Badge>
                  {!alert.dismissed && (
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleDismiss(alert.id)}
                    >
                      Oznacz jako przeczytane
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center text-sm">
                  <div className={`text-muted-foreground ${getCategoryStyle(alert.category).textColor}`}>
                    {new Date(alert.timestamp).toLocaleString('pl-PL')}
                  </div>
                  {alert.actionLink && (
                    <Button variant="link" asChild className={`p-0 ${getCategoryStyle(alert.category).textColor}`}>
                      <Link to={alert.actionLink}>{alert.actionText}</Link>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AlertsPage;