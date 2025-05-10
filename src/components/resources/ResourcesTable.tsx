
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Resource, ResourceCategory, ResourceStatus } from '@/types/resources';
import { filterResources, getCategoryLabel, getStatusLabel, getStatusClass, resourceCategories, resourceStatuses, resourceOrganizations } from '@/services/resourceService';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Search, FileText, Edit, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const ResourcesTable: React.FC = () => {
  const [resources, setResources] = useState<Resource[]>([]);
  const [filteredResources, setFilteredResources] = useState<Resource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<string>('');
  const [status, setStatus] = useState<string>('');
  const [organization, setOrganization] = useState<string>('');

  useEffect(() => {
    const fetchResources = async () => {
      try {
        setIsLoading(true);
        const data = await filterResources('', '', '', '');
        setResources(data);
        setFilteredResources(data);
      } catch (error) {
        console.error("Error fetching resources:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchResources();
  }, []);

  useEffect(() => {
    const applyFilters = async () => {
      try {
        setIsLoading(true);
        const data = await filterResources(search, category, status, organization);
        setFilteredResources(data);
      } catch (error) {
        console.error("Error filtering resources:", error);
      } finally {
        setIsLoading(false);
      }
    };

    applyFilters();
  }, [search, category, status, organization]);

  const clearFilters = () => {
    setSearch('');
    setCategory('');
    setStatus('');
    setOrganization('');
  };

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

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold">Lista zasobów</h1>
        <Button asChild>
          <Link to="/add-resource">
            Dodaj nowy zasób
          </Link>
        </Button>
      </div>

      <Card className="p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label htmlFor="search">Wyszukaj</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="search"
                placeholder="Szukaj zasobów..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Kategoria</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger id="category">
                <SelectValue placeholder="Wszystkie kategorie" />
              </SelectTrigger>
              <SelectContent>
                {resourceCategories.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger id="status">
                <SelectValue placeholder="Wszystkie statusy" />
              </SelectTrigger>
              <SelectContent>
                {resourceStatuses.map((stat) => (
                  <SelectItem key={stat.value} value={stat.value}>{stat.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="organization">Organizacja</Label>
            <Select value={organization} onValueChange={setOrganization}>
              <SelectTrigger id="organization">
                <SelectValue placeholder="Wszystkie organizacje" />
              </SelectTrigger>
              <SelectContent>
                {resourceOrganizations.map((org) => (
                  <SelectItem key={org.value} value={org.value}>{org.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex justify-between mt-4">
          <Button variant="outline" onClick={clearFilters}>
            Wyczyść filtry
          </Button>
          <p className="text-sm text-muted-foreground pt-2">
            Znaleziono zasobów: {filteredResources.length}
          </p>
        </div>
      </Card>

      {isLoading ? (
        <div className="text-center py-8">
          <p>Ładowanie zasobów...</p>
        </div>
      ) : (
        <div className="rounded-md border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted">
                <tr>
                  <th className="text-left py-3 px-4 text-sm font-medium">Nazwa</th>
                  <th className="text-left py-3 px-4 text-sm font-medium">Kategoria</th>
                  <th className="text-left py-3 px-4 text-sm font-medium">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-medium">Ilość</th>
                  <th className="text-left py-3 px-4 text-sm font-medium">Lokalizacja</th>
                  <th className="text-left py-3 px-4 text-sm font-medium">Organizacja</th>
                  <th className="text-left py-3 px-4 text-sm font-medium">Ostatnia aktualizacja</th>
                  <th className="text-center py-3 px-4 text-sm font-medium">Akcje</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredResources.map((resource) => (
                  <tr key={resource.id} className="hover:bg-muted/50">
                    <td className="py-3 px-4 align-middle">
                      <div className="flex items-center">
                        <span className={`status-indicator ${getStatusClass(resource.status)} mr-2`}></span>
                        <span className="font-medium">{resource.name}</span>
                      </div>
                      {resource.status === 'unavailable' && (
                        <div className="flex items-center mt-1 text-xs text-emergency">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          <span>Wymaga uwagi</span>
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4 align-middle">
                      {getCategoryLabel(resource.category as ResourceCategory)}
                    </td>
                    <td className="py-3 px-4 align-middle">
                      <Badge variant={resource.status === 'unavailable' ? "destructive" : "outline"}>
                        {getStatusLabel(resource.status as ResourceStatus)}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 align-middle">
                      {resource.quantity} {resource.unit}
                    </td>
                    <td className="py-3 px-4 align-middle">
                      <div>{resource.location.name}</div>
                      <div className="text-xs text-muted-foreground">{resource.location.address}</div>
                    </td>
                    <td className="py-3 px-4 align-middle">
                      {resource.organization}
                    </td>
                    <td className="py-3 px-4 align-middle">
                      <div className="text-sm">{formatDate(resource.lastUpdated)}</div>
                    </td>
                    <td className="py-3 px-4 align-middle">
                      <div className="flex justify-center space-x-2">
                        <Button size="icon" variant="ghost" asChild>
                          <Link to={`/resources/${resource.id}`}>
                            <FileText className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button size="icon" variant="ghost" asChild>
                          <Link to={`/resources/${resource.id}/edit`}>
                            <Edit className="h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredResources.length === 0 && (
            <div className="p-8 text-center text-muted-foreground">
              <p>Nie znaleziono zasobów spełniających kryteria filtrowania</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ResourcesTable;
