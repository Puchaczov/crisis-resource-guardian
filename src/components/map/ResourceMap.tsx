import React, { useState, useEffect, useRef } from 'react';
import { getAllResources } from '@/services/resourceService';
import { Resource, ResourceCategory, ResourceStatus } from '@/types/resources';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { resourceCategories, resourceStatuses, resourceOrganizations } from '@/services/resourceService';
import ResourceMarkerPopup from './ResourceMarkerPopup';
import { Map as MapIcon, Search } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

// Custom icon for markers
const getStatusIcon = (status: ResourceStatus) => {
  let iconUrl = '/placeholder.svg'; // Default icon
  let iconColor = 'gray';

  switch (status) {
    case 'available':
      iconColor = 'green';
      break;
    case 'reserved':
      iconColor = 'orange';
      break;
    case 'unavailable':
      iconColor = 'red';
      break;
    case 'maintenance':
      iconColor = 'blue';
      break;
  }

  // More specific icons can be used here if available
  // For simplicity, we'll use colored circles as placeholders
  const svgIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><circle cx="12" cy="12" r="10" fill="${iconColor}" stroke="white" stroke-width="2"/></svg>`;
  
  return L.divIcon({
    html: svgIcon,
    className: 'custom-leaflet-icon', // Add a class for potential further styling
    iconSize: [24, 24],
    iconAnchor: [12, 24],
    popupAnchor: [0, -24]
  });
};

const getStatusClass = (status: ResourceStatus): string => {
  switch (status) {
    case 'available':
      return 'status-indicator-available';
    case 'reserved':
      return 'status-indicator-reserved';
    case 'unavailable':
      return 'status-indicator-unavailable';
    case 'maintenance':
      return 'status-indicator-maintenance';
    default:
      return '';
  }
};

const ResourceMap: React.FC = () => {
  const [resources, setResources] = useState<Resource[]>([]);
  const [filteredResources, setFilteredResources] = useState<Resource[]>([]);
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
  const [search, setSearch] = useState('');  const [category, setCategory] = useState<string>('all');
  const [status, setStatus] = useState<string>('all');
  const [organization, setOrganization] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('map');

  useEffect(() => {
    const fetchResources = async () => {
      try {
        setIsLoading(true);
        const data = await getAllResources();
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
    const filtered = resources.filter((resource) => {
      const matchesSearch = search
        ? resource.name.toLowerCase().includes(search.toLowerCase()) ||
          resource.description.toLowerCase().includes(search.toLowerCase()) ||
          resource.location.name.toLowerCase().includes(search.toLowerCase())
        : true;
        const matchesCategory = category === 'all' ? true : resource.category === category;
      const matchesStatus = status === 'all' ? true : resource.status === status;
      const matchesOrganization = organization === 'all' ? true : resource.organization === organization;

      return matchesSearch && matchesCategory && matchesStatus && matchesOrganization;
    });

    setFilteredResources(filtered);
  }, [search, category, status, organization, resources]);

  const handleResourceClick = (resource: Resource | null) => {
    setSelectedResource(resource);
  };
  const clearFilters = () => {
    setSearch('');
    setCategory('all');
    setStatus('all');
    setOrganization('all');
  };

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col">
      <h1 className="text-2xl font-bold mb-4">Mapa zasobów</h1>
      
      <div className="flex-1 flex flex-col md:flex-row gap-4">
        <Card className="w-full md:w-80 flex flex-col">
          <CardContent className="pt-6">
            <Tabs defaultValue="filters" className="h-full flex flex-col">
              <TabsList className="grid grid-cols-2 mb-4">
                <TabsTrigger value="filters">Filtry</TabsTrigger>
                <TabsTrigger value="info">Informacje</TabsTrigger>
              </TabsList>
              
              <TabsContent value="filters" className="flex-1 space-y-4">
                <div className="space-y-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
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

                <div className="pt-2">
                  <Button 
                    onClick={clearFilters} 
                    variant="outline" 
                    className="w-full"
                  >
                    Wyczyść filtry
                  </Button>
                </div>

                <div className="pt-2">
                  <p className="text-sm text-muted-foreground">
                    Znaleziono zasobów: {filteredResources.length}
                  </p>
                </div>
              </TabsContent>
              
              <TabsContent value="info">
                <div className="space-y-4">
                  <h3 className="font-medium">Legenda statusów:</h3>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <span className="status-indicator status-indicator-available mr-2"></span>
                      <span>Dostępny</span>
                    </div>
                    <div className="flex items-center">
                      <span className="status-indicator status-indicator-reserved mr-2"></span>
                      <span>Zarezerwowany</span>
                    </div>
                    <div className="flex items-center">
                      <span className="status-indicator status-indicator-unavailable mr-2"></span>
                      <span>Niedostępny</span>
                    </div>
                    <div className="flex items-center">
                      <span className="status-indicator status-indicator-maintenance mr-2"></span>
                      <span>W serwisie</span>
                    </div>
                  </div>
                  
                  <div className="pt-4">
                    <p className="text-sm text-muted-foreground">
                      Kliknij na marker zasobu na mapie, aby zobaczyć szczegółowe informacje.
                    </p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
        
        <div className="flex-1 flex flex-col overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
            <TabsList className="grid grid-cols-2 w-60 mb-4">
              <TabsTrigger value="map">Widok mapy</TabsTrigger>
              <TabsTrigger value="list">Widok listy</TabsTrigger>
            </TabsList>
            
            <TabsContent value="map" className="flex-1">
              <div className="h-full relative">
                {isLoading ? (
                  <div className="h-full flex items-center justify-center">
                    <p>Ładowanie mapy...</p>
                  </div>
                ) : (
                  <MapContainer center={[52.2297, 21.0122]} zoom={13} scrollWheelZoom={true} className="h-full w-full rounded-lg">
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    {filteredResources.map(resource => (
                      <Marker 
                        key={resource.id} 
                        position={[resource.location.coordinates.lat, resource.location.coordinates.lng]}
                        icon={getStatusIcon(resource.status)}
                        eventHandlers={{
                          click: () => {
                            handleResourceClick(resource);
                          },
                        }}
                      >
                        {/* Popup is handled globally now based on selectedResource */}
                      </Marker>
                    ))}
                    {selectedResource && (
                       <Popup position={[selectedResource.location.coordinates.lat, selectedResource.location.coordinates.lng]}>
                         <div className="w-80"> {/* Ensure popup has some width */}
                          <ResourceMarkerPopup
                            resource={selectedResource}
                            onClose={() => setSelectedResource(null)}
                          />
                         </div>
                       </Popup>
                    )}
                  </MapContainer>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="list" className="h-full overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredResources.map(resource => (
                  <ResourceMarkerPopup 
                    key={resource.id} 
                    resource={resource}
                    variant="card"
                  />
                ))}
                
                {filteredResources.length === 0 && (
                  <div className="col-span-full py-8 text-center text-muted-foreground">
                    <p>Nie znaleziono zasobów spełniających kryteria filtrowania</p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default ResourceMap;
