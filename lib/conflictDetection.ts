/**
 * Utilitaires de gestion des conflits d'horaires pour réservations de taxi
 * Spécifique au contexte Marseille avec trafic dense
 */

export interface Course {
  id: string;
  depart: string; // Adresse de départ
  arrivee: string; // Adresse d'arrivée
  date_heure: string; // ISO 8601 timestamp
  duree_minutes: number; // Durée estimée de la course
  distance_km: number; // Distance en km
  depart_coords?: { lat: number; lng: number };
  arrivee_coords?: { lat: number; lng: number };
}

export interface ConflictCheckOptions {
  /**
   * Buffer de sécurité en minutes (par défaut: 15 min)
   * Couvre: aléas trafic + remise note + déchargement
   */
  bufferSecurite?: number;
  
  /**
   * Temps de trajet inter-courses en minutes (calculé ou estimé)
   * Si non fourni, sera calculé automatiquement
   */
  tempsTrajetInterCourses?: number;
  
  /**
   * Vitesse moyenne pour calcul inter-courses (km/h)
   * Par défaut: 25 km/h (Marseille avec trafic)
   */
  vitesseMoyenne?: number;
}

export interface ConflictResult {
  hasConflict: boolean;
  message: string;
  details?: {
    finCourseA: Date;
    debutCourseB: Date;
    tempsTrajet: number;
    bufferSecurite: number;
    ecartMinimal: number; // Temps minimal requis entre les deux courses
    ecartReel: number; // Temps réel disponible
    manqueMinutes?: number; // Nombre de minutes manquantes si conflit
  };
}

/**
 * Calcule le temps de trajet entre deux points en minutes
 * Basé sur la distance à vol d'oiseau et une vitesse moyenne
 */
