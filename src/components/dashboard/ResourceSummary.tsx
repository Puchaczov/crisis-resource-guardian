import React, { useState, useEffect } from 'react';
import { getResourceStats } from '@/services/resourceService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface ResourceStats {
  foodSupply: {
    ownResources: number;
    privateResources: number;
    requiredDays: number;
  };
  hospitalBeds: {
    total: number;
    available: number;
    bedsPerTenThousand: number;
    availabilityPercentage: number;
  };
}

const getAvailabilityColor = (percentage: number): string => {
  const normalized = percentage / 100;
  const red = normalized < 0.5 ? 255 : Math.round(255 * (1 - normalized) * 2);
  const green = normalized > 0.5 ? 255 : Math.round(255 * normalized * 2);
  return `rgb(${red}, ${green}, 0)`;
};

const getResourceColor = (days: number, requiredDays: number): string => {
  if (days >= requiredDays) {
    return 'bg-green-500';
  }
  return 'bg-red-500';
};

const ResourceSummary: React.FC = () => {
  const [stats, setStats] = useState<ResourceStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const fetchStats = async () => {
      try {
        setIsLoading(true);
        const resourceStats = await getResourceStats();
        if (mounted) {
          console.log('Initial stats fetched:', resourceStats);
          setStats(resourceStats);
        }
      } catch (error) {
        console.error("Error fetching resource statistics:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchStats();

    const updateInterval = setInterval(() => {
      setStats(prevStats => {
        if (!prevStats) return prevStats;

        const randomChange = (value: number, maxChange: number, shouldRound = false) => {
          const change = (Math.random() - 0.5) * maxChange;
          const newValue = Math.max(0, value + change);
          return shouldRound ? Math.round(newValue) : Number(newValue.toFixed(1));
        };

        const newStats = {
          foodSupply: {
            ...prevStats.foodSupply,
            // Increased to 2.0 to guarantee more frequent integer changes
            ownResources: randomChange(prevStats.foodSupply.ownResources, 2.0, true),
            privateResources: randomChange(prevStats.foodSupply.privateResources, 2.0, true),
          },
          hospitalBeds: {
            ...prevStats.hospitalBeds,
            // Increased to 20 for more noticeable changes
            available: Math.round(randomChange(prevStats.hospitalBeds.available, 20, true)),
          }
        };

        // Calculate derived values
        newStats.hospitalBeds.availabilityPercentage = 
          Math.round((newStats.hospitalBeds.available / newStats.hospitalBeds.total) * 100);
        newStats.hospitalBeds.bedsPerTenThousand = 
          Number(((newStats.hospitalBeds.available / 1000000) * 10000).toFixed(1));

        console.log('Stats updated:', newStats);
        return newStats;
      });
    }, 5000); // Reduced to 5 seconds for easier testing

    return () => {
      mounted = false;
      clearInterval(updateInterval);
    };
  }, []);

  return (
    <div className="space-y-6">
      {isLoading ? (
        <div className="text-center py-4">
          <p>Ładowanie danych...</p>
        </div>
      ) : (
        stats && (
          <>
            {/* Food Supply Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Zapas żywności</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Liczba dni zapasu żywności (wymagane minimum: {stats.foodSupply.requiredDays} dni)
                    </p>
                    <div className="relative w-full h-8 bg-gray-200 rounded">
                      <div
                        className={`absolute top-0 left-0 h-8 rounded-l transition-all duration-300 ${getResourceColor(stats.foodSupply.ownResources, stats.foodSupply.requiredDays)}`}
                        style={{
                          width: `${(stats.foodSupply.ownResources / Math.max(stats.foodSupply.ownResources + stats.foodSupply.privateResources, 30)) * 100}%`,
                        }}
                      >
                        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-white text-sm">
                          {stats.foodSupply.ownResources} dni
                        </span>
                      </div>
                      <div
                        className="absolute top-0 h-8 bg-purple-500 rounded-r"
                        style={{
                          left: `${(stats.foodSupply.ownResources / Math.max(stats.foodSupply.ownResources + stats.foodSupply.privateResources, 30)) * 100}%`,
                          width: `${(stats.foodSupply.privateResources / Math.max(stats.foodSupply.ownResources + stats.foodSupply.privateResources, 30)) * 100}%`,
                        }}
                      >
                        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-white text-sm">
                          +{stats.foodSupply.privateResources} dni
                        </span>
                      </div>
                      <div 
                        className="absolute top-0 h-8 border-l-2 border-yellow-400"
                        style={{
                          left: `${(stats.foodSupply.requiredDays / Math.max(stats.foodSupply.ownResources + stats.foodSupply.privateResources, 30)) * 100}%`,
                        }}
                      >
                        <span className="absolute bottom-[-24px] -translate-x-1/2 text-xs text-yellow-600 whitespace-nowrap">
                          Wymagane
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col text-sm mt-2 gap-1">
                      <span>
                        Zasoby własne: {stats.foodSupply.ownResources} dni 
                        {stats.foodSupply.ownResources >= stats.foodSupply.requiredDays ? '✓' : '⚠️'}
                      </span>
                      <span>Zasoby prywatne: {stats.foodSupply.privateResources} dni</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Hospital Beds Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Dostępność łóżek szpitalnych</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Dostępne łóżka</p>
                    <div className="relative w-full h-8 bg-gray-200 rounded">
                      <div
                        className="absolute top-0 left-0 h-8 rounded transition-all duration-300"
                        style={{
                          width: `${stats.hospitalBeds.availabilityPercentage}%`,
                          backgroundColor: getAvailabilityColor(stats.hospitalBeds.availabilityPercentage),
                        }}
                      >
                        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-white text-sm">
                          {stats.hospitalBeds.available} z {stats.hospitalBeds.total} łóżek
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                      {stats.hospitalBeds.bedsPerTenThousand} dostępnych łóżek na 10 000 mieszkańców
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )
      )}
    </div>
  );
};

export default ResourceSummary;
