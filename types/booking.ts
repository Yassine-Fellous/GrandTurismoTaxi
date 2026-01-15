export interface Booking {
  id: string;
  nom: string;
  email?: string;
  telephone: string;
  depart: string;
  arrivee: string;
  dateHeure: string;
  commentaire?: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  createdAt: string;
}

export interface BookingFormData {
  nom: string;
  email: string;
  telephone: string;
  depart: string;
  arrivee: string;
  dateHeure: string;
  commentaire?: string;
}
