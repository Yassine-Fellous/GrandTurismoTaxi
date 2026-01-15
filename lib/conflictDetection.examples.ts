/**
 * Exemples d'utilisation de la détection de conflits
 * Tests pour Marseille
 */

import { 
  detecterConflitHoraire, 
  verifierConflitAvecPlanning,
  trouverProchainCreneauDisponible,
  type Course 
} from './conflictDetection';

// ============================================
// EXEMPLE 1: Deux courses sans conflit
// ============================================
console.log('📋 EXEMPLE 1: Deux courses sans conflit\n');

const course1: Course = {
  id: '1',
  depart: 'Gare Saint-Charles',
  arrivee: 'Vieux-Port',
  date_heure: '2026-01-14T10:00:00Z',
  duree_minutes: 20,
  distance_km: 3.5,
  depart_coords: { lat: 43.3031, lng: 5.3806 },
  arrivee_coords: { lat: 43.2951, lng: 5.3744 }
};

const course2: Course = {
  id: '2',
  depart: 'Castellane',
  arrivee: 'Prado',
  date_heure: '2026-01-14T11:00:00Z', // 1h après
  duree_minutes: 15,
  distance_km: 2.8,
  depart_coords: { lat: 43.2865, lng: 5.3951 },
  arrivee_coords: { lat: 43.2695, lng: 5.3950 }
};

const resultat1 = detecterConflitHoraire(course1, course2);
console.log(resultat1.message);
console.log('Détails:', resultat1.details);
console.log('\n---\n');

// ============================================
// EXEMPLE 2: Deux courses EN CONFLIT
// ============================================
console.log('📋 EXEMPLE 2: Deux courses EN CONFLIT\n');

const course3: Course = {
  id: '3',
  depart: 'Aéroport',
  arrivee: 'Vieux-Port',
  date_heure: '2026-01-14T14:00:00Z',
  duree_minutes: 25,
  distance_km: 22,
  depart_coords: { lat: 43.4366, lng: 5.2144 },
  arrivee_coords: { lat: 43.2951, lng: 5.3744 }
};

const course4: Course = {
  id: '4',
  depart: 'Castellane', // Loin du Vieux-Port
  arrivee: 'La Timone',
  date_heure: '2026-01-14T14:30:00Z', // Seulement 30 min après
  duree_minutes: 20,
  distance_km: 5.5,
  depart_coords: { lat: 43.2865, lng: 5.3951 },
  arrivee_coords: { lat: 43.2900, lng: 5.4050 }
};

const resultat2 = detecterConflitHoraire(course3, course4);
console.log(resultat2.message);
console.log('Détails:', resultat2.details);
console.log('\n---\n');

// ============================================
// EXEMPLE 3: Vérification avec buffer personnalisé
// ============================================
console.log('📋 EXEMPLE 3: Buffer de sécurité personnalisé (20 min)\n');

const resultat3 = detecterConflitHoraire(course1, course2, {
  bufferSecurite: 20, // Buffer plus long
  vitesseMoyenne: 20  // Vitesse réduite (trafic dense)
});
console.log(resultat3.message);
console.log('\n---\n');

// ============================================
// EXEMPLE 4: Erreur d'ordre chronologique
// ============================================
console.log('📋 EXEMPLE 4: Erreur - Course B avant Course A\n');

const resultat4 = detecterConflitHoraire(course2, course1); // Inversé !
console.log(resultat4.message);
console.log('\n---\n');

// ============================================
// EXEMPLE 5: Vérification avec un planning existant
// ============================================
console.log('📋 EXEMPLE 5: Vérification avec planning complet\n');

const planningExistant: Course[] = [
  {
    id: 'P1',
    depart: 'Gare',
    arrivee: 'Aéroport',
    date_heure: '2026-01-14T09:00:00Z',
    duree_minutes: 30,
    distance_km: 22,
    depart_coords: { lat: 43.3031, lng: 5.3806 },
    arrivee_coords: { lat: 43.4366, lng: 5.2144 }
  },
  {
    id: 'P2',
    depart: 'Vieux-Port',
    arrivee: 'Castellane',
    date_heure: '2026-01-14T11:00:00Z',
    duree_minutes: 15,
    distance_km: 3.5,
    depart_coords: { lat: 43.2951, lng: 5.3744 },
    arrivee_coords: { lat: 43.2865, lng: 5.3951 }
  },
  {
    id: 'P3',
    depart: 'Prado',
    arrivee: 'Bonneveine',
    date_heure: '2026-01-14T13:00:00Z',
    duree_minutes: 20,
    distance_km: 4.2,
    depart_coords: { lat: 43.2695, lng: 5.3950 },
    arrivee_coords: { lat: 43.2550, lng: 5.3800 }
  }
];

