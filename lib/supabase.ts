import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types pour la base de données
export type ReservationStatus = 'pending' | 'confirmed' | 'rejected' | 'completed' | 'cancelled';

export interface Reservation {
  id: string;
  nom: string;
  telephone: string;
  depart: string;
  arrivee: string;
  date_heure: string;
  commentaire?: string;
  
  // Détails du tarif
  prix_total: number;
  distance_km: number;
  duree_minutes: number;
  tarif_applique: string;
  
  // Coordonnées géographiques
  depart_coords: {
    lat: number;
    lng: number;
  };
  arrivee_coords: {
    lat: number;
    lng: number;
  };
  
  // Options
  nombre_passagers: number;
  bagage_volumineux: boolean;
  retour_vide: boolean;
  nuit_ferie: boolean;
  
  // Statut
  status: ReservationStatus;
  
  // Timestamps
  created_at: string;
  updated_at?: string;
}
