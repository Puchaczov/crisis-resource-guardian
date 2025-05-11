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

const DEFAULT_DISTANCE_KM = 500; // Adjust as per your application's default
const MIN_DISTANCE_KM = 10;    // Adjust as per your application's minimum
const MAX_DISTANCE_KM = 1000;  // Adjust as per your application's maximum;

const CENTRAL_FIXED_POINT_LAT = 52.2297;
const CENTRAL_FIXED_POINT_LNG = 21.0122;

const ResourceMap: React.FC = () => {
  const [resources, setResources] = useState<(Resource & { communeName?: string })[]>([]);
  const [filteredResources, setFilteredResources] = useState<(Resource & { communeName?: string })[]>([]);
  const [selectedResource, setSelectedResource] = useState<(Resource & { communeName?: string }) | null>(null);
  
  const [searchParams, setSearchParams] = useSearchParams();

  const [search, setSearch] = useState(() => searchParams.get('search') || '');
  const [category, setCategory] = useState(() => searchParams.get('category') || 'all');
  const [status, setStatus] = useState(() => searchParams.get('status') || 'all');
  const [organization, setOrganization] = useState(() => searchParams.get('organization') || 'all');
  const [distanceKm, setDistanceKm] = useState(() => {
    const distStr = searchParams.get('distanceKm');
    const numDist = distStr ? parseInt(distStr, 10) : DEFAULT_DISTANCE_KM;
    return Math.max(MIN_DISTANCE_KM, Math.min(MAX_DISTANCE_KM, isNaN(numDist) ? DEFAULT_DISTANCE_KM : numDist));
  });

  // Effect to synchronize local state FROM URL searchParams when they change after initial load
  useEffect(() => {
    const urlSearch = searchParams.get('search') || '';
    setSearch(prevSearch => prevSearch !== urlSearch ? urlSearch : prevSearch);

    const urlCategory = searchParams.get('category') || 'all';
    setCategory(prevCategory => prevCategory !== urlCategory ? urlCategory : prevCategory);

    const urlStatus = searchParams.get('status') || 'all';
    setStatus(prevStatus => prevStatus !== urlStatus ? urlStatus : prevStatus);

    const urlOrganization = searchParams.get('organization') || 'all';
    setOrganization(prevOrganization => prevOrganization !== urlOrganization ? urlOrganization : prevOrganization);

    const urlDistanceStr = searchParams.get('distanceKm');
    let newDistanceValue;
    if (urlDistanceStr === null) { // If distanceKm is NOT in URL, local state should be default
      newDistanceValue = DEFAULT_DISTANCE_KM;
    } else {
      const parsedNum = parseInt(urlDistanceStr, 10);
      // If parsing fails or param is invalid, default; otherwise, clamp the parsed number
      newDistanceValue = isNaN(parsedNum) ? DEFAULT_DISTANCE_KM : Math.max(MIN_DISTANCE_KM, Math.min(MAX_DISTANCE_KM, parsedNum));
    }
    setDistanceKm(prevDistance => prevDistance !== newDistanceValue ? newDistanceValue : prevDistance);

  }, [searchParams]); // This effect runs when searchParams object instance changes.

  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('map');
  const [mapGeoJsonLayers, setMapGeoJsonLayers] = useState<any[]>([]);
  const [mapInstance, setMapInstance] = useState<L.Map | null>(null);

  const radiusCircleRef = useRef<L.Circle | null>(null); // Added for search radius circle

  // Moved isAnyFilterActive earlier to be available for the radius circle effect
  const isAnyFilterActive = React.useMemo(() => 
    search !== '' || 
    category !== 'all' || 
    status !== 'all' || 
    organization !== 'all' ||
    distanceKm !== DEFAULT_DISTANCE_KM,
    [search, category, status, organization, distanceKm]
  );

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
    let isActive = true; // Flag to handle cleanup for this specific effect run

    const updateCommuneLayers = async () => {
      if (isLoading) {
        // If initial resources are still loading, wait.
        // Layers will be updated once isLoading is false and filteredResources are set.
        return;
      }

      // If effect is no longer active (component unmounted or deps changed), abort.
      if (!isActive) {
        return;
      }

      if (filteredResources.length === 0) {
        if (isActive) { // Check isActive before setting state
          setMapGeoJsonLayers([]);
          console.log('Cleared commune GeoJSON layers: filteredResources is empty.');
        }
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
          if (isActive) {
            setMapGeoJsonLayers([]);
            console.log('Cleared commune GeoJSON layers: uniqueLocations derived from filteredResources is empty.');
          }
          return;
        }

        // Check isActive before potentially long async operation
        if (!isActive) return;

        const communesResponse = await fetch('http://127.0.0.1:8000/find_communes/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(uniqueLocations)
        });

        if (!isActive) return; // Check after await

        if (!communesResponse.ok) {
          console.error(`HTTP error! status: ${communesResponse.status} for /find_communes/`);
          if (isActive) setMapGeoJsonLayers([]);
          return;
        }
        
        const communeApiResults: { input_coordinate: { lat: number; lon: number }; commune_name: string; status: string }[] = await communesResponse.json();
        
        if (!isActive) return; // Check after await

        const foundCommuneNames = communeApiResults
          .filter(result => result.status === 'found' && result.commune_name)
          .map(result => result.commune_name);
        
        const uniqueCommuneNames = [...new Set(foundCommuneNames)];

        if (uniqueCommuneNames.length === 0) {
          if (isActive) {
            setMapGeoJsonLayers([]);
            console.log('Cleared commune GeoJSON layers: no unique commune names found from API.');
          }
          return;
        }

        const communeShapefilePromises = uniqueCommuneNames.map(async (name) => {
          const formattedName = name.replace(/ /g, "_"); // Replace spaces with underscores
          const shapefilePath = `/files/gminy_JPT_NAZWA__${formattedName}.shp`;
          const dbfFilePath = `/files/gminy_JPT_NAZWA__${formattedName}.dbf`;
          try {
            // Check isActive before starting fetch, though less critical here as Promise.all handles concurrent starts
            if (!isActive) return null;

            const [shpResponse, dbfResponse] = await Promise.all([
              fetch(shapefilePath),
              fetch(dbfFilePath)
            ]);
            
            // Check isActive after fetches complete
            if (!isActive) return null;

            if (!shpResponse.ok) {
              console.warn(`Error fetching SHP file for commune ${name} (path: ${shapefilePath}): ${shpResponse.status} ${shpResponse.statusText}.`);
              return null;
            }
            const shpContentType = shpResponse.headers.get('content-type');
            if (shpContentType && shpContentType.toLowerCase().includes('text/html')) {
              console.warn(`Fetched SHP for commune ${name} (path: ${shapefilePath}) but received HTML content-type. File likely not found.`);
              return null;
            }

            if (!dbfResponse.ok) {
              console.warn(`Error fetching DBF file for commune ${name} (path: ${dbfFilePath}): ${dbfResponse.status} ${dbfResponse.statusText}.`);
              return null;
            }
            const dbfContentType = dbfResponse.headers.get('content-type');
            if (dbfContentType && dbfContentType.toLowerCase().includes('text/html')) {
              console.warn(`Fetched DBF for commune ${name} (path: ${dbfFilePath}) but received HTML content-type. File likely not found.`);
              return null;
            }

            const shpBuffer = await shpResponse.arrayBuffer();
            const dbfBuffer = await dbfResponse.arrayBuffer();
            
            if (!isActive) return null; // Check before parsing

            let features, attributes, geojson;
            try {
              features = parseShp(shpBuffer);
            } catch (e: any) {
              console.error(`Error parsing SHP for commune ${name} (path: ${shapefilePath}):`, e.message, e.stack);
              return null;
            }
            try {
              attributes = (parseDbf as any)(dbfBuffer, 'UTF-8'); 
            } catch (e: any) {
              console.error(`Error parsing DBF for commune ${name} (path: ${dbfFilePath}):`, e.message, e.stack);
              return null;
            }
            try {
              geojson = combine([features, attributes]);
            } catch (e: any) {
              console.error(`Error combining SHP and DBF for commune ${name} (paths: ${shapefilePath}, ${dbfFilePath}):`, e.message, e.stack);
              return null;
            }
            
            const sourceProjection = 'EPSG:2180'; 
            const targetProjection = 'EPSG:4326';
            const reprojectedGeoJson = reproject(geojson, sourceProjection, targetProjection, proj4.defs);
            return reprojectedGeoJson;
          } catch (error: any) {
            console.error(`Generic error loading, parsing, or reprojecting shapefile/dbf for commune ${name} (paths: ${shapefilePath}, ${dbfFilePath}):`, error.message, error.stack);
            return null;
          }
        });

        if (!isActive) return; // Check before Promise.all resolves

        const newCommuneGeoJsonLayers = (await Promise.all(communeShapefilePromises)).filter(layer => isActive && layer !== null);
        
        if (isActive) { // Final check before setting state
          setMapGeoJsonLayers(newCommuneGeoJsonLayers);
          console.log('Updated commune GeoJSON layers (count):', newCommuneGeoJsonLayers.length);
        }

      } catch (error) {
        console.error("Error updating commune layers based on filtered resources:", error);
        if (isActive) { // Only set state if still active
          setMapGeoJsonLayers([]);
          console.log('Cleared commune GeoJSON layers due to an error in updateCommuneLayers.');
        }
      }
    };

    updateCommuneLayers();

    return () => {
      isActive = false; // Cleanup function: marks this effect run as no longer active
      console.log('Commune layer effect cleanup, isActive set to false.');
    };
  }, [filteredResources, isLoading]);

  const centralPoint = useMemo(() => L.latLng(CENTRAL_FIXED_POINT_LAT, CENTRAL_FIXED_POINT_LNG), []);

  // Effect for drawing/updating search radius circle on map
  useEffect(() => {
    if (!mapInstance) {
      if (radiusCircleRef.current) {
        try {
          radiusCircleRef.current.remove();
        } catch (e) {
          // console.warn("Error removing stale circle during map unmount/reinit phase:", e);
        }
        radiusCircleRef.current = null;
      }
      return;
    }

    // Remove existing circle from map if it exists
    if (radiusCircleRef.current) {
      radiusCircleRef.current.remove();
      radiusCircleRef.current = null;
    }

    // Draw new circle if distance filter is active and not default
    if (isAnyFilterActive && distanceKm !== DEFAULT_DISTANCE_KM) {
      const newCircle = L.circle(centralPoint, {
        radius: distanceKm * 1000, // distanceKm is in km, radius in meters
        color: 'dodgerblue',
        fillColor: 'lightskyblue',
        fillOpacity: 0.15,
        weight: 1.5,
        dashArray: '10, 5',
        interactive: false, // So it doesn't capture mouse events
      }).addTo(mapInstance);
      radiusCircleRef.current = newCircle;
    }
    // Cleanup function to remove circle when component unmounts or dependencies change significantly
    return () => {
      if (radiusCircleRef.current) {
        try {
            radiusCircleRef.current.remove();
        } catch (e) {
            // console.warn("Error removing circle on cleanup:", e);
        }
        radiusCircleRef.current = null;
      }
    };
  }, [mapInstance, centralPoint, distanceKm, isAnyFilterActive, DEFAULT_DISTANCE_KM]); // Use mapInstance in dependencies

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
    // Only call setSearchParams if the string representation of params has changed
    // to avoid potential loops if searchParams itself is a dependency (which it is implicitly via useSearchParams)
    if (params.toString() !== searchParams.toString()) {
      setSearchParams(params, { replace: true });
    }
  }, [search, category, status, organization, distanceKm, setSearchParams, searchParams]); // Added searchParams here for the comparison

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
    if (!mapInstance) return;

    if (filteredResources.length > 0) {
      if (filteredResources.length === 1) {
        const resource = filteredResources[0];
        mapInstance.flyTo([resource.location.coordinates.lat, resource.location.coordinates.lng], 13);
      } else {
        const bounds = L.latLngBounds(
          filteredResources.map(resource => [
            resource.location.coordinates.lat,
            resource.location.coordinates.lng
          ])
        );
        if (bounds.isValid()) {
          mapInstance.flyToBounds(bounds, { padding: [50, 50], maxZoom: 16 });
        }
      }
    }
  }, [filteredResources, mapInstance]);

  const handleResourceClick = (resource: (Resource & { communeName?: string }) | null) => {
    setSelectedResource(resource);
    if (resource && mapInstance) {
      mapInstance.flyTo([resource.location.coordinates.lat, resource.location.coordinates.lng], 14);
    }
  };

  const clearFilters = () => {
    setSearch('');
    setCategory('all');
    setStatus('all');
    setOrganization('all');
    setDistanceKm(DEFAULT_DISTANCE_KM);
  };

  const handleDistanceChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newDistance = parseInt(event.target.value, 10);
    setDistanceKm(Math.max(MIN_DISTANCE_KM, Math.min(MAX_DISTANCE_KM, newDistance)));
  };

  const localCommuneName = commune.name;

  const resourcesInLocalCommune = React.useMemo(() =>
    filteredResources.filter(r => r.communeName === localCommuneName),
  [filteredResources, localCommuneName]);

  const resourcesInOtherCommunes = React.useMemo(() =>
    filteredResources
      .filter(r => r.communeName && r.communeName !== localCommuneName)
      .sort((a, b) => {
        // Ensure coordinates exist before trying to calculate distance
        if (!a.location?.coordinates && !b.location?.coordinates) return 0;
        if (!a.location?.coordinates) return 1; // push 'a' (without coords) to the end
        if (!b.location?.coordinates) return -1; // push 'b' (without coords) to the end

        const pointA = L.latLng(a.location.coordinates.lat, a.location.coordinates.lng);
        const pointB = L.latLng(b.location.coordinates.lat, b.location.coordinates.lng);
        
        const distA = centralPoint.distanceTo(pointA);
        const distB = centralPoint.distanceTo(pointB);
        
        return distA - distB; // Sort by ascending distance
      }),
  [filteredResources, localCommuneName, centralPoint]);

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
                      min={MIN_DISTANCE_KM}
                      max={MAX_DISTANCE_KM}
                      value={distanceKm}
                      onChange={handleDistanceChange}
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
                      ref={(instance) => { // Use the ref callback to get the map instance
                        if (instance) {
                          setMapInstance(instance);
                        }
                      }}
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
                         <Popup 
                           position={[selectedResource.location.coordinates.lat, selectedResource.location.coordinates.lng]}
                           autoPan={false} // Disable auto-panning
                         >
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
        {isAnyFilterActive && distanceKm !== DEFAULT_DISTANCE_KM && (
          <p className="text-sm text-muted-foreground text-center mb-2">
            Wyświetlanie zasobów w promieniu {distanceKm} km od centrum.
          </p>
        )}
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
