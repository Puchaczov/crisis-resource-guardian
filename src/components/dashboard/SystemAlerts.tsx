import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, Bell, CheckCircle, XCircle, X } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import * as alertService from "@/services/alertsService";

type AlertSeverity = 'critical' | 'warning' | 'info';

interface SystemAlert {
  id: string;
  title: string;
  description: string;
  severity: AlertSeverity;
  timestamp: string;
  actionLink?: string;
  actionText?: string;
  dismissed?: boolean;
}

const SystemAlerts: React.FC = () => {
  const [alerts, setAlerts] = useState<SystemAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const dismissAlert = async (id: string) => {
    try {
      const success = await alertService.dismissAlert(id);
      if (success) {
        setAlerts(currentAlerts => 
          currentAlerts.filter(alert => alert.id !== id)
        );
      }
    } catch (error) {
      console.error('Error dismissing alert:', error);
    }
  };

  const dismissAllAlerts = async () => {
    try {
      const success = await alertService.dismissAllAlerts();
      if (success) {
        setAlerts([]);
      }
    } catch (error) {
      console.error('Error dismissing all alerts:', error);
    }
  };

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        setIsLoading(true);
        const activeAlerts = await alertService.getActiveAlerts();
        setAlerts(activeAlerts);
      } catch (error) {
        console.error('Error fetching system alerts:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAlerts();
  }, []);

  const getSeverityIcon = (severity: AlertSeverity) => {
    switch (severity) {
      case 'critical':
        return <XCircle className="h-5 w-5 text-destructive" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-warning" />;
      case 'info':
        return <Bell className="h-5 w-5 text-blue-500" />;
    }
  };

  const getSeverityStyle = (severity: AlertSeverity) => {
    switch (severity) {
      case 'critical':
        return 'border-destructive/50 bg-destructive/10';
      case 'warning':
        return 'border-warning/50 bg-warning/10';
      case 'info':
        return 'border-blue-500/50 bg-blue-500/10';
    }
  };

  const getTopAlerts = (allAlerts: SystemAlert[]): SystemAlert[] => {
    return [...allAlerts]
      .sort((a, b) => {
        // Sort by severity first (critical > warning > info)
        const severityOrder = { critical: 3, warning: 2, info: 1 };
        const severityDiff = severityOrder[b.severity] - severityOrder[a.severity];
        
        // If severity is the same, sort by timestamp (newer first)
        if (severityDiff === 0) {
          return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
        }
        return severityDiff;
      })
      .slice(0, 3); // Get only top 3 alerts
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Alerty systemowe
          </CardTitle>
        </CardHeader>
        <CardContent className="py-6">
          <p className="text-center text-muted-foreground">Ładowanie alertów...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Alerty systemowe
          </CardTitle>
          <div className="flex items-center gap-2">
            {alerts.length > 0 && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={dismissAllAlerts}
                  className="text-xs"
                >
                  Wyczyść wszystkie
                </Button>
                {alerts.length > 3 && (
                  <Button
                    variant="secondary"
                    size="sm"
                    className="text-xs"
                    asChild
                  >
                    <Link to="/alerts">
                      Zobacz wszystkie ({alerts.length})
                    </Link>
                  </Button>
                )}
              </>
            )}
            {alerts.length === 0 && (
              <CheckCircle className="h-5 w-5 text-green-500" />
            )}
          </div>
        </div>
        <CardDescription>
          {alerts.length > 0 
            ? `${Math.min(alerts.length, 3)} z ${alerts.length} ${alerts.length === 1 ? 'alertu wymaga' : 'alertów wymaga'} uwagi`
            : 'Wszystkie systemy działają prawidłowo'
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4" role="list">
          {alerts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <CheckCircle className="h-8 w-8 text-green-500 mb-2" />
              <p className="text-muted-foreground">
                Aktualnie nie ma alertów wymagających uwagi
              </p>
            </div>
          ) : (
            getTopAlerts(alerts).map((alert) => (
              <Alert 
                key={alert.id} 
                className={`${getSeverityStyle(alert.severity)} relative`}
                role="listitem"
              >
                <div className="flex items-start gap-3">
                  {getSeverityIcon(alert.severity)}
                  <div className="flex-1">
                    <AlertTitle>{alert.title}</AlertTitle>
                    <AlertDescription className="mt-1">
                      {alert.description}
                    </AlertDescription>
                    {alert.actionLink && (
                      <div className="mt-2">
                        <Button 
                          variant="link" 
                          className="h-auto p-0 text-sm" 
                          asChild
                        >
                          <Link to={alert.actionLink}>
                            {alert.actionText}
                          </Link>
                        </Button>
                      </div>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 absolute top-2 right-2 hover:bg-background/80"
                    onClick={() => dismissAlert(alert.id)}
                  >
                    <X className="h-4 w-4" />
                    <span className="sr-only">Dismiss alert</span>
                  </Button>
                </div>
              </Alert>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default SystemAlerts;