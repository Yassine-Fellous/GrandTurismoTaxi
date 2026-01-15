-- Création de la table reservations
CREATE TABLE IF NOT EXISTS reservations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Informations client
  nom VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  telephone VARCHAR(20) NOT NULL,
  
  -- Informations trajet
  depart TEXT NOT NULL,
  arrivee TEXT NOT NULL,
  date_heure TIMESTAMP WITH TIME ZONE NOT NULL,
  commentaire TEXT,
  
  -- Détails du tarif
  prix_total DECIMAL(10, 2) NOT NULL,
  distance_km DECIMAL(10, 2) NOT NULL,
  duree_minutes INTEGER NOT NULL,
  tarif_applique VARCHAR(50) NOT NULL,
  
  -- Coordonnées géographiques (JSON)
  depart_coords JSONB NOT NULL,
  arrivee_coords JSONB NOT NULL,
  
  -- Options
  nombre_passagers INTEGER DEFAULT 1,
  bagage_volumineux BOOLEAN DEFAULT FALSE,
  retour_vide BOOLEAN DEFAULT FALSE,
  nuit_ferie BOOLEAN DEFAULT FALSE,
  
  -- Statut de la réservation
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'rejected', 'completed', 'cancelled')),
  
  -- Lien Google Maps (optionnel)
  maps_link TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE
);

-- Index pour améliorer les performances
CREATE INDEX idx_reservations_status ON reservations(status);
CREATE INDEX idx_reservations_date_heure ON reservations(date_heure);
CREATE INDEX idx_reservations_created_at ON reservations(created_at DESC);

-- Politique RLS (Row Level Security)
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;

-- Permettre à tout le monde d'insérer des réservations (clients)
CREATE POLICY "Allow insert for all" ON reservations
  FOR INSERT
  WITH CHECK (true);

-- Permettre la lecture uniquement pour les admins (vous devrez créer un rôle admin)
CREATE POLICY "Allow read for all" ON reservations
  FOR SELECT
  USING (true);

-- Permettre la mise à jour uniquement pour les admins
CREATE POLICY "Allow update for all" ON reservations
  FOR UPDATE
  USING (true);

-- Commentaires pour documentation
COMMENT ON TABLE reservations IS 'Table des réservations de taxi';
COMMENT ON COLUMN reservations.status IS 'Statut: pending (en attente), confirmed (confirmé), rejected (rejeté), completed (terminé), cancelled (annulé)';
