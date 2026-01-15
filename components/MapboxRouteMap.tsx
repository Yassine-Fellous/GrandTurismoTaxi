'use client';

import { useEffect, useRef } from 'react';
import { Coordinates } from '@/lib/distanceCalculator';

interface MapboxRouteMapProps {
  departCoords?: Coordinates;
  arriveeCoords?: Coordinates;
  departAddress: string;
  arriveeAddress: string;
}

export default function MapboxRouteMap({
  departCoords,
  arriveeCoords,
  departAddress,
  arriveeAddress,
}: MapboxRouteMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<any>(null);

  useEffect(() => {
    if (!mapContainer.current) return;

    const loadMapbox = async () => {
      // @ts-ignore
      const mapboxgl = (await import('mapbox-gl')).default;
      
      // @ts-ignore
      mapboxgl.accessToken = 'pk.eyJ1Ijoic215MTMwMDkiLCJhIjoiY21rYnhwaGM4MDV1dDNnczk3emQ1Z3VheiJ9.4akFvZvo40ZQLRLT3KOu-g';

      if (!mapContainer.current) return;

      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/smy13009/cmkby5w41002w01quhlsl25u7',
        center: [5.36978, 43.296482], // Marseille
        zoom: 12,
      });

      // Ajouter les marqueurs et l'itinéraire quand les coordonnées sont disponibles
      map.current.on('load', () => {
        if (departCoords) {
          new mapboxgl.Marker({ color: '#00ff00' })
            .setLngLat([departCoords.lon, departCoords.lat])
            .setPopup(new mapboxgl.Popup().setHTML(`<strong>🟢 Départ</strong><br/>${departAddress}`))
            .addTo(map.current);
        }

        if (arriveeCoords) {
          new mapboxgl.Marker({ color: '#e00000' })
            .setLngLat([arriveeCoords.lon, arriveeCoords.lat])
            .setPopup(new mapboxgl.Popup().setHTML(`<strong>🔴 Arrivée</strong><br/>${arriveeAddress}`))
            .addTo(map.current);
        }

        // Récupérer et afficher l'itinéraire
        if (departCoords && arriveeCoords) {
          fetchAndDisplayRoute(departCoords, arriveeCoords);
        }
      });
    };

    const fetchAndDisplayRoute = async (depart: Coordinates, arrivee: Coordinates) => {
      try {
        const response = await fetch(
          `https://router.project-osrm.org/route/v1/driving/${depart.lon},${depart.lat};${arrivee.lon},${arrivee.lat}?overview=full&geometries=geojson`
        );
        const data = await response.json();

        if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
          const route = data.routes[0].geometry;

          // Ajouter la ligne d'itinéraire
          map.current.addSource('route', {
            type: 'geojson',
            data: {
              type: 'Feature',
              properties: {},
              geometry: route,
            },
          });

          // Ligne avec effet glow
          map.current.addLayer({
            id: 'route-glow',
            type: 'line',
            source: 'route',
            layout: {
              'line-join': 'round',
              'line-cap': 'round',
            },
            paint: {
              'line-color': '#ff6b6b',
              'line-width': 8,
              'line-opacity': 0.3,
            },
          });

          // Ligne principale rouge
          map.current.addLayer({
            id: 'route',
            type: 'line',
            source: 'route',
            layout: {
              'line-join': 'round',
              'line-cap': 'round',
            },
            paint: {
              'line-color': '#e00000',
              'line-width': 5,
              'line-opacity': 0.9,
            },
          });

          // Zoomer sur l'itinéraire
          const coords = route.coordinates;
          const bounds = coords.reduce(
            (bounds: any, coord: number[]) => bounds.extend(coord),
            new (await import('mapbox-gl')).default.LngLatBounds(coords[0], coords[0])
          );

          map.current.fitBounds(bounds, {
            padding: 50,
            maxZoom: 14,
          });
        }
      } catch (error) {
        console.error('Erreur récupération itinéraire:', error);
      }
    };

    loadMapbox();

    return () => {
      if (map.current) map.current.remove();
    };
  }, [departCoords, arriveeCoords, departAddress, arriveeAddress]);

  return (
    <div className="w-full h-[400px] rounded-lg overflow-hidden border-2 border-gray-700 shadow-2xl">
      <div ref={mapContainer} className="w-full h-full" />
    </div>
  );
}
