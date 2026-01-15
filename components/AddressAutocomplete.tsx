'use client';

import { useEffect, useRef, useState } from 'react';

interface AddressAutocompleteProps {
  id: string;
  value: string;
  onChange: (value: string, coordinates?: { lat: number; lon: number }) => void;
  placeholder: string;
  className?: string;
  error?: string;
}

interface AddressSuggestion {
  label: string;
  coordinates: [number, number]; // [lon, lat]
}

export default function AddressAutocomplete({
  id,
  value,
  onChange,
  placeholder,
  className,
  error,
}: AddressAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // API Adresse du gouvernement français (100% gratuit, illimité)
  const fetchSuggestions = async (query: string) => {
    if (query.length < 2) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);
    try {
      // API Adresse - data.gouv.fr
      // Paramètres optimisés pour Marseille et région PACA
      const params = new URLSearchParams({
        q: query,
        limit: '10', // Plus de résultats
        lat: '43.296482', // Centre de Marseille
        lon: '5.36978',
        autocomplete: '1', // Mode autocomplétion activé
      });

      const response = await fetch(`https://api-adresse.data.gouv.fr/search/?${params}`);
      const data = await response.json();

      const suggestions: AddressSuggestion[] = data.features.map((feature: any) => {
        const props = feature.properties;
        // Format amélioré : "Numéro Rue, Code Postal Ville"
        let label = props.label;
        
        // Si on a le code postal et la ville, on les ajoute pour plus de clarté
        if (props.postcode && props.city) {
          label = `${props.name}, ${props.postcode} ${props.city}`;
        }
        
        return {
          label: label,
          coordinates: feature.geometry.coordinates,
        };
      });

      setSuggestions(suggestions);
      setShowSuggestions(true);
    } catch (error) {
      console.error('Erreur autocomplétion:', error);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Debounce pour éviter trop de requêtes
  useEffect(() => {
    const timer = setTimeout(() => {
      if (value) {
        fetchSuggestions(value);
      } else {
        setSuggestions([]);
      }
    }, 200); // Réduit de 300ms à 200ms pour plus de réactivité

    return () => clearTimeout(timer);
  }, [value]);

  // Fermer les suggestions si clic à l'extérieur
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectSuggestion = (suggestion: AddressSuggestion) => {
    onChange(suggestion.label, {
      lat: suggestion.coordinates[1],
      lon: suggestion.coordinates[0],
    });
    setShowSuggestions(false);
    setSuggestions([]);
  };

  return (
    <div ref={wrapperRef} className="relative">
      <input
        type="text"
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
        placeholder={placeholder}
        className={className}
        autoComplete="off"
      />
      
      {/* Suggestions dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-gt-gray border border-gray-700 rounded-lg shadow-xl max-h-60 overflow-y-auto">
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              type="button"
              onClick={() => handleSelectSuggestion(suggestion)}
              className="w-full px-4 py-3 text-left hover:bg-gt-red/20 transition-colors border-b border-gray-700 last:border-b-0 text-white text-sm"
            >
              📍 {suggestion.label}
            </button>
          ))}
        </div>
      )}

      {/* Loading indicator */}
      {isLoading && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          <div className="animate-spin h-4 w-4 border-2 border-gt-red border-t-transparent rounded-full"></div>
        </div>
      )}

      {error && <p className="mt-1 text-sm text-red-400">{error}</p>}
    </div>
  );
}
