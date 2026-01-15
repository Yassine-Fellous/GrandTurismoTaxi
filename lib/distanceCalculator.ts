export interface DistanceMatrixResult {
  distance_km: number;
  duree_minutes: number;
  distance_text: string;
  duree_text: string;
}

export interface Coordinates {
  lat: number;
  lon: number;
}

/**
 * Calcule la distance et la durée entre deux points avec OSRM (OpenStreetMap)
 * 100% GRATUIT - Pas de clé API nécessaire
 */
export async function calculateDistance(
  origin: string,
  destination: string,
  originCoords?: Coordinates,
  destCoords?: Coordinates
): Promise<DistanceMatrixResult | null> {
  try {
    // Si on n'a pas les coordonnées, on les récupère via API Adresse
    let fromCoords = originCoords;
    let toCoords = destCoords;

    if (!fromCoords) {
      const coords = await geocodeAddress(origin);
      if (!coords) return null;
      fromCoords = coords;
    }
    if (!toCoords) {
      const coords = await geocodeAddress(destination);
      if (!coords) return null;
      toCoords = coords;
    }

    // Appel à OSRM pour calculer la route
    const response = await fetch(
      `https://router.project-osrm.org/route/v1/driving/${fromCoords.lon},${fromCoords.lat};${toCoords.lon},${toCoords.lat}?overview=false`
    );

    if (!response.ok) {
      console.error('Erreur OSRM:', response.statusText);
      return null;
    }

    const data = await response.json();

    if (data.code !== 'Ok' || !data.routes || data.routes.length === 0) {
      console.error('Aucune route trouvée');
      return null;
    }

    const route = data.routes[0];
    const distanceKm = route.distance / 1000; // mètres -> km
    const dureeMinutes = Math.ceil(route.duration / 60); // secondes -> minutes

    return {
      distance_km: distanceKm,
      duree_minutes: dureeMinutes,
      distance_text: `${distanceKm.toFixed(1)} km`,
      duree_text: `${dureeMinutes} min`,
    };
  } catch (error) {
    console.error('Erreur calcul distance:', error);
    return null;
  }
}

/**
 * Géocode une adresse avec l'API Adresse du gouvernement français
 * 100% GRATUIT - Pas de limite
 */
async function geocodeAddress(address: string): Promise<Coordinates | null> {
  try {
    const response = await fetch(
      `https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(address)}&limit=1`
    );
    const data = await response.json();

    if (data.features && data.features.length > 0) {
      const coords = data.features[0].geometry.coordinates;
      return {
        lat: coords[1],
        lon: coords[0],
      };
    }

    return null;
  } catch (error) {
    console.error('Erreur géocodage:', error);
    return null;
  }
}
