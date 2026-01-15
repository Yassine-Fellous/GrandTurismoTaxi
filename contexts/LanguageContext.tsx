'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'fr' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations = {
  fr: {
    // Navbar
    'nav.home': 'Accueil',
    'nav.services': 'Services',
    'nav.booking': 'Réservation',
    'nav.contact': 'Contact',
    
    // Hero
    'hero.title': 'Votre course en quelques clics',
    'hero.subtitle': 'Service de taxi disponible 24/7 à Marseille et ses environs',
    'hero.cta': 'Réservez maintenant et voyagez en toute sérénité',
    
    // Services
    'services.title': 'Pourquoi choisir Gran Turismo ?',
    'services.247.title': 'Disponible 24/7',
    'services.247.desc': 'À votre service jour et nuit, 7 jours sur 7',
    'services.comfort.title': 'Véhicules premium',
    'services.comfort.desc': 'Flotte récente et confortable pour votre confort',
    'services.safety.title': 'Sécurité garantie',
    'services.safety.desc': 'Chauffeurs professionnels et licenciés',
    'services.quality.title': 'Service de qualité',
    'services.quality.desc': 'Ponctualité et professionnalisme assurés',
    
    // Booking Form
    'booking.title': 'Réservez votre course',
    'booking.subtitle': 'Remplissez le formulaire ci-dessous et nous vous confirmerons votre réservation',
    'booking.name': 'Nom complet',
    'booking.name.placeholder': 'Votre nom',
    'booking.phone': 'Téléphone',
    'booking.phone.placeholder': '06 XX XX XX XX',
    'booking.departure': 'Adresse de départ',
    'booking.departure.placeholder': 'Ex: 1 rue de la République, Marseille',
    'booking.arrival': 'Adresse d\'arrivée',
    'booking.arrival.placeholder': 'Ex: Gare Saint-Charles, Marseille',
    'booking.datetime': 'Date et heure',
    'booking.comment': 'Commentaire (optionnel)',
    'booking.comment.placeholder': 'Ajoutez des informations (nb de bagages, demandes spéciales...)',
    'booking.submit': 'Réserver maintenant',
    'booking.submitting': 'Envoi en cours...',
    'booking.success': '✅ Réservation envoyée avec succès ! Nous vous contacterons rapidement.',
    'booking.error': '❌ Erreur lors de l\'envoi. Veuillez réessayer ou nous contacter directement au 06 72 36 20 15.',
    
    // Estimation
    'estimate.title': 'Estimation du tarif',
    'estimate.calculating': 'Calcul en cours...',
    'estimate.distance': 'Distance',
    'estimate.duration': 'Durée estimée',
    'estimate.luggage': 'Bagages volumineux',
    'estimate.luggage.desc': 'Bagages normaux inclus. Supplément uniquement pour bagages volumineux/encombrants (+2€)',
    'estimate.passengers': 'Nombre de passagers',
    'estimate.passengers.desc': '+4€ à partir du 5ème passager',
    'estimate.night': 'Nuit/Férié',
    'estimate.return': 'Retour à vide (hors périmètre Marseille)',
    'estimate.return.desc': 'Applicable si le taxi revient à vide après la course',
    'estimate.total': 'Tarif estimé',
    'estimate.pickup': 'Prise en charge',
    'estimate.distance.label': 'Distance',
    'estimate.time': 'Temps de trajet estimé',
    'estimate.traffic': 'Temps d\'attente/trafic estimé',
    'estimate.supplements': 'Suppléments (bagages + passagers)',
    'estimate.note': '* Estimation basée sur les tarifs réglementaires des Bouches-du-Rhône 2025. Le tarif final peut varier selon le trajet réel et les conditions de circulation.',
    
    // Contact
    'contact.title': 'Contactez-nous',
    'contact.subtitle': 'Contactez-nous directement pour toute question',
    'contact.phone': 'Téléphone',
    'contact.email': 'Email',
    'contact.address': 'Zone de couverture',
    'contact.address.value': 'Marseille et ses environs',
    
    // Footer
    'footer.rights': 'Tous droits réservés',
    'footer.tagline': 'Service de taxi premium à Marseille',
    'footer.legal': 'Mentions légales',
    'footer.privacy': 'Politique de confidentialité',
    'footer.terms': 'Conditions générales',
    
    // Map
    'map.departure': 'Départ',
    'map.arrival': 'Arrivée',
    'map.distance': 'Distance',
    'map.duration': 'Durée',
  },
  en: {
    // Navbar
    'nav.home': 'Home',
    'nav.services': 'Services',
    'nav.booking': 'Booking',
    'nav.contact': 'Contact',
    
    // Hero
    'hero.title': 'Your ride in a few clicks',
    'hero.subtitle': 'Taxi service available 24/7 in Marseille and surroundings',
    'hero.cta': 'Book now and travel with peace of mind',
    
    // Services
    'services.title': 'Why choose Gran Turismo?',
    'services.247.title': 'Available 24/7',
    'services.247.desc': 'At your service day and night, 7 days a week',
    'services.comfort.title': 'Premium vehicles',
    'services.comfort.desc': 'Recent and comfortable fleet for your comfort',
    'services.safety.title': 'Safety guaranteed',
    'services.safety.desc': 'Professional and licensed drivers',
    'services.quality.title': 'Quality service',
    'services.quality.desc': 'Punctuality and professionalism guaranteed',
    
    // Booking Form
    'booking.title': 'Book your ride',
    'booking.subtitle': 'Fill out the form below and we will confirm your booking',
    'booking.name': 'Full name',
    'booking.name.placeholder': 'Your name',
    'booking.phone': 'Phone',
    'booking.phone.placeholder': '06 XX XX XX XX',
    'booking.departure': 'Pickup address',
    'booking.departure.placeholder': 'E.g: 1 rue de la République, Marseille',
    'booking.arrival': 'Drop-off address',
    'booking.arrival.placeholder': 'E.g: Gare Saint-Charles, Marseille',
    'booking.datetime': 'Date and time',
    'booking.comment': 'Comment (optional)',
    'booking.comment.placeholder': 'Add information (luggage count, special requests...)',
    'booking.submit': 'Book now',
    'booking.submitting': 'Sending...',
    'booking.success': '✅ Booking sent successfully! We will contact you shortly.',
    'booking.error': '❌ Error sending. Please try again or contact us directly at 06 72 36 20 15.',
    
    // Estimation
    'estimate.title': 'Fare estimation',
    'estimate.calculating': 'Calculating...',
    'estimate.distance': 'Distance',
    'estimate.duration': 'Estimated duration',
    'estimate.luggage': 'Bulky luggage',
    'estimate.luggage.desc': 'Standard luggage included. Surcharge only for bulky/oversized luggage (+2€)',
    'estimate.passengers': 'Number of passengers',
    'estimate.passengers.desc': '+4€ from the 5th passenger',
    'estimate.night': 'Night/Holiday',
    'estimate.return': 'Empty return (outside Marseille area)',
    'estimate.return.desc': 'Applicable if the taxi returns empty after the ride',
    'estimate.total': 'Estimated fare',
    'estimate.pickup': 'Pickup fee',
    'estimate.distance.label': 'Distance',
    'estimate.time': 'Estimated travel time',
    'estimate.traffic': 'Estimated waiting/traffic time',
    'estimate.supplements': 'Supplements (luggage + passengers)',
    'estimate.note': '* Estimate based on Bouches-du-Rhône 2025 regulated fares. Final fare may vary according to actual route and traffic conditions.',
    
    // Contact
    'contact.title': 'Need help?',
    'contact.subtitle': 'Contact us directly for any questions',
    'contact.phone': 'Phone',
    'contact.email': 'Email',
    'contact.address': 'Coverage area',
    'contact.address.value': 'Marseille and surroundings',
    
    // Footer
    'footer.rights': 'All rights reserved',
    'footer.tagline': 'Premium taxi service in Marseille',
    'footer.legal': 'Legal notice',
    'footer.privacy': 'Privacy policy',
    'footer.terms': 'Terms and conditions',
    
    // Map
    'map.departure': 'Departure',
    'map.arrival': 'Arrival',
    'map.distance': 'Distance',
    'map.duration': 'Duration',
  },
};

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('fr');

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations.fr] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
