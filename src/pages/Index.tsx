
import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import ResourceSummary from "@/components/dashboard/ResourceSummary";
import ResourceCategoryChart from "@/components/dashboard/ResourceCategoryChart";
import ResourceStatusChart from "@/components/dashboard/ResourceStatusChart";
import RecentActivity from "@/components/dashboard/RecentActivity";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, Database, Map, Upload, Settings } from "lucide-react";

const Index = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const isReporter = user?.role === 'reporter';

  if (!user) {
    return null; // User will be redirected by the AppLayout component
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
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
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ResourceCategoryChart />
        <ResourceStatusChart />
      </div>
      
      <RecentActivity />
      
      {isAdmin && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Upload className="h-5 w-5 mr-2" />
                Import danych
              </CardTitle>
              <CardDescription>
                Importuj dane z plików Excel lub CSV
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm">
                Masz pliki z danymi o zasobach w formacie XLS lub CSV? 
                Zaimportuj je, aby szybko dodać wiele zasobów jednocześnie.
              </p>
            </CardContent>
            <CardFooter>
              <Button asChild variant="outline" className="w-full">
                <Link to="/import">
                  Importuj dane
                </Link>
              </Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2" />
                Raporty sytuacyjne
              </CardTitle>
              <CardDescription>
                Przegląd raportów o zasobach i wydarzeniach
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm">
                Przejrzyj raporty i zgłoszenia od terenowych zespołów i koordynatorów. 
                Monitoruj status zasobów w czasie rzeczywistym.
              </p>
            </CardContent>
            <CardFooter>
              <Button asChild variant="outline" className="w-full">
                <Link to="/reports">
                  Zobacz raporty
                </Link>
              </Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="h-5 w-5 mr-2" />
                Ustawienia systemu
              </CardTitle>
              <CardDescription>
                Konfiguruj parametry i uprawnienia
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm">
                Zarządzaj użytkownikami, organizacjami i uprawnieniami.
                Konfiguruj integracje z zewnętrznymi systemami.
              </p>
            </CardContent>
            <CardFooter>
              <Button asChild variant="outline" className="w-full">
                <Link to="/settings">
                  Konfiguruj
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Index;
