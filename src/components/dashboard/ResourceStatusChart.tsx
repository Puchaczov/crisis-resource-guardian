
import React, { useState, useEffect, useMemo } from 'react';
import { getAllResources, getStatusLabel } from '@/services/resourceService';
import { Resource } from '@/types/resources';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const ResourceStatusChart: React.FC = () => {
  const [resources, setResources] = useState<Resource[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchResources = async () => {
      try {
        setIsLoading(true);
        const data = await getAllResources();
        setResources(data);
      } catch (error) {
        console.error("Error fetching resources for chart:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchResources();
  }, []);

  // Process data for the chart
  const chartData = useMemo(() => {
    const statusCounts = {
      available: 0,
      reserved: 0,
      unavailable: 0,
      maintenance: 0
    };
    
    resources.forEach(resource => {
      if (statusCounts[resource.status] !== undefined) {
        statusCounts[resource.status]++;
      }
    });

    return [
      {
        name: "Dostępne",
        count: statusCounts.available,
        fill: "#4ade80" // green
      },
      {
        name: "Zarezerwowane",
        count: statusCounts.reserved,
        fill: "#F18F01" // orange
      },
      {
        name: "Niedostępne",
        count: statusCounts.unavailable,
        fill: "#A31621" // red
      },
      {
        name: "W serwisie",
        count: statusCounts.maintenance,
        fill: "#94a3b8" // gray
      }
    ];
  }, [resources]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-2 border rounded shadow text-xs">
          <p className="font-semibold">{`${payload[0].name}: ${payload[0].value} zasobów`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Status zasobów</CardTitle>
        <CardDescription>Liczba zasobów w różnych stanach</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <p>Ładowanie danych...</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" name="Liczba zasobów">
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
};

export default ResourceStatusChart;
