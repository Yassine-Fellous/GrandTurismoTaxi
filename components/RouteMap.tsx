'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { Coordinates } from '@/lib/distanceCalculator';

// Fonction pour formater la durée en heures et minutes
const formatDuree = (minutes: number): string => {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const heures = Math.floor(minutes / 60);
  const minutesRestantes = minutes % 60;
  if (minutesRestantes === 0) {
    return `${heures}h`;
  }
  return `${heures}h${minutesRestantes.toString().padStart(2, '0')}`;
};

// Import dynamique pour éviter les erreurs SSR avec Leaflet
const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import('react-leaflet').then((mod) => mod.Marker),
  { ssr: false }
);
const Popup = dynamic(
  () => import('react-leaflet').then((mod) => mod.Popup),
  { ssr: false }
);
const Polyline = dynamic(
  () => import('react-leaflet').then((mod) => mod.Polyline),
  { ssr: false }
);

// Composant pour gérer l'auto-zoom
function AutoZoom({ routeCoords }: { routeCoords: [number, number][] }) {
  const [UseMapComponent, setUseMapComponent] = useState<any>(null);

  useEffect(() => {
    // Charger useMap dynamiquement côté client
    import('react-leaflet').then((mod) => {
      const UseMapWrapper = ({ coords }: { coords: [number, number][] }) => {
        const map = mod.useMap();
        
        useEffect(() => {
          if (coords.length > 0) {
            const lats = coords.map((c) => c[0]);
            const lons = coords.map((c) => c[1]);
            
            const bounds: [[number, number], [number, number]] = [
              [Math.min(...lats), Math.min(...lons)],
              [Math.max(...lats), Math.max(...lons)]
            ];
            
            // Attendre un peu pour que la carte soit prête
            setTimeout(() => {
              map.fitBounds(bounds, {
                padding: [50, 50],
                maxZoom: 14,
                animate: true,
                duration: 1
              });
            }, 300);
          }
        }, [coords]);
        
        return null;
      };
      
      setUseMapComponent(() => UseMapWrapper);
    });
  }, []);

  if (!UseMapComponent) return null;
  return <UseMapComponent coords={routeCoords} />;
}

interface RouteMapProps {
  departCoords?: Coordinates;
  arriveeCoords?: Coordinates;
  departAddress: string;
  arriveeAddress: string;
  dureeMinutes?: number;
}

