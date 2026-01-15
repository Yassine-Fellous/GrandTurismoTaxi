'use client';

import { useState, useEffect } from 'react';
import { Reservation, ReservationStatus } from '@/lib/supabase';
import { Calendar, Clock, MapPin, ChevronLeft, ChevronRight, CheckCircle, XCircle, Loader, User, Phone, Euro } from 'lucide-react';

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

export default function CalendarView() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<'day' | 'month'>('day');
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);

  useEffect(() => {
    fetchReservations();
  }, []);

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
        setSelectedReservation(null);
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
    } finally {
      setUpdatingId(null);
    }
  };

  const getReservationsForDate = (date: Date) => {
    return reservations.filter(r => {
      const resDate = new Date(r.date_heure);
      return (
        resDate.getDate() === date.getDate() &&
        resDate.getMonth() === date.getMonth() &&
        resDate.getFullYear() === date.getFullYear() &&
        r.status !== 'rejected' &&
        r.status !== 'cancelled'
      );
    }).sort((a, b) => new Date(a.date_heure).getTime() - new Date(b.date_heure).getTime());
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('fr-FR', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const goToPreviousDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() - 1);
    setSelectedDate(newDate);
  };

  const goToNextDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + 1);
    setSelectedDate(newDate);
  };

  const goToPreviousMonth = () => {
    const newDate = new Date(selectedDate);
    newDate.setMonth(newDate.getMonth() - 1);
    setSelectedDate(newDate);
  };

  const goToNextMonth = () => {
    const newDate = new Date(selectedDate);
    newDate.setMonth(newDate.getMonth() + 1);
    setSelectedDate(newDate);
  };

  const goToToday = () => {
    setSelectedDate(new Date());
  };

  const getMonthCalendar = () => {
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const endDate = new Date(lastDay);
    endDate.setDate(endDate.getDate() + (6 - lastDay.getDay()));
    
    const days = [];
    const currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      days.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return days;
  };

  const getDayReservations = (date: Date) => {
    return reservations.filter(r => {
      const resDate = new Date(r.date_heure);
      return (
        resDate.getDate() === date.getDate() &&
        resDate.getMonth() === date.getMonth() &&
        resDate.getFullYear() === date.getFullYear() &&
        r.status !== 'rejected' &&
        r.status !== 'cancelled'
      );
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader className="animate-spin text-gt-red" size={48} />
      </div>
    );
  }

  // Vue mois
  if (viewMode === 'month') {
    const monthDays = getMonthCalendar();
    const weekDays = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
    
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <Calendar className="text-gt-red" />
              Calendrier mensuel
            </h2>
            <p className="text-gray-400 mt-1 capitalize">
              {selectedDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
            </p>
          </div>
          
          <div className="flex gap-2">
            <button onClick={goToPreviousMonth} className="p-2 bg-gt-gray hover:bg-gt-gray/70 rounded-lg">
              <ChevronLeft size={20} />
            </button>
            <button onClick={goToToday} className="px-4 py-2 bg-gt-red hover:bg-red-700 rounded-lg">
              Aujourd'hui
            </button>
            <button onClick={goToNextMonth} className="p-2 bg-gt-gray hover:bg-gt-gray/70 rounded-lg">
              <ChevronRight size={20} />
            </button>
            <button onClick={() => setViewMode('day')} className="px-4 py-2 bg-gt-gray hover:bg-gt-gray/70 rounded-lg">
              Vue journalière
            </button>
          </div>
        </div>

        <div className="bg-gt-gray rounded-lg border border-gray-800 overflow-hidden">
          <div className="grid grid-cols-7 bg-gt-black border-b border-gray-800">
            {weekDays.map(day => (
              <div key={day} className="p-3 text-center text-sm font-semibold text-gray-400">{day}</div>
            ))}
          </div>
          
          <div className="grid grid-cols-7">
            {monthDays.map((day, index) => {
              const dayReservations = getDayReservations(day);
              const isToday = day.toDateString() === new Date().toDateString();
              const isCurrentMonth = day.getMonth() === selectedDate.getMonth();
              
              return (
                <button
                  key={index}
                  onClick={() => {
                    setSelectedDate(day);
                    setViewMode('day');
                  }}
                  className={`min-h-[100px] p-2 border-r border-b border-gray-800 text-left hover:bg-gt-red/5 transition-colors ${!isCurrentMonth ? 'bg-gt-black/50' : ''} ${isToday ? 'bg-gt-red/10 border-gt-red' : ''}`}
                >
                  <div className={`text-sm font-medium mb-1 flex items-center justify-between ${isToday ? 'text-gt-red' : isCurrentMonth ? 'text-white' : 'text-gray-600'}`}>
                    <span>{day.getDate()}</span>
                    {dayReservations.length > 0 && (
                      <span className="text-xs bg-gt-red text-white rounded-full w-5 h-5 flex items-center justify-center">
                        {dayReservations.length}
                      </span>
                    )}
                  </div>
                  
                  {dayReservations.length > 0 && (
                    <div className="space-y-1">
                      {dayReservations.slice(0, 2).map(res => (
                        <div
                          key={res.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedReservation(res);
                          }}
                          className={`w-full text-left p-1 rounded text-xs truncate border ${statusColors[res.status]} cursor-pointer hover:opacity-80`}
                        >
                          {new Date(res.date_heure).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })} - {res.nom}
                        </div>
                      ))}
                      {dayReservations.length > 2 && (
                        <div className="text-xs text-gray-500 pl-1">+{dayReservations.length - 2} autre(s)</div>
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {selectedReservation && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={() => setSelectedReservation(null)}>
            <div className="bg-gt-gray border border-gray-800 rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <User size={24} className="text-gt-red" />{selectedReservation.nom}
                  </h3>
                  <p className="text-gray-400 flex items-center gap-2 mt-1">
                    <Phone size={16} />{selectedReservation.telephone}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium border ${statusColors[selectedReservation.status]}`}>
                  {statusLabels[selectedReservation.status]}
                </span>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-gray-400 text-sm mb-1">Trajet</p>
                  <div className="flex items-center gap-2 text-white">
                    <MapPin size={16} className="text-green-500" />{selectedReservation.depart}
                  </div>
                  <div className="flex items-center gap-2 text-white mt-1">
                    <MapPin size={16} className="text-red-500" />{selectedReservation.arrivee}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-400 text-sm mb-1">Date et heure</p>
                    <p className="text-white">
                      {new Date(selectedReservation.date_heure).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm mb-1">Durée / Distance</p>
                    <p className="text-white">{selectedReservation.duree_minutes} min / {selectedReservation.distance_km.toFixed(1)} km</p>
                  </div>
                </div>

                <div className="bg-black/30 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Prix total</span>
                    <span className="text-2xl font-bold text-gt-red flex items-center gap-1">
                      <Euro size={20} />{selectedReservation.prix_total.toFixed(2)}
                    </span>
                  </div>
                </div>

                {selectedReservation.commentaire && (
                  <div>
                    <p className="text-gray-400 text-sm mb-1">Commentaire</p>
                    <p className="text-white italic">{selectedReservation.commentaire}</p>
                  </div>
                )}

                {selectedReservation.status === 'pending' && (
                  <div className="flex gap-3 pt-4">
                    <button onClick={() => updateStatus(selectedReservation.id, 'confirmed')} disabled={updatingId === selectedReservation.id} className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50">
                      {updatingId === selectedReservation.id ? <Loader className="animate-spin" size={18} /> : <><CheckCircle size={18} />Confirmer</>}
                    </button>
                    <button onClick={() => updateStatus(selectedReservation.id, 'rejected')} disabled={updatingId === selectedReservation.id} className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50">
                      {updatingId === selectedReservation.id ? <Loader className="animate-spin" size={18} /> : <><XCircle size={18} />Refuser</>}
                    </button>
                  </div>
                )}

                {selectedReservation.status === 'confirmed' && (
                  <button onClick={() => updateStatus(selectedReservation.id, 'completed')} disabled={updatingId === selectedReservation.id} className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50">
                    {updatingId === selectedReservation.id ? <Loader className="animate-spin" size={18} /> : <><CheckCircle size={18} />Marquer comme terminée</>}
                  </button>
                )}

                <button onClick={() => setSelectedReservation(null)} className="w-full px-4 py-2 bg-gt-black hover:bg-black text-white rounded-lg transition-colors">
                  Fermer
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Vue journée
  const dayReservations = getReservationsForDate(selectedDate);
  const hours = Array.from({ length: 24 }, (_, i) => i);

  const isHourOccupied = (hour: number) => {
    return dayReservations.some(r => {
      const startTime = new Date(r.date_heure);
      const hourStart = new Date(selectedDate);
      hourStart.setHours(hour, 0, 0, 0);
      return startTime.getHours() === hour;
    });
  };

  const getReservationsForHour = (hour: number) => {
    return dayReservations.filter(r => new Date(r.date_heure).getHours() === hour);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Calendar className="text-gt-red" />Planning des créneaux
          </h2>
          <p className="text-gray-400 mt-1 capitalize">{formatDate(selectedDate)}</p>
          <p className="text-xs text-gray-500 mt-1">
            ⏰ Heures affichées en heure locale (fuseau: {Intl.DateTimeFormat().resolvedOptions().timeZone})
          </p>
        </div>
        
        <div className="flex gap-2">
          <button onClick={goToPreviousDay} className="p-2 bg-gt-gray hover:bg-gt-gray/70 rounded-lg"><ChevronLeft size={20} /></button>
          <button onClick={goToToday} className="px-4 py-2 bg-gt-red hover:bg-red-700 rounded-lg">Aujourd'hui</button>
          <button onClick={goToNextDay} className="p-2 bg-gt-gray hover:bg-gt-gray/70 rounded-lg"><ChevronRight size={20} /></button>
          <button onClick={() => setViewMode('month')} className="px-4 py-2 bg-gt-gray hover:bg-gt-gray/70 rounded-lg">Vue mensuelle</button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-gt-gray p-4 rounded-lg border border-gray-800">
          <p className="text-gray-400 text-sm">Réservations du jour</p>
          <p className="text-2xl font-bold text-white mt-1">{dayReservations.length}</p>
        </div>
        <div className="bg-gt-gray p-4 rounded-lg border border-gray-800">
          <p className="text-gray-400 text-sm">Heures occupées</p>
          <p className="text-2xl font-bold text-white mt-1">{hours.filter(h => isHourOccupied(h)).length}</p>
        </div>
        <div className="bg-gt-gray p-4 rounded-lg border border-gray-800">
          <p className="text-gray-400 text-sm">Disponibilité</p>
          <p className="text-2xl font-bold text-green-400 mt-1">{24 - hours.filter(h => isHourOccupied(h)).length}h libres</p>
        </div>
      </div>

      <div className="bg-gt-gray rounded-lg border border-gray-800 overflow-hidden">
        <div className="grid grid-cols-1 divide-y divide-gray-800">
          {hours.map(hour => {
            const occupied = isHourOccupied(hour);
            const hourReservations = getReservationsForHour(hour);
            
            return (
              <div key={hour} className={`p-4 transition-colors ${occupied ? 'bg-red-900/20' : 'hover:bg-gt-black/30'}`}>
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-20">
                    <div className="flex items-center gap-2">
                      <Clock size={16} className={occupied ? 'text-red-400' : 'text-gray-500'} />
                      <span className={`font-mono text-lg ${occupied ? 'text-red-400 font-bold' : 'text-gray-400'}`}>
                        {hour.toString().padStart(2, '0')}:00
                      </span>
                    </div>
                  </div>

                  <div className="flex-1">
                    {hourReservations.length === 0 ? (
                      <p className="text-gray-500 text-sm">Aucune réservation</p>
                    ) : (
                      <div className="space-y-2">
                        {hourReservations.map(res => (
                          <div key={res.id} className="bg-gt-black border border-red-900/50 rounded-lg p-3">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-semibold text-white">{res.nom}</span>
                                  <span className={`px-2 py-0.5 rounded text-xs border ${statusColors[res.status]}`}>
                                    {statusLabels[res.status]}
                                  </span>
                                </div>
                                
                                <div className="text-sm text-gray-400 space-y-1">
                                  <div className="flex items-center gap-2">
                                    <Clock size={14} />
                                    <span>{formatTime(res.date_heure)} ({res.duree_minutes} min)</span>
                                  </div>
                                  <div className="flex items-start gap-2">
                                    <MapPin size={14} className="flex-shrink-0 mt-0.5" />
                                    <span className="line-clamp-1">{res.depart} → {res.arrivee}</span>
                                  </div>
                                </div>

                                {res.status === 'pending' && (
                                  <div className="flex gap-2 mt-2">
                                    <button onClick={() => updateStatus(res.id, 'confirmed')} disabled={updatingId === res.id} className="flex items-center gap-1 px-2 py-1 bg-green-600 hover:bg-green-700 text-white text-xs rounded transition-colors disabled:opacity-50">
                                      {updatingId === res.id ? <Loader className="animate-spin" size={12} /> : <><CheckCircle size={12} /> Confirmer</>}
                                    </button>
                                    <button onClick={() => updateStatus(res.id, 'rejected')} disabled={updatingId === res.id} className="flex items-center gap-1 px-2 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded transition-colors disabled:opacity-50">
                                      {updatingId === res.id ? <Loader className="animate-spin" size={12} /> : <><XCircle size={12} /> Refuser</>}
                                    </button>
                                  </div>
                                )}

                                {res.status === 'confirmed' && (
                                  <button onClick={() => updateStatus(res.id, 'completed')} disabled={updatingId === res.id} className="flex items-center gap-1 px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded transition-colors disabled:opacity-50 mt-2">
                                    {updatingId === res.id ? <Loader className="animate-spin" size={12} /> : <><CheckCircle size={12} /> Terminée</>}
                                  </button>
                                )}
                              </div>
                              
                              <div className="text-right">
                                <p className="text-gt-red font-bold">{res.prix_total.toFixed(2)} €</p>
                                <p className="text-xs text-gray-500">{res.distance_km.toFixed(1)} km</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
