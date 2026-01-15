export interface TarifEstimation {
  tarif_applique: string;
  detail: {
    prise_en_charge: number;
    cout_distance: number;
    cout_trafic_est: number;
    supplements: number;
  };
  total_estime: number;
}

export interface EstimationParams {
  distance_km: number;
  duree_minutes: number;
  est_nuit_ou_ferie: boolean;
  retour_a_vide: boolean;
  nb_bagages_supp: number;
  nb_passagers: number;
}
