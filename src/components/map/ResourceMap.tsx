import React, { useState, useEffect, useRef, useMemo } from 'react';
import { getAllResources } from '@/services/resourceService';
import { Resource, ResourceStatus } from '@/types/resources';
import { Card, CardContent, CardTitle, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { resourceCategories, resourceStatuses, resourceOrganizations, getCategoryLabel, getStatusLabel, commune } from '@/services/resourceService';
import ResourceMarkerPopup from './ResourceMarkerPopup';
import { Map as MapIcon, Search } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, GeoJSON } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import shp, { parseShp, parseDbf, combine } from 'shpjs';
import { reproject } from 'reproject';
import proj4 from 'proj4';
import { useSearchParams } from 'react-router-dom';

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

// Helper function to determine badge variant based on status
const getBadgeVariantForStatus = (status: ResourceStatus): "default" | "secondary" | "destructive" | "outline" => {
  switch (status) {
    case 'available': return 'default';
    case 'reserved': return 'secondary';
    case 'unavailable': return 'destructive';
    case 'maintenance': return 'outline';
    default: return 'secondary';
  }
};

const DEFAULT_DISTANCE_KM = 500;
const CENTRAL_FIXED_POINT_LAT = 52.2297;
const CENTRAL_FIXED_POINT_LNG = 21.0122;

