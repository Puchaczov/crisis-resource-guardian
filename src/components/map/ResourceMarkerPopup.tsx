
import React from 'react';
import { Resource } from '@/types/resources';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getCategoryLabel, getStatusLabel, getStatusClass } from '@/services/resourceService';
import { MapPin, Calendar, AlertTriangle, X, Battery, Fuel, Thermometer } from 'lucide-react';

interface ResourceMarkerPopupProps {
  resource: Resource;
  onClose?: () => void;
  variant?: 'popup' | 'card';
}

const ResourceMarkerPopup: React.FC<ResourceMarkerPopupProps> = ({ 
  resource, 
  onClose,
  variant = 'popup' 
}) => {
  // Format the date to a more readable format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pl-PL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const isEmergencyStatus = resource.status === 'unavailable';

  return (
    <Card className={`w-full ${variant === 'popup' ? 'shadow-lg' : ''}`}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg flex items-center">
            <span className={`status-indicator ${getStatusClass(resource.status)} mr-2`}></span>
            {resource.name}
          </CardTitle>
          {variant === 'popup' && onClose && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8" 
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        <div className="flex items-center text-xs text-muted-foreground">
          <MapPin className="h-3 w-3 mr-1" />
          <span>{resource.location.name}</span>
        </div>
      </CardHeader>
      
      <CardContent className="pb-3">
        <div className="mb-3 text-sm">{resource.description}</div>
        
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div>
            <p className="text-xs text-muted-foreground">Ilość</p>
            <p className="text-sm font-semibold">{resource.quantity} {resource.unit}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Status</p>
            <Badge variant={isEmergencyStatus ? "destructive" : "outline"} className="text-xs mt-1">
              {getStatusLabel(resource.status)}
            </Badge>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Kategoria</p>
            <p className="text-sm">{getCategoryLabel(resource.category)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Organizacja</p>
            <p className="text-sm">{resource.organization}</p>
          </div>
        </div>

        {resource.telemetry && (
          <div className="bg-muted/40 rounded p-2 mb-3">
            <div className="text-xs text-muted-foreground mb-1">Dane telemetryczne:</div>
            <div className="grid grid-cols-2 gap-2">
              {resource.telemetry.battery !== undefined && (
                <div className="flex items-center text-xs">
                  <Battery className="h-3 w-3 mr-1" />
                  <span>Bateria: {resource.telemetry.battery}%</span>
                </div>
              )}
              {resource.telemetry.fuel !== undefined && (
                <div className="flex items-center text-xs">
                  <Fuel className="h-3 w-3 mr-1" />
                  <span>Paliwo: {resource.telemetry.fuel}%</span>
                </div>
              )}
              {resource.telemetry.temperature !== undefined && (
                <div className="flex items-center text-xs">
                  <Thermometer className="h-3 w-3 mr-1" />
                  <span>Temp: {resource.telemetry.temperature}°C</span>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="flex items-center text-xs text-muted-foreground">
          <Calendar className="h-3 w-3 mr-1" />
          <span>Ostatnia aktualizacja: {formatDate(resource.lastUpdated)}</span>
        </div>

        {isEmergencyStatus && (
          <div className="flex items-center mt-3 text-xs text-emergency">
            <AlertTriangle className="h-3 w-3 mr-1" />
            <span>Zasób niedostępny - wymaga uwagi!</span>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="pt-0">
        <Button size="sm" className="w-full">
          Szczegóły zasobu
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ResourceMarkerPopup;
