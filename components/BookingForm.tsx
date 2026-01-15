'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { BookingFormData } from '@/types/booking';
import { TarifEstimation } from '@/types/tarif';
import { calculateDistance, Coordinates } from '@/lib/distanceCalculator';
import AddressAutocomplete from './AddressAutocomplete';
import RouteMap from './RouteMap';
import { useLanguage } from '@/contexts/LanguageContext';
import { Calendar, MapPin, Phone, User, MessageSquare, Luggage, Users, Moon, ArrowLeftRight, Calculator } from 'lucide-react';

// Fonction pour formater la durée en heures et minutes
const formatDuree = (minutes: number): string => {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const heures = Math.floor(minutes / 60);
  const minutesRestantes = minutes % 60;
  if (minutesRestantes === 0) {
    return `${heures}h`;
  }
  return `${heures}h${minutesRestantes.toString().padStart(2, '0')}`;
};

const bookingSchema = z.object({
  nom: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  email: z.string().email('Email invalide'),
  telephone: z.string().regex(/^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/, 'Numéro de téléphone invalide'),
  depart: z.string().min(3, 'Adresse de départ requise'),
  arrivee: z.string().min(3, 'Adresse d\'arrivée requise'),
  dateHeure: z.string().min(1, 'Date et heure requises'),
  commentaire: z.string().optional(),
  distance_km: z.number().min(0).optional(),
  duree_minutes: z.number().min(0).optional(),
  nb_bagages_supp: z.number().min(0).optional(),
  nb_passagers: z.number().min(1).max(8).optional(),
});