const ResourceMap: React.FC = () => {
  const [resources, setResources] = useState<(Resource & { communeName?: string })[]>([]);
  const [filteredResources, setFilteredResources] = useState<(Resource & { communeName?: string })[]>([]);
  const [selectedResource, setSelectedResource] = useState<(Resource & { communeName?: string }) | null>(null);
  
  const [searchParams, setSearchParams] = useSearchParams();

  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState(searchParams.get('category') || 'all');
  const [status, setStatus] = useState(searchParams.get('status') || 'all');
  const [organization, setOrganization] = useState(searchParams.get('organization') || 'all');
  const [distanceKm, setDistanceKm] = useState<number>(() => {
    const dParam = searchParams.get('distanceKm');
    return dParam ? parseInt(dParam, 10) : DEFAULT_DISTANCE_KM;
  });

  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('map');
  const [mapGeoJsonLayers, setMapGeoJsonLayers] = useState<any[]>([]);
  const mapRef = useRef<L.Map | null>(null);

  // Effect for fetching initial resources
  useEffect(() => {
    const fetchInitialResources = async () => {
      try {
        setIsLoading(true);
        const resourceData = await getAllResources();

        if (resourceData.length > 0) {
          const locationsForAnnotation = resourceData.map(r => ({ 
            lat: r.location.coordinates.lat, 
            lon: r.location.coordinates.lng 
          }));
          const uniqueLocationStrings = new Set(locationsForAnnotation.map(loc => JSON.stringify(loc)));
          const uniqueLocations = Array.from(uniqueLocationStrings).map(str => JSON.parse(str) as { lat: number; lon: number });
          
          let locationToCommuneMap = new Map<string, string>();
          if (uniqueLocations.length > 0) {
            try {
              const res = await fetch('http://127.0.0.1:8000/find_communes/', {
                method: 'POST', 
                headers: { 'Content-Type': 'application/json' }, 
                body: JSON.stringify(uniqueLocations)
              });
              if (res.ok) {
                const annotations: { input_coordinate: { lat: number; lon: number }; commune_name: string; status: string }[] = await res.json();
                annotations.forEach((item) => {
                  if (item.status === 'found' && item.commune_name) {
                    locationToCommuneMap.set(JSON.stringify({ lat: item.input_coordinate.lat, lon: item.input_coordinate.lon }), item.commune_name);
                  }
                });
              } else {
                console.error("Error fetching commune names:", res.status, await res.text());
              }
            } catch (e) {
              console.error("Error calling /find_communes/ endpoint:", e);
            }
          }

          const annotatedResourceData = resourceData.map(r => ({
            ...r,
            communeName: locationToCommuneMap.get(JSON.stringify({ lat: r.location.coordinates.lat, lon: r.location.coordinates.lng }))
          }));
          setResources(annotatedResourceData);
          setFilteredResources(annotatedResourceData);
        } else {
          setResources([]);
          setFilteredResources([]);
        }
      } catch (error) {
        console.error("Error fetching initial resources:", error);
        setResources([]);
        setFilteredResources([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialResources();
  }, []);

  // Effect for updating commune layers based on filtered resources
  useEffect(() => {
    const updateCommuneLayers = async () => {
      if (isLoading) return;

      if (filteredResources.length === 0) {
        setMapGeoJsonLayers([]);
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
          setMapGeoJsonLayers([]);
          return;
        }

        const communesResponse = await fetch('http://127.0.0.1:8000/find_communes/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(uniqueLocations)
        });

        if (!communesResponse.ok) {
          console.error(`HTTP error! status: ${communesResponse.status} for /find_communes/`);
          setMapGeoJsonLayers([]);
          return;
        }
        
        const communeApiResults: { input_coordinate: { lat: number; lon: number }; commune_name: string; status: string }[] = await communesResponse.json();
        
        const foundCommuneNames = communeApiResults
          .filter(result => result.status === 'found' && result.commune_name)
          .map(result => result.commune_name);
        
        const uniqueCommuneNames = [...new Set(foundCommuneNames)];

        if (uniqueCommuneNames.length === 0) {
          setMapGeoJsonLayers([]);
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
        setMapGeoJsonLayers([]);
      }
    };

    updateCommuneLayers();
  }, [filteredResources, isLoading]);

  const centralPoint = useMemo(() => L.latLng(CENTRAL_FIXED_POINT_LAT, CENTRAL_FIXED_POINT_LNG), []);

  // Effect for updating URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (category !== 'all') params.set('category', category);
    if (status !== 'all') params.set('status', status);
    if (organization !== 'all') params.set('organization', organization);
    if (distanceKm !== DEFAULT_DISTANCE_KM) {
      params.set('distanceKm', distanceKm.toString());
    } else {
      params.delete('distanceKm');
    }
    setSearchParams(params, { replace: true });
  }, [search, category, status, organization, distanceKm, setSearchParams]);

  useEffect(() => {
    setFilteredResources(resources.filter((resource) => {
      const sLower = search.toLowerCase();
      const matchesSearch = search
        ? resource.name.toLowerCase().includes(sLower) ||
          resource.description.toLowerCase().includes(sLower) ||
          resource.location.name.toLowerCase().includes(sLower) ||
          (resource.communeName && resource.communeName.toLowerCase().includes(sLower))
        : true;
      const matchesCategory = category === 'all' ? true : resource.category === category;
      const matchesStatus = status === 'all' ? true : resource.status === status;
      const matchesOrganization = organization === 'all' ? true : resource.organization === organization;

      const matchesDistance = (() => {
        if (!resource.location?.coordinates) return true;
        const resourcePoint = L.latLng(resource.location.coordinates.lat, resource.location.coordinates.lng);
        const distMeters = centralPoint.distanceTo(resourcePoint);
        const distKmValue = distMeters / 1000;
        return distKmValue <= distanceKm;
      })();

      return matchesSearch && matchesCategory && matchesStatus && matchesOrganization && matchesDistance;
    }));
  }, [search, category, status, organization, distanceKm, resources, centralPoint]);

  // Effect for centering map on filtered resources
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (filteredResources.length > 0) {
      if (filteredResources.length === 1) {
        const resource = filteredResources[0];
        map.flyTo([resource.location.coordinates.lat, resource.location.coordinates.lng], 13);
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
  }, [filteredResources]);

  const handleResourceClick = (resource: (Resource & { communeName?: string }) | null) => {
    setSelectedResource(resource);
    if (resource && mapRef.current) {
      mapRef.current.flyTo([resource.location.coordinates.lat, resource.location.coordinates.lng], 14);
    }
  };

  const clearFilters = () => {
    setSearch('');
    setCategory('all');
    setStatus('all');
    setOrganization('all');
    setDistanceKm(DEFAULT_DISTANCE_KM);
  };

  const localCommuneName = commune.name;

  const isAnyFilterActive = React.useMemo(() => 
    search !== '' || 
    category !== 'all' || 
    status !== 'all' || 
    organization !== 'all' ||
    distanceKm !== DEFAULT_DISTANCE_KM,
    [search, category, status, organization, distanceKm]
  );

  const resourcesInLocalCommune = React.useMemo(() =>
    filteredResources.filter(r => r.communeName === localCommuneName),
  [filteredResources, localCommuneName]);

  const resourcesInOtherCommunes = React.useMemo(() =>
    filteredResources.filter(r => r.communeName && r.communeName !== localCommuneName),
  [filteredResources, localCommuneName]);

  const renderResourceTable = (title: string, data: (Resource & { communeName?: string })[], showCommuneCol: boolean) => {
    if (data.length === 0) {
      return null;
    }
    return (
      <Card className="shadow-sm rounded-lg mt-4">
        <CardHeader className="py-3 px-4"><CardTitle className="text-md font-semibold text-gray-700">{title}</CardTitle></CardHeader>
        <CardContent className="px-0 py-0">
          <Table className="text-xs">
            <TableHeader>
              <TableRow>
                <TableHead className="py-2 px-3">Nazwa</TableHead>
                <TableHead className="py-2 px-3">Kategoria</TableHead>
                <TableHead className="py-2 px-3">Status</TableHead>
                <TableHead className="py-2 px-3">Ilość</TableHead>
                <TableHead className="py-2 px-3">Organizacja</TableHead>
                {showCommuneCol && <TableHead className="py-2 px-3">Gmina</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map(r => (
                <TableRow key={r.id} onClick={() => handleResourceClick(r)} className="cursor-pointer hover:bg-gray-50">
                  <TableCell className="font-medium py-2 px-3">{r.name}</TableCell>
                  <TableCell className="py-2 px-3">{getCategoryLabel(r.category as any)}</TableCell>
                  <TableCell className="py-2 px-3">
                    <Badge variant={getBadgeVariantForStatus(r.status as ResourceStatus)} className="text-xs px-1.5 py-0.5">
                      {getStatusLabel(r.status as ResourceStatus)}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-2 px-3">{r.quantity} {r.unit}</TableCell>
                  <TableCell className="py-2 px-3">{r.organization}</TableCell>
                  {showCommuneCol && <TableCell className="py-2 px-3">{r.communeName || 'N/A'}</TableCell>}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="flex flex-col overflow-y-auto">
      <div className="flex-1 flex flex-col min-h-0"> 
        <h1 className="text-2xl font-bold mb-4 flex-shrink-0">Mapa zasobów</h1>
        
        <div className="flex-1 flex flex-col md:flex-row gap-4 min-h-0">
          <Card className="w-full md:w-80 flex flex-col">
            <CardContent className="pt-6 flex-1 overflow-y-auto">
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

                  <div className="space-y-2">
                    <Label htmlFor="distanceKm">Max odległość od centrum: {distanceKm} km</Label>
                    <Input
                      type="range"
                      id="distanceKm"
                      min="1"
                      max="500"
                      value={distanceKm}
                      onChange={(e) => setDistanceKm(parseInt(e.target.value, 10))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                    />
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
                      ref={mapRef}
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

      <div className="mt-4 flex-shrink-0">
        {isAnyFilterActive && (resourcesInLocalCommune.length > 0 || resourcesInOtherCommunes.length > 0) && (
          <>
            {renderResourceTable(`Zasoby w ${localCommuneName} (wg. filtrów)`, resourcesInLocalCommune, false)}
            {renderResourceTable("Zasoby w innych gminach (wg. filtrów)", resourcesInOtherCommunes, true)}
          </>
        )}
        {isAnyFilterActive && resourcesInLocalCommune.length === 0 && resourcesInOtherCommunes.length === 0 && !isLoading && (
           <Card className="shadow-sm rounded-lg mt-4">
             <CardContent className="py-3 px-4">
               <p className="text-center text-sm text-muted-foreground">
                 Brak zasobów pasujących do kryteriów filtrowania.
               </p>
             </CardContent>
           </Card>
        )}
      </div>
    </div>
  );
};

export default ResourceMap;
