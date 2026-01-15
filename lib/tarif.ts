import { TarifEstimation, EstimationParams } from '@/types/tarif';

export function estimerTaxi13(params: EstimationParams): TarifEstimation {
  const {
    distance_km,
    duree_minutes,
    est_nuit_ou_ferie,
    retour_a_vide,
    nb_bagages_supp,
    nb_passagers,
  } = params;

  // 1. Constantes
  const PRISE_EN_CHARGE = 2.35;
  const TARIF_HORAIRE = 34.60;
  const MINIMUM_PERCEPTION = 8.00;

  // 2. Détermination du Tarif Kilométrique (A, B, C, D)
  let tarif_km: number;
  let nom_tarif: string;

  if (!est_nuit_ou_ferie) {
    // JOUR (7h-19h)
    if (retour_a_vide) {
      tarif_km = 2.22; // Tarif C
      nom_tarif = "C (Jour, Retour vide)";
    } else {
      tarif_km = 1.11; // Tarif A
      nom_tarif = "A (Jour, Retour charge)";
    }
  } else {
    // NUIT (19h-7h) ou Dimanche/Férié
    if (retour_a_vide) {
      tarif_km = 2.88; // Tarif D
      nom_tarif = "D (Nuit, Retour vide)";
    } else {
      tarif_km = 1.44; // Tarif B
      nom_tarif = "B (Nuit, Retour charge)";
    }
  }

  // 3. Calcul de la composante "Distance"
  const cout_distance = distance_km * tarif_km;

  // 4. Calcul de la composante "Temps" (Approximation trafic)
  // 15% du temps est facturé à l'heure (feux rouges, trafic)
  const temps_facture_heure = (duree_minutes / 60) * 0.15;
  const cout_temps = temps_facture_heure * TARIF_HORAIRE;

  // 5. Calcul des Suppléments
  // Les bagages sont INCLUS dans le tarif (sauf bagages volumineux ou exceptionnels)
  // Supplément bagage uniquement pour bagages volumineux/encombrants
  const cout_bagages = nb_bagages_supp * 2.00; // Bagages volumineux uniquement

  let cout_passagers = 0;
  if (nb_passagers >= 5) {
    // 4€ par passager à partir du 5ème
    cout_passagers = (nb_passagers - 4) * 4.00;
  }

  const supplements = cout_bagages + cout_passagers;

  // 6. Total
  let total = PRISE_EN_CHARGE + cout_distance + cout_temps + supplements;

  // Application du minimum
  if (total < MINIMUM_PERCEPTION) {
    total = MINIMUM_PERCEPTION;
  }

  return {
    tarif_applique: nom_tarif,
    detail: {
      prise_en_charge: PRISE_EN_CHARGE,
      cout_distance: Math.round(cout_distance * 100) / 100,
      cout_trafic_est: Math.round(cout_temps * 100) / 100,
      supplements: supplements,
    },
    total_estime: Math.round(total * 100) / 100,
  };
}
