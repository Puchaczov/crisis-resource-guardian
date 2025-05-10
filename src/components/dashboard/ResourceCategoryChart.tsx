
import React, { useState, useEffect, useMemo } from 'react';
import { getAllResources, getCategoryLabel } from '@/services/resourceService';
import { Resource, ResourceCategory } from '@/types/resources';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const COLORS = ['#1A3A5F', '#A31621', '#F18F01', '#1E847F', '#5C946E', '#8D6A9F', '#DB7F8E', '#3D5A80', '#98C1D9'];

const ResourceCategoryChart: React.FC = () => {
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
    const categoryCounts: Record<string, number> = {};
    
    resources.forEach(resource => {
      if (!categoryCounts[resource.category]) {
        categoryCounts[resource.category] = 0;
      }
      categoryCounts[resource.category]++;
    });

    return Object.entries(categoryCounts)
      .map(([category, count]) => ({
        name: getCategoryLabel(category as ResourceCategory),
        value: count,
        color: COLORS[Math.floor(Math.random() * COLORS.length)]
      }))
      .sort((a, b) => b.value - a.value);
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
        <CardTitle>Zasoby wg kategorii</CardTitle>
        <CardDescription>Podział zasobów na kategorie</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <p>Ładowanie danych...</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                fill="#8884d8"
                paddingAngle={1}
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                labelLine={false}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend
                layout="vertical"
                verticalAlign="middle"
                align="right"
                wrapperStyle={{ fontSize: '12px' }}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
};

export default ResourceCategoryChart;
