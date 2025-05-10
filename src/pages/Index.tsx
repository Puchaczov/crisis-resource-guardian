import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import ResourceSummary from "@/components/dashboard/ResourceSummary";
import RecentActivity from "@/components/dashboard/RecentActivity";
import SystemAlerts from "@/components/dashboard/SystemAlerts";
import { Button } from "@/components/ui/button";
import { Map, Database } from "lucide-react";

const Index = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const isReporter = user?.role === 'reporter';

  if (!user) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Podsumowanie</h1>
          <p className="text-muted-foreground">
            Witaj, {user.name}! Oto przegląd zasobów kryzysowych.
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link to="/map">
              <Map className="mr-2 h-4 w-4" />
              Mapa zasobów
            </Link>
          </Button>
          {(isAdmin || isReporter) && (
            <Button asChild>
              <Link to="/add-resource">
                <Database className="mr-2 h-4 w-4" />
                Dodaj zasób
              </Link>
            </Button>
          )}
        </div>
      </div>

      <ResourceSummary />
      <SystemAlerts />
      <RecentActivity />
    </div>
  );
};

export default Index;