export default function BookingForm() {
  const { t } = useLanguage();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error' | 'conflict'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [conflictDetails, setConflictDetails] = useState<any>(null);
  
  // Estimation state
  const [estimation, setEstimation] = useState<TarifEstimation | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  
  // Address fields (controlled separately for autocomplete)
  const [departAddress, setDepartAddress] = useState<string>('');
  const [arriveeAddress, setArriveeAddress] = useState<string>('');
  const [departCoords, setDepartCoords] = useState<Coordinates | undefined>();
  const [arriveeCoords, setArriveeCoords] = useState<Coordinates | undefined>();
  
  // Extra fields for estimation
  const [distanceKm, setDistanceKm] = useState<number>(10);
  const [dureeMinutes, setDureeMinutes] = useState<number>(15);
  const [nbBagagesSupp, setNbBagagesSupp] = useState<number>(0);
  const [nbPassagers, setNbPassagers] = useState<number>(1);
  const [estNuitOuFerie, setEstNuitOuFerie] = useState<boolean>(false);
  const [retourAVide, setRetourAVide] = useState<boolean>(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
  });

  // Watch form fields for automatic estimation
  const dateHeure = watch('dateHeure');

  // Calculer la distance et la durée quand les adresses changent
  useEffect(() => {
    const calculateRoute = async () => {
      if (departAddress && arriveeAddress && departAddress.length > 3 && arriveeAddress.length > 3) {
        setIsCalculating(true);
        const result = await calculateDistance(
          departAddress, 
          arriveeAddress,
          departCoords,
          arriveeCoords
        );
        
        if (result) {
          setDistanceKm(result.distance_km);
          setDureeMinutes(result.duree_minutes);
        } else {
          // Estimation par défaut si le calcul échoue
          setDistanceKm(10);
          setDureeMinutes(15);
        }
        setIsCalculating(false);
      }
    };

    // Attendre 500ms après la dernière modification avant de calculer
    const timer = setTimeout(calculateRoute, 500);
    return () => clearTimeout(timer);
  }, [departAddress, arriveeAddress, departCoords, arriveeCoords]);

  // Déterminer si c'est la nuit automatiquement
  useEffect(() => {
    if (dateHeure) {
      const date = new Date(dateHeure);
      const heure = date.getHours();
      // Nuit = 19h-7h
      setEstNuitOuFerie(heure >= 19 || heure < 7);
    }
  }, [dateHeure]);

  // Calculate estimation when relevant fields change
  useEffect(() => {
    const calculateEstimation = async () => {
      if (distanceKm <= 0 || dureeMinutes <= 0) return;

      setIsCalculating(true);
      try {
        const response = await fetch('/api/tarif', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            distance_km: distanceKm,
            duree_minutes: dureeMinutes,
            est_nuit_ou_ferie: estNuitOuFerie,
            retour_a_vide: retourAVide,
            nb_bagages_supp: nbBagagesSupp,
            nb_passagers: nbPassagers,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          setEstimation(data.estimation);
        }
      } catch (error) {
        console.error('Erreur calcul tarif:', error);
      } finally {
        setIsCalculating(false);
      }
    };

    calculateEstimation();
  }, [distanceKm, dureeMinutes, estNuitOuFerie, retourAVide, nbBagagesSupp, nbPassagers]);

  const onSubmit = async (data: BookingFormData) => {
    setIsSubmitting(true);
    setSubmitStatus('idle');
    setErrorMessage('');
    setConflictDetails(null);

    try {
      // Vérifier qu'on a une estimation
      if (!estimation) {
        throw new Error('Veuillez attendre le calcul du tarif');
      }

      // Vérifier qu'on a les coordonnées
      if (!departCoords || !arriveeCoords) {
        throw new Error('Adresses invalides');
      }

      const response = await fetch('/api/reservations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nom: data.nom,
          email: data.email,
          telephone: data.telephone,
          depart: departAddress,
          arrivee: arriveeAddress,
          dateHeure: new Date(data.dateHeure).toISOString(), // Convertir en format ISO complet
          commentaire: data.commentaire || '',
          estimation: {
            prix_total: estimation.total_estime,
            distance_km: distanceKm,
            duree_minutes: dureeMinutes,
            tarif_applique: estimation.tarif_applique,
          },
          departCoords,
          arriveeCoords,
          nombrePassagers: nbPassagers,
          bagageVolumineux: nbBagagesSupp > 0,
          retourVide: retourAVide,
          nuitFerie: estNuitOuFerie,
        }),
      });

      const result = await response.json();

      // ❌ Gestion du conflit horaire (code 409)
      if (response.status === 409) {
        setSubmitStatus('conflict');
        setErrorMessage(result.message || 'Créneau non disponible');
        setConflictDetails(result.details);
        
        // Scroller vers le haut du formulaire pour voir le message de conflit
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
        // Auto-reset après 30 secondes pour laisser le temps de lire
        setTimeout(() => {
          setSubmitStatus('idle');
          setConflictDetails(null);
        }, 30000);
        return;
      }

      if (!response.ok) {
        throw new Error(result.error || 'Erreur lors de l\'envoi');
      }
      
      setSubmitStatus('success');
      
      // Reset form
      reset();
      setDepartAddress('');
      setArriveeAddress('');
      setDepartCoords(undefined);
      setArriveeCoords(undefined);
      setEstimation(null);
      setNbPassagers(1);
      setNbBagagesSupp(0);
      setRetourAVide(false);
      
      // Reset success message after 5 seconds
      setTimeout(() => setSubmitStatus('idle'), 5000);
    } catch (error) {
      console.error('Error:', error);
      setSubmitStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Erreur inconnue');
      // Reset error message after 5 seconds
      setTimeout(() => {
        setSubmitStatus('idle');
        setErrorMessage('');
      }, 5000);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="grid lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
      {/* Formulaire à gauche */}
      <div className="order-1 lg:order-1">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Nom */}
      <div>
        <label htmlFor="nom" className="flex items-center gap-2 text-sm font-medium mb-2">
          <User size={18} className="text-gt-red" />
          {t('booking.name')}
        </label>
        <input
          {...register('nom')}
          type="text"
          id="nom"
          className="w-full px-4 py-3 bg-gt-gray border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-gt-red text-white"
          placeholder={t('booking.name.placeholder')}
        />
        {errors.nom && <p className="mt-1 text-sm text-red-400">{errors.nom.message}</p>}
      </div>

      {/* Email */}
      <div>
        <label htmlFor="email" className="flex items-center gap-2 text-sm font-medium mb-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gt-red">
            <rect width="20" height="16" x="2" y="4" rx="2"/>
            <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
          </svg>
          Email
        </label>
        <input
          {...register('email')}
          type="email"
          id="email"
          className="w-full px-4 py-3 bg-gt-gray border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-gt-red text-white"
          placeholder="votre.email@exemple.com"
        />
        {errors.email && <p className="mt-1 text-sm text-red-400">{errors.email.message}</p>}
      </div>

      {/* Téléphone */}
      <div>
        <label htmlFor="telephone" className="flex items-center gap-2 text-sm font-medium mb-2">
          <Phone size={18} className="text-gt-red" />
          {t('booking.phone')}
        </label>
        <input
          {...register('telephone')}
          type="tel"
          id="telephone"
          className="w-full px-4 py-3 bg-gt-gray border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-gt-red text-white"
          placeholder={t('booking.phone.placeholder')}
        />
        {errors.telephone && <p className="mt-1 text-sm text-red-400">{errors.telephone.message}</p>}
      </div>

      {/* Départ */}
      <div>
        <label htmlFor="depart" className="flex items-center gap-2 text-sm font-medium mb-2">
          <MapPin size={18} className="text-gt-red" />
          {t('booking.departure')}
        </label>
        <AddressAutocomplete
          id="depart"
          value={departAddress}
          onChange={(value, coords) => {
            setDepartAddress(value);
            setDepartCoords(coords);
            setValue('depart', value, { shouldValidate: true });
          }}
          placeholder={t('booking.departure.placeholder')}
          className="w-full px-4 py-3 bg-gt-gray border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-gt-red text-white"
          error={errors.depart?.message}
        />
      </div>

      {/* Arrivée */}
      <div>
        <label htmlFor="arrivee" className="flex items-center gap-2 text-sm font-medium mb-2">
          <MapPin size={18} className="text-gt-red" />
          {t('booking.arrival')}
        </label>
        <AddressAutocomplete
          id="arrivee"
          value={arriveeAddress}
          onChange={(value, coords) => {
            setArriveeAddress(value);
            setArriveeCoords(coords);
            setValue('arrivee', value, { shouldValidate: true });
          }}
          placeholder={t('booking.arrival.placeholder')}
          className="w-full px-4 py-3 bg-gt-gray border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-gt-red text-white"
          error={errors.arrivee?.message}
        />
      </div>

      {/* Date et heure */}
      <div>
        <label htmlFor="dateHeure" className="flex items-center gap-2 text-sm font-medium mb-2">
          <Calendar size={18} className="text-gt-red" />
          {t('booking.datetime')}
        </label>
        <input
          type="datetime-local"
          id="dateHeure"
          value={dateHeure || ''}
          onChange={(e) => setValue('dateHeure', e.target.value, { shouldValidate: true })}
          className="w-full px-4 py-3 bg-gt-gray border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-gt-red text-white transition-all"
        />
        {errors.dateHeure && <p className="mt-1 text-sm text-red-400">{errors.dateHeure.message}</p>}
      </div>

      {/* Commentaire */}
      <div>
        <label htmlFor="commentaire" className="flex items-center gap-2 text-sm font-medium mb-2">
          <MessageSquare size={18} className="text-gt-red" />
          {t('booking.comment')}
        </label>
        <textarea
          {...register('commentaire')}
          id="commentaire"
          rows={3}
          className="w-full px-4 py-3 bg-gt-gray border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-gt-red text-white resize-none"
          placeholder={t('booking.comment.placeholder')}
        />
      </div>

      {/* ESTIMATION DU TARIF */}
      <div className="border-t border-gray-700 pt-6">
        <h3 className="flex items-center gap-2 text-lg font-rajdhani font-bold mb-4">
          <Calculator size={20} className="text-gt-red" />
          {t('estimate.title')}
          {isCalculating && (
            <span className="text-sm text-gray-400 font-normal animate-pulse">
              {t('estimate.calculating')}
            </span>
          )}
        </h3>

        {/* Info trajet */}
        {distanceKm > 0 && dureeMinutes > 0 && (
          <div className="mb-4 p-3 bg-gt-gray/50 border border-gray-700 rounded-lg text-sm text-gray-300">
            <div className="flex items-center gap-4">
              <span>📍 {t('estimate.distance')} : <strong>{distanceKm.toFixed(1)} km</strong></span>
              <span>⏱️ {t('estimate.duration')} : <strong>{formatDuree(dureeMinutes)}</strong></span>
            </div>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-4">
          {/* Bagages supplémentaires */}
          <div>
            <label htmlFor="nb_bagages" className="flex items-center gap-2 text-sm font-medium mb-2">
              <Luggage size={16} className="text-gt-red" />
              {t('estimate.luggage')}
            </label>
            <input
              type="number"
              id="nb_bagages"
              value={nbBagagesSupp}
              onChange={(e) => setNbBagagesSupp(Math.max(0, parseInt(e.target.value) || 0))}
              min="0"
              className="w-full px-4 py-3 bg-gt-gray border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-gt-red text-white"
            />
            <p className="mt-1 text-xs text-gray-400">{t('estimate.luggage.desc')}</p>
          </div>

          {/* Nombre de passagers */}
          <div>
            <label htmlFor="nb_passagers" className="flex items-center gap-2 text-sm font-medium mb-2">
              <Users size={16} className="text-gt-red" />
              {t('estimate.passengers')}
            </label>
            <input
              type="number"
              id="nb_passagers"
              value={nbPassagers}
              onChange={(e) => setNbPassagers(Math.max(1, Math.min(8, parseInt(e.target.value) || 1)))}
              min="1"
              max="8"
              className="w-full px-4 py-3 bg-gt-gray border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-gt-red text-white"
            />
            <p className="mt-1 text-xs text-gray-400">{t('estimate.passengers.desc')}</p>
          </div>
        </div>

        {/* Checkbox retour à vide */}
        <div className="mt-4">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={retourAVide}
              onChange={(e) => setRetourAVide(e.target.checked)}
              className="w-5 h-5 text-gt-red bg-gt-gray border-gray-700 rounded focus:ring-gt-red focus:ring-2"
            />
            <span className="flex items-center gap-2 text-sm">
              <ArrowLeftRight size={16} className="text-gt-red" />
              {t('estimate.return')}
            </span>
          </label>
          <p className="mt-1 ml-8 text-xs text-gray-400">{t('estimate.return.desc')}</p>
        </div>

        {/* Affichage de l'estimation */}
        {estimation && (
          <div className="mt-6 p-6 bg-gradient-to-br from-gt-red/20 to-gt-red/5 border border-gt-red/50 rounded-lg">
            <div className="flex justify-between items-center mb-4">
              <div>
                <span className="text-lg font-rajdhani font-bold">{t('estimate.total')}</span>
                {estNuitOuFerie && (
                  <span className="ml-2 text-xs bg-blue-600 px-2 py-1 rounded">
                    <Moon size={12} className="inline mr-1" />
                    {t('estimate.night')}
                  </span>
                )}
              </div>
              <span className="text-3xl font-rajdhani font-bold text-gt-red">
                {estimation.total_estime.toFixed(2)} €
              </span>
            </div>
            
            <div className="space-y-2 text-sm text-gray-300">
              <div className="flex justify-between">
                <span>{t('estimate.pickup')}</span>
                <span>{estimation.detail.prise_en_charge.toFixed(2)} €</span>
              </div>
              <div className="flex justify-between">
                <span>{t('estimate.distance.label')} (~{distanceKm} km)</span>
                <span>{estimation.detail.cout_distance.toFixed(2)} €</span>
              </div>
              {dureeMinutes > 0 && (
                <div className="flex justify-between">
                  <span className="flex items-center gap-1">
                    ⏱️ {t('estimate.time')}
                  </span>
                  <span className="font-medium">{formatDuree(dureeMinutes)}</span>
                </div>
              )}
              {estimation.detail.cout_trafic_est > 0 && (
                <div className="flex justify-between">
                  <span>{t('estimate.traffic')}</span>
                  <span>{estimation.detail.cout_trafic_est.toFixed(2)} €</span>
                </div>
              )}
              {estimation.detail.supplements > 0 && (
                <div className="flex justify-between">
                  <span>{t('estimate.supplements')}</span>
                  <span>{estimation.detail.supplements.toFixed(2)} €</span>
                </div>
              )}
            </div>
            
            <p className="mt-4 text-xs text-gray-400 italic">
              {t('estimate.note')}
            </p>
          </div>
        )}

        {isCalculating && (
          <div className="mt-4 text-center text-gray-400">
            <Calculator className="inline animate-pulse mr-2" size={16} />
            Calcul en cours...
          </div>
        )}
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full py-4 bg-gt-red hover:bg-red-700 disabled:bg-gray-600 text-white font-bold rounded-lg transition-colors duration-200 text-lg"
      >
        {isSubmitting ? t('booking.submitting') : t('booking.submit')}
      </button>

      {/* Status Messages */}
      {submitStatus === 'success' && (
        <div className="p-4 bg-green-900/50 border border-green-700 rounded-lg text-green-200">
          {t('booking.success')}
        </div>
      )}
      
      {submitStatus === 'error' && (
        <div className="p-4 bg-red-900/50 border border-red-700 rounded-lg text-red-200">
          {errorMessage || t('booking.error')}
        </div>
      )}

      {/* 🚦 Message de conflit horaire avec créneau alternatif */}
      {submitStatus === 'conflict' && conflictDetails && (
        <div className="p-5 bg-orange-900/40 border-2 border-orange-600 rounded-lg animate-pulse">
          <div className="flex items-start gap-3 mb-3">
            <div className="flex-shrink-0 w-10 h-10 bg-orange-600 rounded-full flex items-center justify-center">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <h4 className="text-lg font-bold text-orange-200 mb-1">
                🚫 Créneau horaire indisponible
              </h4>
              <p className="text-orange-300 text-sm mb-3">
                {errorMessage}
              </p>
            </div>
          </div>

          <div className="bg-black/30 rounded-lg p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">❌ Horaire demandé :</span>
              <span className="text-white font-semibold line-through">
                {new Date(conflictDetails.horairesDemandes).toLocaleString('fr-FR', {
                  weekday: 'short',
                  day: 'numeric',
                  month: 'short',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            </div>

            {conflictDetails.conflit && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">⏱️ Temps manquant :</span>
                <span className="text-red-400 font-semibold">
                  {conflictDetails.conflit.manqueMinutes} minutes
                </span>
              </div>
            )}

            <div className="border-t border-orange-700 my-3"></div>

            <div className="bg-green-900/30 border-2 border-green-600 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-green-400 text-xl">✅</span>
                <span className="text-green-200 font-semibold text-base">Prochain créneau disponible :</span>
              </div>
              <p className="text-white text-xl font-bold ml-7 mb-1">
                {new Date(conflictDetails.creneauAlternatif).toLocaleString('fr-FR', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
              <p className="text-gray-400 text-sm ml-7 mb-3">
                (Heure locale)
              </p>
              
              {/* Bouton pour appliquer le créneau suggéré */}
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  
                  if (!conflictDetails?.creneauAlternatif) {
                    alert('Erreur: Aucun créneau alternatif disponible');
                    return;
                  }
                  
                  // Formater la date pour l'input datetime-local (format: YYYY-MM-DDTHH:mm)
                  const dateAlternative = new Date(conflictDetails.creneauAlternatif);
                  const annee = dateAlternative.getFullYear();
                  const mois = String(dateAlternative.getMonth() + 1).padStart(2, '0');
                  const jour = String(dateAlternative.getDate()).padStart(2, '0');
                  const heures = String(dateAlternative.getHours()).padStart(2, '0');
                  const minutes = String(dateAlternative.getMinutes()).padStart(2, '0');
                  const dateFormatted = `${annee}-${mois}-${jour}T${heures}:${minutes}`;
                  
                  console.log('🔄 Application du créneau:', dateFormatted);
                  
                  // Forcer la mise à jour de l'input
                  const dateInput = document.querySelector('input[type="datetime-local"]') as HTMLInputElement;
                  if (dateInput) {
                    dateInput.value = dateFormatted;
                    dateInput.dispatchEvent(new Event('change', { bubbles: true }));
                    dateInput.dispatchEvent(new Event('input', { bubbles: true }));
                  }
                  
                  // Mettre à jour le formulaire
                  setValue('dateHeure', dateFormatted, { 
                    shouldValidate: true, 
                    shouldDirty: true, 
                    shouldTouch: true 
                  });
                  
                  // Reset les états d'erreur APRÈS un délai
                  setTimeout(() => {
                    setSubmitStatus('idle');
                    setConflictDetails(null);
                    setErrorMessage('');
                    
                    // Scroll et flash visuel
                    if (dateInput) {
                      dateInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      dateInput.classList.add('ring-4', 'ring-green-500', 'ring-offset-2', 'ring-offset-gt-black');
                      setTimeout(() => {
                        dateInput.classList.remove('ring-4', 'ring-green-500', 'ring-offset-2', 'ring-offset-gt-black');
                      }, 3000);
                    }
                  }, 100);
                }}
                className="w-full mt-2 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
              >
                <Calendar size={20} />
                Appliquer ce créneau automatiquement
              </button>
            </div>
          </div>

          <p className="text-xs text-orange-300 mt-3 text-center">
            💡 Cliquez sur le bouton ci-dessus pour utiliser le créneau suggéré, ou modifiez manuellement l'horaire
          </p>
        </div>
      )}
        </form>
      </div>

      {/* Carte à droite */}
      <div className="order-2 lg:order-2">
        <h3 className="text-xl font-heading font-bold mb-4 flex items-center gap-2">
          <MapPin size={24} className="text-gt-red" />
          Itinéraire
        </h3>
        <RouteMap
          departCoords={departCoords}
          arriveeCoords={arriveeCoords}
          departAddress={departAddress}
          arriveeAddress={arriveeAddress}
          dureeMinutes={dureeMinutes}
        />
        <p className="mt-3 text-xs text-gray-400 text-center">
          📍 La carte affiche l'itinéraire en temps réel dès que vous sélectionnez les adresses
        </p>
      </div>
    </div>
  );
}
