
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const RecentActivity: React.FC = () => {
  // Mock recent activity data
  const activities = [
    {
      id: 1,
      type: 'update',
      resource: 'Agregat prądotwórczy 15kVA',
      user: 'Jan Kowalski',
      organization: 'Straż Pożarna',
      timestamp: '2023-05-10T10:30:00Z',
      details: 'Zmiana statusu z "W serwisie" na "Dostępny"'
    },
    {
      id: 2,
      type: 'add',
      resource: 'Łóżka polowe',
      user: 'Anna Nowak',
      organization: 'Czerwony Krzyż',
      timestamp: '2023-05-09T14:15:00Z',
      details: 'Dodano 20 nowych łóżek polowych'
    },
    {
      id: 3,
      type: 'alert',
      resource: 'Wóz strażacki GCBA 5/32',
      user: 'System',
      organization: 'Straż Pożarna',
      timestamp: '2023-05-09T08:45:00Z',
      details: 'Niski poziom paliwa (20%)'
    },
    {
      id: 4,
      type: 'reservation',
      resource: 'Zespół ratownictwa medycznego',
      user: 'Tomasz Wiśniewski',
      organization: 'Urząd Miasta',
      timestamp: '2023-05-08T16:20:00Z',
      details: 'Zarezerwowano na akcję w dniu 15.05.2023'
    },
    {
      id: 5,
      type: 'import',
      resource: 'Różne zasoby',
      user: 'Administrator',
      organization: 'Główny Urząd',
      timestamp: '2023-05-07T11:10:00Z',
      details: 'Zaimportowano 45 zasobów z pliku XLS'
    }
  ];

  // Format the date to a more readable format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pl-PL', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'update':
        return <div className="w-2 h-2 rounded-full bg-blue-500 mr-2"></div>;
      case 'add':
        return <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>;
      case 'alert':
        return <div className="w-2 h-2 rounded-full bg-emergency mr-2"></div>;
      case 'reservation':
        return <div className="w-2 h-2 rounded-full bg-warning mr-2"></div>;
      case 'import':
        return <div className="w-2 h-2 rounded-full bg-purple-500 mr-2"></div>;
      default:
        return <div className="w-2 h-2 rounded-full bg-gray-500 mr-2"></div>;
    }
  };

  const getActivityBadge = (type: string) => {
    switch (type) {
      case 'update':
        return <Badge variant="outline" className="bg-blue-500/10 text-blue-600">Aktualizacja</Badge>;
      case 'add':
        return <Badge variant="outline" className="bg-green-500/10 text-green-600">Dodanie</Badge>;
      case 'alert':
        return <Badge variant="outline" className="bg-emergency/10 text-emergency">Alert</Badge>;
      case 'reservation':
        return <Badge variant="outline" className="bg-warning/10 text-warning-dark">Rezerwacja</Badge>;
      case 'import':
        return <Badge variant="outline" className="bg-purple-500/10 text-purple-600">Import</Badge>;
      default:
        return <Badge variant="outline">Inne</Badge>;
    }
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Ostatnia aktywność</CardTitle>
        <CardDescription>Niedawne zmiany i aktualizacje zasobów</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {activities.map((activity) => (
            <div key={activity.id} className="flex">
              <div className="mr-4 flex items-start pt-1">
                {getActivityIcon(activity.type)}
              </div>
              <div className="space-y-1 flex-1">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {activity.resource}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {activity.details}
                    </p>
                  </div>
                  {getActivityBadge(activity.type)}
                </div>
                <div className="flex justify-between text-xs text-muted-foreground pt-1">
                  <span>
                    {activity.user} ({activity.organization})
                  </span>
                  <span>{formatDate(activity.timestamp)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentActivity;
