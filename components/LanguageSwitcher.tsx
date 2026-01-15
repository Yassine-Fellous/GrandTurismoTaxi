'use client';

import { useLanguage } from '@/contexts/LanguageContext';

export default function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="flex items-center gap-2">
      {/* Drapeau Français */}
      <button
        onClick={() => setLanguage('fr')}
        className={`w-10 h-7 rounded overflow-hidden transition-all duration-300 ${
          language === 'fr' 
            ? 'ring-2 ring-gt-red scale-110 shadow-lg shadow-gt-red/50' 
            : 'opacity-60 hover:opacity-100 hover:scale-105'
        }`}
        aria-label="Français"
        title="Français"
      >
        <div className="flex w-full h-full">
          <div className="w-1/3 bg-[#0055A4]"></div>
          <div className="w-1/3 bg-white"></div>
          <div className="w-1/3 bg-[#EF4135]"></div>
        </div>
      </button>

      {/* Drapeau Anglais */}
      <button
        onClick={() => setLanguage('en')}
        className={`w-10 h-7 rounded overflow-hidden transition-all duration-300 ${
          language === 'en' 
            ? 'ring-2 ring-gt-red scale-110 shadow-lg shadow-gt-red/50' 
            : 'opacity-60 hover:opacity-100 hover:scale-105'
        }`}
        aria-label="English"
        title="English"
      >
        <div className="relative w-full h-full bg-[#012169]">
          <svg viewBox="0 0 60 30" className="absolute inset-0 w-full h-full">
            <path d="M 0,0 L 60,30 M 60,0 L 0,30" stroke="white" strokeWidth="6"/>
            <path d="M 0,0 L 60,30 M 60,0 L 0,30" stroke="#C8102E" strokeWidth="3.6"/>
            <path d="M 30,0 L 30,30 M 0,15 L 60,15" stroke="white" strokeWidth="10"/>
            <path d="M 30,0 L 30,30 M 0,15 L 60,15" stroke="#C8102E" strokeWidth="6"/>
          </svg>
        </div>
      </button>
    </div>
  );
}