export default function RouteMap({
  departCoords,
  arriveeCoords,
  departAddress,
  arriveeAddress,
  dureeMinutes,
}: RouteMapProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [routeCoords, setRouteCoords] = useState<[number, number][]>([]);
  const [distanceKm, setDistanceKm] = useState<number>(0);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Récupérer l'itinéraire depuis OSRM et calculer le zoom automatique
  useEffect(() => {
    const fetchRoute = async () => {
      if (!departCoords || !arriveeCoords) return;

      try {
        const response = await fetch(
          `https://router.project-osrm.org/route/v1/driving/${departCoords.lon},${departCoords.lat};${arriveeCoords.lon},${arriveeCoords.lat}?overview=full&geometries=geojson`
        );
        const data = await response.json();

        if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
          const coords = data.routes[0].geometry.coordinates.map(
            (coord: [number, number]) => [coord[1], coord[0]] as [number, number]
          );
          setRouteCoords(coords);
          
          // Récupérer la distance
          const distance = data.routes[0].distance / 1000; // en km
          setDistanceKm(Math.round(distance * 10) / 10);
        }
      } catch (error) {
        console.error('Erreur récupération itinéraire:', error);
      }
    };

    fetchRoute();
  }, [departCoords, arriveeCoords]);

  // Calculer le centre et le zoom en fonction des coordonnées
  const getMapBounds = () => {
    if (departCoords && arriveeCoords && routeCoords.length > 0) {
      // Utiliser tous les points de l'itinéraire pour calculer les bounds
      const lats = routeCoords.map((c) => c[0]);
      const lons = routeCoords.map((c) => c[1]);
      
      const centerLat = (Math.min(...lats) + Math.max(...lats)) / 2;
      const centerLon = (Math.min(...lons) + Math.max(...lons)) / 2;
      
      // Calculer un zoom adapté à la distance
      const latDiff = Math.max(...lats) - Math.min(...lats);
      const lonDiff = Math.max(...lons) - Math.min(...lons);
      const maxDiff = Math.max(latDiff, lonDiff);
      
      let zoom = 12;
      if (maxDiff < 0.01) zoom = 15;
      else if (maxDiff < 0.05) zoom = 13;
      else if (maxDiff < 0.1) zoom = 12;
      else if (maxDiff < 0.3) zoom = 10;
      else if (maxDiff < 0.5) zoom = 9;
      else zoom = 8;
      
      return {
        center: [centerLat, centerLon] as [number, number],
        zoom,
      };
    }
    
    if (departCoords && arriveeCoords) {
      const lats = [departCoords.lat, arriveeCoords.lat];
      const lons = [departCoords.lon, arriveeCoords.lon];
      
      const centerLat = (Math.min(...lats) + Math.max(...lats)) / 2;
      const centerLon = (Math.min(...lons) + Math.max(...lons)) / 2;
      
      return {
        center: [centerLat, centerLon] as [number, number],
        zoom: 12,
      };
    }
    
    // Par défaut: Marseille
    return {
      center: [43.296482, 5.36978] as [number, number],
      zoom: 12,
    };
  };

  if (!isMounted) {
    return (
      <div className="w-full h-[400px] bg-gt-gray rounded-lg flex items-center justify-center border-2 border-gray-700">
        <p className="text-gray-400">Chargement de la carte...</p>
      </div>
    );
  }

  const { center, zoom } = getMapBounds();

  return (
    <div className="w-full h-[400px] rounded-lg overflow-hidden border-2 border-gray-700 shadow-2xl bg-gt-gray relative">
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: '100%', width: '100%', zIndex: 0 }}
        zoomControl={true}
      >
        {/* Auto-zoom pour adapter la vue à l'itinéraire */}
        <AutoZoom routeCoords={routeCoords} />
        
        {/* CartoDB Dark Matter - gratuit et moderne */}
        <TileLayer
          attribution='&copy; OpenStreetMap &copy; CARTO'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          subdomains="abcd"
          maxZoom={20}
        />

        {/* Marqueur départ */}
        {departCoords && (
          <Marker position={[departCoords.lat, departCoords.lon]}>
            <Popup>
              <div className="text-sm font-medium">
                <strong className="text-green-600 text-base">🟢 Départ</strong>
                <br />
                <span className="text-gray-700">{departAddress}</span>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Marqueur arrivée */}
        {arriveeCoords && (
          <Marker position={[arriveeCoords.lat, arriveeCoords.lon]}>
            <Popup>
              <div className="text-sm font-medium">
                <strong className="text-red-600 text-base">🔴 Arrivée</strong>
                <br />
                <span className="text-gray-700">{arriveeAddress}</span>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Ligne d'itinéraire */}
        {routeCoords.length > 0 && (
          <>
            {/* Ligne de fond (effet glow) */}
            <Polyline
              positions={routeCoords}
              pathOptions={{
                color: '#ff6b6b',
                weight: 8,
                opacity: 0.3,
              }}
            />
            {/* Ligne principale */}
            <Polyline
              positions={routeCoords}
              pathOptions={{
                color: '#e00000',
                weight: 5,
                opacity: 0.9,
              }}
            />
          </>
        )}
      </MapContainer>
      
      {/* Bandeau d'info en bas de la carte */}
      {routeCoords.length > 0 && (dureeMinutes || distanceKm) && (
        <div className="absolute bottom-4 left-4 right-4 bg-gt-black/90 backdrop-blur-sm border border-gt-red/50 rounded-lg px-4 py-2 z-[1000] flex justify-between items-center">
          {distanceKm > 0 && (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-400">📍 Distance:</span>
              <span className="font-rajdhani font-bold text-white">{distanceKm} km</span>
            </div>
          )}
          {dureeMinutes && dureeMinutes > 0 && (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-400">⏱️ Durée:</span>
              <span className="font-rajdhani font-bold text-gt-red">{formatDuree(dureeMinutes)}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
