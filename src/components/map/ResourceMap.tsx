import React, { useState, useEffect, useRef } from 'react';
import { getAllResources } from '@/services/resourceService';
import { Resource, ResourceStatus } from '@/types/resources';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { resourceCategories, resourceStatuses, resourceOrganizations } from '@/services/resourceService';
import ResourceMarkerPopup from './ResourceMarkerPopup';
import { Map as MapIcon, Search } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, GeoJSON } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import shp, { parseShp, parseDbf, combine } from 'shpjs';
import { reproject } from 'reproject';
import proj4 from 'proj4';

// Define EPSG:2180 (PUWG 1992 / Poland CS92) for proj4
proj4.defs('EPSG:2180', '+proj=tmerc +lat_0=0 +lon_0=19 +k=0.9993 +x_0=500000 +y_0=-5300000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs');

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
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<string>('all');
  const [status, setStatus] = useState<string>('all');
  const [organization, setOrganization] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('map');
  const [mapGeoJsonLayers, setMapGeoJsonLayers] = useState<any[]>([]); 
  const mapRef = useRef<L.Map | null>(null); // Ref to access map instance

  // Effect for fetching initial resources
  useEffect(() => {
    const fetchInitialResources = async () => {
      try {
        setIsLoading(true);
        const resourceData = await getAllResources();
        setResources(resourceData);
        setFilteredResources(resourceData); 
      } catch (error) {
        console.error("Error fetching initial resources:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialResources();
  }, []);

  // Effect for updating commune layers based on filtered resources
  useEffect(() => {
    const updateCommuneLayers = async () => {
      if (isLoading) return; // Don't run if initial resources are still loading

      if (filteredResources.length === 0) {
        setMapGeoJsonLayers([]); // Clear layers if no resources are filtered
        return;
      }

      try {
        const locations = filteredResources.map(resource => ({
          lat: resource.location.coordinates.lat,
          lon: resource.location.coordinates.lng
        }));
        
        const uniqueLocationStrings = new Set(locations.map(loc => JSON.stringify(loc)));
        const uniqueLocations = Array.from(uniqueLocationStrings).map(str => JSON.parse(str));

        if (uniqueLocations.length === 0) {
          setMapGeoJsonLayers([]); // Clear layers if no unique locations
          return;
        }

        const communesResponse = await fetch('http://127.0.0.1:8000/find_communes/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(uniqueLocations)
        });

        if (!communesResponse.ok) {
          console.error(`HTTP error! status: ${communesResponse.status} for /find_communes/`);
          setMapGeoJsonLayers([]); // Clear layers on error
          return;
        }
        
        const communeApiResults: { input_coordinate: { lat: number; lon: number }; commune_name: string; status: string }[] = await communesResponse.json();
        
        const foundCommuneNames = communeApiResults
          .filter(result => result.status === 'found' && result.commune_name)
          .map(result => result.commune_name);
        
        const uniqueCommuneNames = [...new Set(foundCommuneNames)];

        if (uniqueCommuneNames.length === 0) {
          setMapGeoJsonLayers([]); // Clear layers if no communes found for filtered resources
          return;
        }

        const communeShapefilePromises = uniqueCommuneNames.map(async (name) => {
          const shapefilePath = `/files/gminy_JPT_NAZWA__${name}.shp`;
          const dbfFilePath = `/files/gminy_JPT_NAZWA__${name}.dbf`;
          try {
            const [shpResponse, dbfResponse] = await Promise.all([
              fetch(shapefilePath),
              fetch(dbfFilePath)
            ]);

            if (!shpResponse.ok || !dbfResponse.ok) {
              console.warn(`SHP or DBF file for commune ${name} not found or error. SHP: ${shpResponse.status}, DBF: ${dbfResponse.status}`);
              return null;
            }

            const shpBuffer = await shpResponse.arrayBuffer();
            const dbfBuffer = await dbfResponse.arrayBuffer();
            
            const features = parseShp(shpBuffer);
            const attributes = (parseDbf as any)(dbfBuffer, 'UTF-8'); 
            const geojson = combine([features, attributes]);
            
            const sourceProjection = 'EPSG:2180'; 
            const targetProjection = 'EPSG:4326';
            const reprojectedGeoJson = reproject(geojson, sourceProjection, targetProjection, proj4.defs);
            return reprojectedGeoJson;
          } catch (error) {
            console.error(`Error loading, parsing, or reprojecting shapefile/dbf for commune ${name}:`, error);
            return null;
          }
        });

        const newCommuneGeoJsonLayers = (await Promise.all(communeShapefilePromises)).filter(Boolean);
        
        setMapGeoJsonLayers(newCommuneGeoJsonLayers); 
        console.log('Updated commune GeoJSON layers (count):', newCommuneGeoJsonLayers.length);

      } catch (error) {
        console.error("Error updating commune layers based on filtered resources:", error);
        setMapGeoJsonLayers([]); // Clear layers on error
      }
    };

    updateCommuneLayers();
  }, [filteredResources, isLoading]);

  useEffect(() => {
    setFilteredResources(resources.filter((resource) => {
      const matchesSearch = search
        ? resource.name.toLowerCase().includes(search.toLowerCase()) ||
          resource.description.toLowerCase().includes(search.toLowerCase()) ||
          resource.location.name.toLowerCase().includes(search.toLowerCase())
        : true;
      const matchesCategory = category === 'all' ? true : resource.category === category;
      const matchesStatus = status === 'all' ? true : resource.status === status;
      const matchesOrganization = organization === 'all' ? true : resource.organization === organization;

      return matchesSearch && matchesCategory && matchesStatus && matchesOrganization;
    }));
  }, [search, category, status, organization, resources]);

  // Effect for centering map on filtered resources
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return; // Map not yet available

    if (filteredResources.length > 0) {
      if (filteredResources.length === 1) {
        const resource = filteredResources[0];
        map.flyTo([resource.location.coordinates.lat, resource.location.coordinates.lng], 13); // Zoom level 13 for a single point
      } else {
        const bounds = L.latLngBounds(
          filteredResources.map(resource => [
            resource.location.coordinates.lat,
            resource.location.coordinates.lng
          ])
        );
        if (bounds.isValid()) {
          map.flyToBounds(bounds, { padding: [50, 50], maxZoom: 16 });
        }
      }
    } 
    // else {
    //   // Optional: Reset to default view if no resources are filtered and map is not manually panned/zoomed
    //   // For now, do nothing to respect user's manual map navigation
    //   // map.flyTo([52.2297, 21.0122], 6); 
    // }
  }, [filteredResources]); // Re-run when filteredResources changes

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
                  <MapContainer 
                    ref={mapRef} // Use ref to get the map instance
                    center={[52.2297, 21.0122]} 
                    zoom={6} 
                    scrollWheelZoom={true} 
                    className="h-full w-full rounded-lg"
                  >
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    {mapGeoJsonLayers.map((geoJsonData, index) => (
                      <GeoJSON 
                        key={`geojson-layer-${index}`} 
                        data={geoJsonData} 
                        style={(feature) => {
                          return {
                            color: "#FF6347",
                            weight: 1,
                            opacity: 0.8,
                            fillOpacity: 0.25
                          };
                        }}
                        onEachFeature={(feature, layer) => {
                          const nameProperty = feature.properties?.JPT_NAZWA_ || feature.properties?.name || feature.properties?.NAZWA;
                          if (nameProperty) { 
                            layer.bindPopup(String(nameProperty));
                          }
                        }}
                      />
                    ))}
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
                      </Marker>
                    ))}
                    {selectedResource && (
                       <Popup position={[selectedResource.location.coordinates.lat, selectedResource.location.coordinates.lng]}>
                         <div className="w-80">
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
