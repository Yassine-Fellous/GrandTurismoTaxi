'use client';

import { useState, useEffect } from 'react';
import { Reservation, ReservationStatus } from '@/lib/supabase';
import { Calendar, MapPin, Phone, User, Clock, Euro, TrendingUp, CheckCircle, XCircle, Loader, RefreshCw, ExternalLink, Save } from 'lucide-react';

const statusColors = {
  pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50',
  confirmed: 'bg-green-500/20 text-green-400 border-green-500/50',
  rejected: 'bg-red-500/20 text-red-400 border-red-500/50',
  completed: 'bg-blue-500/20 text-blue-400 border-blue-500/50',
  cancelled: 'bg-gray-500/20 text-gray-400 border-gray-500/50',
};

const statusLabels = {
  pending: 'En attente',
  confirmed: 'Confirmée',
  rejected: 'Refusée',
  completed: 'Terminée',
  cancelled: 'Annulée',
};

export default function ReservationsList() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<ReservationStatus | 'all'>('all');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [editingMapLink, setEditingMapLink] = useState<string | null>(null);
  const [mapLinkValue, setMapLinkValue] = useState<string>('');

  const fetchReservations = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/reservations');
      if (response.ok) {
        const data = await response.json();
        setReservations(data.reservations || []);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des réservations:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations();
    // Rafraîchir toutes les 30 secondes
    const interval = setInterval(fetchReservations, 30000);
    return () => clearInterval(interval);
  }, []);

  const updateStatus = async (id: string, status: ReservationStatus) => {
    try {
      setUpdatingId(id);
      const response = await fetch('/api/admin/reservations', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      });

      if (response.ok) {
        await fetchReservations();
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
    } finally {
      setUpdatingId(null);
    }
  };

  const updateMapLink = async (id: string, maps_link: string) => {
    try {
      setUpdatingId(id);
      const response = await fetch('/api/admin/reservations', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, maps_link }),
      });

      if (response.ok) {
        await fetchReservations();
        setEditingMapLink(null);
        setMapLinkValue('');
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredReservations = filter === 'all' 
    ? reservations 
    : reservations.filter(r => r.status === filter);

  const formatDate = (dateStr: string, showTimezone = true) => {
    const date = new Date(dateStr);
    const formatted = date.toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
    
    if (showTimezone) {
      const offset = -date.getTimezoneOffset() / 60;
      const timezone = offset >= 0 ? `UTC+${offset}` : `UTC${offset}`;
      return `${formatted} (${timezone})`;
    }
    return formatted;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader className="animate-spin text-gt-red" size={48} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête et filtres */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Réservations</h2>
          <p className="text-gray-400 mt-1">{reservations.length} réservation(s) au total</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={fetchReservations}
            className="p-2 rounded-lg bg-gt-gray hover:bg-gt-gray/70 transition-colors"
            title="Rafraîchir"
          >
            <RefreshCw size={20} />
          </button>
          
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as ReservationStatus | 'all')}
            className="px-4 py-2 rounded-lg bg-gt-gray border border-gray-700 focus:border-gt-red focus:outline-none"
          >
            <option value="all">Toutes</option>
            <option value="pending">En attente</option>
            <option value="confirmed">Confirmées</option>
            <option value="rejected">Refusées</option>
            <option value="completed">Terminées</option>
            <option value="cancelled">Annulées</option>
          </select>
        </div>
      </div>

      {/* Liste des réservations */}
      {filteredReservations.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          Aucune réservation {filter !== 'all' && `avec le statut "${statusLabels[filter as ReservationStatus]}"`}
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredReservations.map((reservation) => (
            <div
              key={reservation.id}
              className="bg-gt-gray border border-gray-800 rounded-xl p-6 hover:border-gt-red/50 transition-all"
            >
              {/* Header avec statut */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <User className="text-gt-red" size={24} />
                  <div>
                    <h3 className="text-lg font-semibold text-white">{reservation.nom}</h3>
                    <p className="text-gray-400 flex items-center gap-2 text-sm">
                      <Phone size={14} />
                      {reservation.telephone}
                    </p>
                  </div>
                </div>
                
                <span className={`px-3 py-1 rounded-full text-sm font-medium border ${statusColors[reservation.status]}`}>
                  {statusLabels[reservation.status]}
                </span>
              </div>

              {/* Informations du trajet */}
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div className="space-y-2">
                  <div className="flex items-start gap-2 text-sm">
                    <MapPin className="text-green-500 flex-shrink-0 mt-0.5" size={16} />
                    <div className="flex-1">
                      <p className="text-gray-400">Départ</p>
                      <p className="text-white">{reservation.depart}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-2 text-sm">
                    <MapPin className="text-red-500 flex-shrink-0 mt-0.5" size={16} />
                    <div className="flex-1">
                      <p className="text-gray-400">Arrivée</p>
                      <p className="text-white">{reservation.arrivee}</p>
                    </div>
                  </div>
                  
                  {/* Lien Maps personnalisé */}
                  {editingMapLink === reservation.id ? (
                    <div className="flex gap-2 mt-2">
                      <input
                        type="text"
                        value={mapLinkValue}
                        onChange={(e) => setMapLinkValue(e.target.value)}
                        placeholder="Collez le lien Google Maps"
                        className="flex-1 px-3 py-1.5 bg-gt-black border border-gray-700 rounded-lg text-white text-xs focus:outline-none focus:border-gt-red"
                      />
                      <button
                        onClick={() => updateMapLink(reservation.id, mapLinkValue)}
                        disabled={updatingId === reservation.id}
                        className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors text-xs disabled:opacity-50"
                      >
                        <Save size={14} />
                      </button>
                      <button
                        onClick={() => {
                          setEditingMapLink(null);
                          setMapLinkValue('');
                        }}
                        className="px-3 py-1.5 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors text-xs"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2 mt-2">
                      {reservation.maps_link ? (
                        <>
                          <a
                            href={reservation.maps_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors text-xs"
                          >
                            <ExternalLink size={12} />
                            Lien Maps enregistré
                          </a>
                          <button
                            onClick={() => {
                              setEditingMapLink(reservation.id);
                              setMapLinkValue(reservation.maps_link || '');
                            }}
                            className="px-3 py-1.5 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors text-xs"
                          >
                            Modifier
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => {
                            setEditingMapLink(reservation.id);
                            setMapLinkValue('');
                          }}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors text-xs"
                        >
                          + Ajouter un lien Maps
                        </button>
                      )}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="text-gt-red" size={16} />
                    <div>
                      <p className="text-gray-400">Date et heure</p>
                      <p className="text-white">{formatDate(reservation.date_heure)}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="text-gt-red" size={16} />
                    <div>
                      <p className="text-gray-400">Durée estimée</p>
                      <p className="text-white">{reservation.duree_minutes} min ({reservation.distance_km.toFixed(1)} km)</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Détails du tarif */}
              <div className="bg-black/30 rounded-lg p-4 mb-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-gray-400">Prix total</p>
                    <p className="text-xl font-bold text-gt-red">{reservation.prix_total.toFixed(2)} €</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Passagers</p>
                    <p className="text-white">{reservation.nombre_passagers}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Tarif</p>
                    <p className="text-white">{reservation.tarif_applique}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Options</p>
                    <div className="flex gap-2 mt-1">
                      {reservation.bagage_volumineux && <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded text-xs">Bagages</span>}
                      {reservation.retour_vide && <span className="px-2 py-0.5 bg-purple-500/20 text-purple-400 rounded text-xs">Retour</span>}
                      {reservation.nuit_ferie && <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 rounded text-xs">Nuit</span>}
                    </div>
                  </div>
                </div>
              </div>

              {/* Commentaire */}
              {reservation.commentaire && (
                <div className="mb-4 text-sm">
                  <p className="text-gray-400">Commentaire :</p>
                  <p className="text-white italic">{reservation.commentaire}</p>
                </div>
              )}

              {/* Actions */}
              {reservation.status === 'pending' && (
                <div className="flex gap-3 pt-4 border-t border-gray-800">
                  <button
                    onClick={() => updateStatus(reservation.id, 'confirmed')}
                    disabled={updatingId === reservation.id}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50"
                  >
                    {updatingId === reservation.id ? (
                      <Loader className="animate-spin" size={18} />
                    ) : (
                      <>
                        <CheckCircle size={18} />
                        Confirmer
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => updateStatus(reservation.id, 'rejected')}
                    disabled={updatingId === reservation.id}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50"
                  >
                    {updatingId === reservation.id ? (
                      <Loader className="animate-spin" size={18} />
                    ) : (
                      <>
                        <XCircle size={18} />
                        Refuser
                      </>
                    )}
                  </button>
                </div>
              )}

              {reservation.status === 'confirmed' && (
                <div className="flex gap-3 pt-4 border-t border-gray-800">
                  <button
                    onClick={() => updateStatus(reservation.id, 'completed')}
                    disabled={updatingId === reservation.id}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
                  >
                    {updatingId === reservation.id ? (
                      <Loader className="animate-spin" size={18} />
                    ) : (
                      <>
                        <CheckCircle size={18} />
                        Marquer comme terminée
                      </>
                    )}
                  </button>
                  
                  {/* Bouton Google Calendar */}
                  <a
                    href={(() => {
                      const start = new Date(reservation.date_heure);
                      const end = new Date(start.getTime() + reservation.duree_minutes * 60000);
                      const formatGCal = (date: Date) => date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
                      
                      const params = new URLSearchParams({
                        action: 'TEMPLATE',
                        text: `Taxi - ${reservation.nom}`,
                        dates: `${formatGCal(start)}/${formatGCal(end)}`,
                        details: `Client: ${reservation.nom}\nTéléphone: ${reservation.telephone}\nDépart: ${reservation.depart}\nArrivée: ${reservation.arrivee}\nPrix: ${reservation.prix_total.toFixed(2)}€${reservation.commentaire ? `\nCommentaire: ${reservation.commentaire}` : ''}`,
                        location: reservation.depart,
                      });
                      
                      return `https://calendar.google.com/calendar/render?${params.toString()}`;
                    })()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                  >
                    📅 Ajouter à l'agenda
                  </a>
                </div>
              )}

              {/* Date de création */}
              <div className="text-xs text-gray-500 mt-4">
                Créée le {formatDate(reservation.created_at)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
