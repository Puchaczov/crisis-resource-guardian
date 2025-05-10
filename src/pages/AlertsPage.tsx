import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, AlertCircle, Info, Bell, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  getAllAlerts,
  dismissAlert,
  dismissAllAlerts,
  SystemAlert,
  AlertSeverity,
  getSeverityLabel
} from '@/services/alertsService';

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
    switch (severity) {
      case 'critical':
        return <AlertTriangle className="h-5 w-5 text-destructive" />;
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-warning" />;
      case 'info':
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  const getSeverityClass = (severity: AlertSeverity) => {
    switch (severity) {
      case 'critical':
        return 'bg-destructive/10 text-destructive';
      case 'warning':
        return 'bg-warning/10 text-warning-dark';
      case 'info':
        return 'bg-blue-500/10 text-blue-600';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Alerty systemowe</h1>
          <p className="text-muted-foreground">
            Monitorowanie alertów i powiadomień systemowych
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
          <p>Ładowanie alertów...</p>
        </div>
      ) : alerts.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8">
            <Bell className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground">Brak aktywnych alertów</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {alerts.map((alert) => (
            <Card key={alert.id} className={`${alert.dismissed ? 'opacity-60' : ''}`}>
              <CardHeader className="flex flex-row items-start justify-between space-y-0">
                <div className="flex items-start gap-4">
                  {getSeverityIcon(alert.severity)}
                  <div>
                    <CardTitle className="text-base">{alert.title}</CardTitle>
                    <CardDescription className="mt-1.5">
                      {alert.description}
                    </CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={getSeverityClass(alert.severity)}>
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
                  <div className="text-muted-foreground">
                    {new Date(alert.timestamp).toLocaleString('pl-PL')}
                  </div>
                  {alert.actionLink && (
                    <Button variant="link" asChild className="p-0">
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