function calculerTempsTrajet(
  point1: { lat: number; lng: number },
  point2: { lat: number; lng: number },
  vitesseMoyenne: number = 25
): number {
  // Formule de Haversine pour distance à vol d'oiseau
  const R = 6371; // Rayon de la Terre en km
  const dLat = (point2.lat - point1.lat) * Math.PI / 180;
  const dLon = (point2.lng - point1.lng) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(point1.lat * Math.PI / 180) * Math.cos(point2.lat * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distanceVolOiseau = R * c;
  
  // Facteur de correction pour distance réelle (route vs vol d'oiseau)
  // À Marseille avec relief et voies sinueuses: ~1.4
  const distanceReelle = distanceVolOiseau * 1.4;
  
  // Temps = distance / vitesse * 60 (pour avoir des minutes)
  const tempsMinutes = (distanceReelle / vitesseMoyenne) * 60;
  
  // Arrondir et garantir minimum 5 minutes
  return Math.max(5, Math.ceil(tempsMinutes));
}

/**
 * Détecte si deux courses sont en conflit horaire
 * 
 * Formule: (Fin Course A) + (Temps Trajet Inter-Courses) + (Buffer Sécurité) <= (Début Course B)
 * 
 * @param courseA - Première course (chronologiquement)
 * @param courseB - Deuxième course (chronologiquement)
 * @param options - Options de configuration
 * @returns ConflictResult avec détails du conflit
 * 
 * @example
 * ```typescript
 * const courseA = {
 *   id: '1',
 *   depart: 'Gare Saint-Charles',
 *   arrivee: 'Vieux-Port',
 *   date_heure: '2026-01-14T10:00:00Z',
 *   duree_minutes: 20,
 *   distance_km: 3.5,
 *   depart_coords: { lat: 43.3031, lng: 5.3806 },
 *   arrivee_coords: { lat: 43.2951, lng: 5.3744 }
 * };
 * 
 * const courseB = {
 *   id: '2',
 *   depart: 'Aéroport',
 *   arrivee: 'Castellane',
 *   date_heure: '2026-01-14T10:30:00Z',
 *   duree_minutes: 25,
 *   distance_km: 22,
 *   depart_coords: { lat: 43.4366, lng: 5.2144 },
 *   arrivee_coords: { lat: 43.2865, lng: 5.3951 }
 * };
 * 
 * const result = detecterConflitHoraire(courseA, courseB);
 * if (result.hasConflict) {
 *   console.log('Conflit détecté:', result.message);
 * }
 * ```
 */
export function detecterConflitHoraire(
  courseA: Course,
  courseB: Course,
  options: ConflictCheckOptions = {}
): ConflictResult {
  const {
    bufferSecurite = 15,
    tempsTrajetInterCourses,
    vitesseMoyenne = 25
  } = options;

  // Convertir les dates en objets Date
  const debutA = new Date(courseA.date_heure);
  const debutB = new Date(courseB.date_heure);

  // Vérification de validité des dates
  if (isNaN(debutA.getTime()) || isNaN(debutB.getTime())) {
    return {
      hasConflict: true,
      message: 'Erreur: Dates invalides'
    };
  }

  // Vérifier l'ordre chronologique - Course A doit être avant Course B
  if (debutB < debutA) {
    return {
      hasConflict: true,
      message: 'Erreur: Course B est antérieure à Course A. Vérifiez l\'ordre chronologique.'
    };
  }

  // Calculer la fin de la Course A
  const finA = new Date(debutA.getTime() + courseA.duree_minutes * 60000);

  // Calculer ou utiliser le temps de trajet inter-courses
  let tempsTrajet: number;
  
  if (tempsTrajetInterCourses !== undefined) {
    // Utiliser la valeur fournie
    tempsTrajet = tempsTrajetInterCourses;
  } else if (courseA.arrivee_coords && courseB.depart_coords) {
    // Calculer automatiquement si les coordonnées sont disponibles
    tempsTrajet = calculerTempsTrajet(
      courseA.arrivee_coords,
      courseB.depart_coords,
      vitesseMoyenne
    );
  } else {
    // Valeur par défaut conservatrice pour Marseille (20 minutes)
    tempsTrajet = 20;
  }

  // Calcul de l'écart minimal requis
  // Formule: Temps Trajet + Buffer Sécurité
  const ecartMinimalRequis = tempsTrajet + bufferSecurite;

  // Calcul de l'écart réel disponible (en minutes)
  const ecartReelMs = debutB.getTime() - finA.getTime();
  const ecartReelMinutes = Math.floor(ecartReelMs / 60000);

  // Détection du conflit
  // Conflit SI: (Fin Course A) + (Temps Trajet) + (Buffer) > (Début Course B)
  // OU de manière équivalente: Écart Réel < Écart Minimal Requis
  const hasConflict = ecartReelMinutes < ecartMinimalRequis;

  // Calculer le temps manquant si conflit
  const manqueMinutes = hasConflict 
    ? ecartMinimalRequis - ecartReelMinutes 
    : undefined;

  // Message détaillé
  let message: string;
  if (hasConflict) {
    message = `❌ CONFLIT DÉTECTÉ: Il manque ${manqueMinutes} minute(s). ` +
              `Temps disponible: ${ecartReelMinutes} min, ` +
              `Temps requis: ${ecartMinimalRequis} min ` +
              `(trajet inter-courses: ${tempsTrajet} min + buffer: ${bufferSecurite} min)`;
  } else {
    const margeSupplementaire = ecartReelMinutes - ecartMinimalRequis;
    message = `✅ PAS DE CONFLIT: Marge de ${margeSupplementaire} minute(s) disponible. ` +
              `Temps disponible: ${ecartReelMinutes} min, ` +
              `Temps requis: ${ecartMinimalRequis} min`;
  }

  return {
    hasConflict,
    message,
    details: {
      finCourseA: finA,
      debutCourseB: debutB,
      tempsTrajet,
      bufferSecurite,
      ecartMinimal: ecartMinimalRequis,
      ecartReel: ecartReelMinutes,
      manqueMinutes
    }
  };
}

/**
 * Vérifie si une nouvelle course est en conflit avec une liste de courses existantes
 * 
 * @param nouvelleCourse - La course à ajouter
 * @param coursesExistantes - Liste des courses déjà planifiées
 * @param options - Options de configuration
 * @returns ConflictResult avec la première course en conflit détectée
 */
export function verifierConflitAvecPlanning(
  nouvelleCourse: Course,
  coursesExistantes: Course[],
  options: ConflictCheckOptions = {}
): ConflictResult {
  if (coursesExistantes.length === 0) {
    return {
      hasConflict: false,
      message: '✅ Aucune course existante, pas de conflit possible'
    };
  }

  const dateNouvelleCourse = new Date(nouvelleCourse.date_heure);

  // Trier les courses par date
  const coursesTries = [...coursesExistantes].sort((a, b) => 
    new Date(a.date_heure).getTime() - new Date(b.date_heure).getTime()
  );

  // Vérifier avec les courses avant
  for (const courseExistante of coursesTries) {
    const dateExistante = new Date(courseExistante.date_heure);
    
    // CAS SPÉCIAL: Horaires EXACTEMENT identiques = CONFLIT IMMÉDIAT
    if (dateExistante.getTime() === dateNouvelleCourse.getTime()) {
      return {
        hasConflict: true,
        message: `❌ CONFLIT: Horaire identique avec course ${courseExistante.id} (${courseExistante.depart} → ${courseExistante.arrivee}). Impossible d'avoir deux courses au même moment.`,
        details: {
          finCourseA: dateExistante,
          debutCourseB: dateNouvelleCourse,
          tempsTrajet: 0,
          bufferSecurite: 0,
          ecartMinimal: 1,
          ecartReel: 0,
          manqueMinutes: 1
        }
      };
    }
    
    if (dateExistante < dateNouvelleCourse) {
      // Course existante AVANT la nouvelle: vérifier courseExistante -> nouvelleCourse
      const result = detecterConflitHoraire(courseExistante, nouvelleCourse, options);
      if (result.hasConflict) {
        return {
          ...result,
          message: `Conflit avec course ${courseExistante.id} (${courseExistante.depart} → ${courseExistante.arrivee}): ${result.message}`
        };
      }
    } else {
      // Course existante APRÈS la nouvelle: vérifier nouvelleCourse -> courseExistante
      const result = detecterConflitHoraire(nouvelleCourse, courseExistante, options);
      if (result.hasConflict) {
        return {
          ...result,
          message: `Conflit avec course ${courseExistante.id} (${courseExistante.depart} → ${courseExistante.arrivee}): ${result.message}`
        };
      }
    }
  }

  return {
    hasConflict: false,
    message: '✅ Pas de conflit avec les courses existantes'
  };
}

/**
 * Trouve le prochain créneau disponible après un conflit
 * 
 * @param courseEnConflit - La course qui pose problème
 * @param coursesExistantes - Liste des courses existantes
 * @param options - Options de configuration
 * @returns Date du prochain créneau disponible
 */
export function trouverProchainCreneauDisponible(
  courseEnConflit: Course,
  coursesExistantes: Course[],
  options: ConflictCheckOptions = {}
): Date {
  // Commencer la recherche 5 minutes APRÈS l'heure demandée (pas à la même heure puisqu'on sait qu'il y a conflit)
  let dateProposee = new Date(new Date(courseEnConflit.date_heure).getTime() + 5 * 60000);
  const incrementMinutes = 5; // Incrément de recherche
  const maxTentatives = 288; // 24 heures (288 * 5 min)

  console.log(`🔍 Recherche de créneau alternatif pour: ${courseEnConflit.date_heure}`);
  console.log(`   Début de recherche: ${dateProposee.toISOString()}`);

  for (let i = 0; i < maxTentatives; i++) {
    const courseTest = {
      ...courseEnConflit,
      date_heure: dateProposee.toISOString()
    };

    const result = verifierConflitAvecPlanning(courseTest, coursesExistantes, options);
    
    if (i < 10) {  // Logger les 10 premières tentatives
      console.log(`   Tentative ${i + 1}: ${dateProposee.toISOString()} → ${result.hasConflict ? '❌ Conflit' : '✅ OK'}`);
    }
    
    if (!result.hasConflict) {
      console.log(`✅ Créneau trouvé après ${i + 1} tentatives: ${dateProposee.toISOString()}`);
      return dateProposee;
    }

    // Avancer de 5 minutes
    dateProposee = new Date(dateProposee.getTime() + incrementMinutes * 60000);
  }

  // Si aucun créneau trouvé dans les 24h, retourner +24h
  console.log(`⚠️ Aucun créneau trouvé en 24h, retour à +24h`);
  return new Date(new Date(courseEnConflit.date_heure).getTime() + 24 * 60 * 60000);
}
