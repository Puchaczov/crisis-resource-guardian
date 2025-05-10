
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAllResources, getResourcesByCategory, getResourcesByStatus } from '@/services/resourceService';
import { Resource, ResourceCategory, ResourceStatus } from '@/types/resources';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { AlertTriangle, Battery, CheckCircle } from "lucide-react";

const ResourceSummary: React.FC = () => {
  const [totalResources, setTotalResources] = useState(0);
  const [availableResources, setAvailableResources] = useState(0);
  const [unavailableResources, setUnavailableResources] = useState(0);
  const [criticalResources, setCriticalResources] = useState<Resource[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch all resources
        const allResources = await getAllResources();
        setTotalResources(allResources.length);
        
        // Fetch available resources
        const available = await getResourcesByStatus('available');
        setAvailableResources(available.length);
        
        // Fetch unavailable resources
        const unavailable = await getResourcesByStatus('unavailable');
        setUnavailableResources(unavailable.length);
        
        // Find critical resources (unavailable or with low battery/fuel)
        const critical = allResources.filter(resource => {
          if (resource.status === 'unavailable') return true;
          
          if (resource.telemetry) {
            if (
              (resource.telemetry.battery !== undefined && resource.telemetry.battery < 20) ||
              (resource.telemetry.fuel !== undefined && resource.telemetry.fuel < 20)
            ) {
              return true;
            }
          }
          
          return false;
        });
        
        setCriticalResources(critical);
      } catch (error) {
        console.error("Error fetching resource summary:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  const availabilityPercentage = totalResources > 0 
    ? Math.round((availableResources / totalResources) * 100) 
    : 0;
    
  return (
    <div className="space-y-6">
      {isLoading ? (
        <div className="text-center py-4">
          <p>Ładowanie danych...</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xl">Całkowita liczba zasobów</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold">{totalResources}</div>
                <p className="text-sm text-muted-foreground mt-2">
                  Wszystkie zasoby w systemie
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xl">Dostępność zasobów</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-end gap-2">
                  <div className="text-4xl font-bold">{availableResources}</div>
                  <div className="text-xl text-muted-foreground mb-1">/ {totalResources}</div>
                </div>
                <div className="mt-2 space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>Dostępne</span>
                    <span>{availabilityPercentage}%</span>
                  </div>
                  <Progress value={availabilityPercentage} className="h-2" />
                </div>
              </CardContent>
            </Card>
            
            <Card className={unavailableResources > 0 ? "border-emergency/50" : ""}>
              <CardHeader className="pb-2">
                <CardTitle className="text-xl flex items-center">
                  {unavailableResources > 0 && (
                    <AlertTriangle className="h-5 w-5 text-emergency mr-2" />
                  )}
                  Zasoby wymagające uwagi
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold">
                  {unavailableResources}
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Zasoby niedostępne lub wymagające interwencji
                </p>
              </CardContent>
              {unavailableResources > 0 && (
                <CardFooter className="pt-0">
                  <Link to="/resources" className="text-emergency hover:underline text-sm">
                    Zobacz zasoby wymagające uwagi
                  </Link>
                </CardFooter>
              )}
            </Card>
          </div>
          
          {criticalResources.length > 0 && (
            <Card className="border-emergency/50">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <AlertTriangle className="h-5 w-5 text-emergency mr-2" />
                  Zasoby w stanie krytycznym
                </CardTitle>
                <CardDescription>
                  Te zasoby wymagają natychmiastowej uwagi
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {criticalResources.slice(0, 5).map((resource) => (
                    <div key={resource.id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className={resource.status === 'unavailable' ? 'emergency-status-indicator' : 'status-indicator status-indicator-warning'}></div>
                        <div>
                          <p className="font-medium">{resource.name}</p>
                          <p className="text-sm text-muted-foreground">{resource.location.name}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center">
                        {resource.status === 'unavailable' && (
                          <span className="text-xs text-emergency mr-4">Niedostępny</span>
                        )}
                        
                        {resource.telemetry?.battery !== undefined && resource.telemetry.battery < 20 && (
                          <div className="flex items-center text-xs text-warning mr-4">
                            <Battery className="h-3 w-3 mr-1" />
                            <span>{resource.telemetry.battery}%</span>
                          </div>
                        )}
                        
                        <Link 
                          to={`/resources/${resource.id}`}
                          className="text-xs underline hover:text-primary"
                        >
                          Szczegóły
                        </Link>
                      </div>
                    </div>
                  ))}
                  
                  {criticalResources.length > 5 && (
                    <div className="text-center pt-2">
                      <Link to="/resources" className="text-sm text-muted-foreground hover:text-primary">
                        + {criticalResources.length - 5} więcej zasobów
                      </Link>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
          
          {criticalResources.length === 0 && (
            <Card className="border-green-500/30 bg-green-50/30">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                  Wszystkie zasoby w dobrym stanie
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p>Nie wykryto zasobów w stanie krytycznym.</p>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
};

export default ResourceSummary;
