import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, Bell, CheckCircle, XCircle, X, Zap, Droplet, HeartPulse, Truck, Home, Utensils, Users, Wrench, AlertCircle, Info } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import * as alertService from "@/services/alertsService";
import { getCategoryStyle, getSeverityLabel } from '@/services/alertsService';
import { ResourceCategory } from '@/types/resources';
import { getAlertStyles } from '@/utils/alertStyles';
import { AlertSeverity, SystemAlert } from '@/types/alerts';

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

  const getSeverityStyle = (severity: AlertSeverity) => {
    const styles = getAlertStyles(severity);
    return `${styles.border} ${styles.bg}`;
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
            Powiadomienia systemowe
          </CardTitle>
        </CardHeader>
        <CardContent className="py-6">
          <p className="text-center text-muted-foreground">Ładowanie powiadomień...</p>
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
            Powiadomienia systemowe
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
            ? `${Math.min(alerts.length, 3)} z ${alerts.length} ${alerts.length === 1 ? 'powiadomienia wymaga' : 'powiadomień wymaga'} uwagi`
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
                Aktualnie nie ma powiadomień wymagających uwagi
              </p>
            </div>
          ) : (
            getTopAlerts(alerts).map((alert) => (
              <Alert 
                key={alert.id} 
                className={`${getSeverityStyle(alert.severity)} ${getCategoryStyle(alert.category).bgColor} relative`}
                role="listitem"
              >
                <div className="flex items-start gap-3">
                  {alert.category ? getCategoryIcon(alert.category) : getSeverityIcon(alert.severity)}
                  <div className="flex-1">
                    <AlertTitle className="flex items-center gap-2">
                      {alert.title}
                      <Badge className={getAlertStyles(alert.severity).badge}>
                        {getSeverityLabel(alert.severity)}
                      </Badge>
                    </AlertTitle>
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