const nouvelleCourseOK: Course = {
  id: 'N1',
  depart: 'Canebière',
  arrivee: 'Joliette',
  date_heure: '2026-01-14T10:30:00Z', // Entre P1 et P2
  duree_minutes: 10,
  distance_km: 1.5,
  depart_coords: { lat: 43.2965, lng: 5.3765 },
  arrivee_coords: { lat: 43.3050, lng: 5.3655 }
};

const resultat5 = verifierConflitAvecPlanning(nouvelleCourseOK, planningExistant);
console.log('Nouvelle course à 10h30:', resultat5.message);
console.log('\n');

const nouvelleCourseKO: Course = {
  id: 'N2',
  depart: 'Belsunce',
  arrivee: 'Estaque',
  date_heure: '2026-01-14T11:05:00Z', // Juste après P2
  duree_minutes: 35,
  distance_km: 18,
  depart_coords: { lat: 43.2990, lng: 5.3785 },
  arrivee_coords: { lat: 43.3600, lng: 5.3100 }
};

const resultat6 = verifierConflitAvecPlanning(nouvelleCourseKO, planningExistant);
console.log('Nouvelle course à 11h05:', resultat6.message);
console.log('\n---\n');

// ============================================
// EXEMPLE 6: Trouver le prochain créneau disponible
// ============================================
console.log('📋 EXEMPLE 6: Recherche de créneau disponible\n');

if (resultat6.hasConflict) {
  const prochainCreneau = trouverProchainCreneauDisponible(
    nouvelleCourseKO, 
    planningExistant
  );
  console.log('Créneau proposé:', prochainCreneau.toISOString());
  console.log('Format lisible:', prochainCreneau.toLocaleString('fr-FR'));
}

console.log('\n---\n');

// ============================================
// EXEMPLE 7: Cas réel Marseille - Journée chargée
// ============================================
console.log('📋 EXEMPLE 7: Journée type à Marseille\n');

const journeeType: Course[] = [
  {
    id: 'J1',
    depart: 'Aéroport',
    arrivee: 'Hôtel Sofitel',
    date_heure: '2026-01-14T08:00:00Z',
    duree_minutes: 25,
    distance_km: 24,
    depart_coords: { lat: 43.4366, lng: 5.2144 },
    arrivee_coords: { lat: 43.2951, lng: 5.3744 }
  },
  {
    id: 'J2',
    depart: 'Gare Saint-Charles',
    arrivee: 'Prado',
    date_heure: '2026-01-14T09:30:00Z',
    duree_minutes: 20,
    distance_km: 5.5,
    depart_coords: { lat: 43.3031, lng: 5.3806 },
    arrivee_coords: { lat: 43.2695, lng: 5.3950 }
  },
  {
    id: 'J3',
    depart: 'Castellane',
    arrivee: 'Aéroport',
    date_heure: '2026-01-14T11:00:00Z',
    duree_minutes: 30,
    distance_km: 23,
    depart_coords: { lat: 43.2865, lng: 5.3951 },
    arrivee_coords: { lat: 43.4366, lng: 5.2144 }
  }
];

// Tester une demande client à 10h15
const demandeClient: Course = {
  id: 'DC1',
  depart: 'Vieux-Port',
  arrivee: 'La Timone',
  date_heure: '2026-01-14T10:15:00Z',
  duree_minutes: 18,
  distance_km: 4.8,
  depart_coords: { lat: 43.2951, lng: 5.3744 },
  arrivee_coords: { lat: 43.2900, lng: 5.4050 }
};

const resultatJournee = verifierConflitAvecPlanning(demandeClient, journeeType, {
  bufferSecurite: 15,
  vitesseMoyenne: 22 // Trafic moyen Marseille
});

console.log('Demande client à 10h15:');
console.log(resultatJournee.message);

if (resultatJournee.hasConflict) {
  const creneauAlternatif = trouverProchainCreneauDisponible(demandeClient, journeeType, {
    bufferSecurite: 15,
    vitesseMoyenne: 22
  });
  console.log('\n💡 Proposition alternative:', creneauAlternatif.toLocaleString('fr-FR'));
}

console.log('\n✅ Tous les tests terminés !');
