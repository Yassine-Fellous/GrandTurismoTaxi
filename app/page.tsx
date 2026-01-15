'use client';

import BookingForm from '@/components/BookingForm';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { useLanguage } from '@/contexts/LanguageContext';
import { Car, Clock, Shield, Star, Menu, X } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { t } = useLanguage();

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setMobileMenuOpen(false);
    }
  };

  return (
    <main className="min-h-screen">
      {/* Navbar Sticky */}
      <nav className="fixed top-0 left-0 right-0 bg-black/95 backdrop-blur-sm z-50 border-b border-gray-800">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-20">
            {/* Logo Texte */}
            <div 
              className="flex items-center cursor-pointer"
              onClick={() => scrollToSection('accueil')}
            >
              <h1 className="text-2xl md:text-3xl font-heading font-bold tracking-wide">
                GRAN <span className="text-gt-red">TURISMO</span> TAXI
              </h1>
            </div>

            {/* Navigation Desktop */}
            <div className="hidden md:flex items-center gap-8">
              <button 
                onClick={() => scrollToSection('accueil')}
                className="text-gray-300 hover:text-gt-red transition-colors font-medium"
              >
                {t('nav.home')}
              </button>
              <button 
                onClick={() => scrollToSection('services')}
                className="text-gray-300 hover:text-gt-red transition-colors font-medium"
              >
                {t('nav.services')}
              </button>
              <button 
                onClick={() => scrollToSection('vehicule')}
                className="text-gray-300 hover:text-gt-red transition-colors font-medium"
              >
                Véhicule
              </button>
              <button 
                onClick={() => scrollToSection('reservation')}
                className="text-gray-300 hover:text-gt-red transition-colors font-medium"
              >
                {t('nav.booking')}
              </button>
              <button 
                onClick={() => scrollToSection('contact')}
                className="text-gray-300 hover:text-gt-red transition-colors font-medium"
              >
                {t('nav.contact')}
              </button>
              
              <a
                href="tel:0672362015"
                className="px-4 py-2 bg-gt-red hover:bg-red-700 rounded-lg font-semibold transition-colors"
              >
                📞 06 72 36 20 15
              </a>
              
              {/* Sélecteur de langue */}
              <LanguageSwitcher />
            </div>

            {/* Bouton Menu Mobile */}
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-gray-300 hover:text-gt-red"
            >
              {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>

          {/* Menu Mobile */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-gray-800">
              <div className="flex flex-col gap-4">
                <button 
                  onClick={() => scrollToSection('accueil')}
                  className="text-left text-gray-300 hover:text-gt-red transition-colors font-medium py-2"
                >
                  {t('nav.home')}
                </button>
                <button 
                  onClick={() => scrollToSection('services')}
                  className="text-left text-gray-300 hover:text-gt-red transition-colors font-medium py-2"
                >
                  {t('nav.services')}
                </button>
                <button 
                  onClick={() => scrollToSection('vehicule')}
                  className="text-left text-gray-300 hover:text-gt-red transition-colors font-medium py-2"
                >
                  Véhicule
                </button>
                <button 
                  onClick={() => scrollToSection('reservation')}
                  className="text-left text-gray-300 hover:text-gt-red transition-colors font-medium py-2"
                >
                  {t('nav.booking')}
                </button>
                <button 
                  onClick={() => scrollToSection('contact')}
                  className="text-left text-gray-300 hover:text-gt-red transition-colors font-medium py-2"
                >
                  {t('nav.contact')}
                </button>
                
                {/* Sélecteur de langue mobile */}
                <div className="py-2 flex items-center gap-2">
                  <span className="text-gray-400 text-sm">Langue:</span>
                  <LanguageSwitcher />
                </div>
                
                <a
                  href="tel:0672362015"
                  className="px-4 py-2 bg-gt-red hover:bg-red-700 rounded-lg font-semibold transition-colors text-center"
                >
                  📞 06 72 36 20 15
                </a>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Spacer pour compenser la navbar fixe */}
      <div className="h-20"></div>

      {/* Hero Section */}
      <section id="accueil" className="py-16 md:py-24 bg-gradient-to-b from-gt-black via-gt-gray to-gt-black">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-heading font-bold mb-4 tracking-wide">
            GRAN <span className="text-gt-red">TURISMO</span> TAXI
          </h1>
          <h2 className="text-3xl md:text-5xl font-heading font-bold mb-6 tracking-wide">
            {t('hero.title')}
          </h2>
          <p className="text-xl text-gray-300 mb-4">
            {t('hero.subtitle')}
          </p>
          <p className="text-gray-400 mb-8">
            {t('hero.cta')}
          </p>
          
          {/* Image Taxi */}
          <div className="mt-12 flex justify-center">
            <Image 
              src="/taxi.png" 
              alt="Taxi Gran Turismo" 
              width={800} 
              height={500}
              className="w-full max-w-3xl h-auto rounded-lg shadow-2xl"
              priority
            />
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-16 bg-gt-black">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-heading font-bold text-center mb-12 tracking-wide">
            {t('services.title')}
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {/* Service 1 */}
            <div className="bg-gt-gray p-6 rounded-lg border border-gray-800 hover:border-gt-red transition-colors">
              <div className="bg-gt-red/20 w-14 h-14 rounded-full flex items-center justify-center mb-4">
                <Clock className="text-gt-red" size={28} />
              </div>
              <h3 className="text-xl font-semibold mb-2">{t('services.247.title')}</h3>
              <p className="text-gray-400">
                {t('services.247.desc')}
              </p>
            </div>

            {/* Service 2 */}
            <div className="bg-gt-gray p-6 rounded-lg border border-gray-800 hover:border-gt-red transition-colors">
              <div className="bg-gt-red/20 w-14 h-14 rounded-full flex items-center justify-center mb-4">
                <Car className="text-gt-red" size={28} />
              </div>
              <h3 className="text-xl font-semibold mb-2">{t('services.comfort.title')}</h3>
              <p className="text-gray-400">
                {t('services.comfort.desc')}
              </p>
            </div>

            {/* Service 3 */}
            <div className="bg-gt-gray p-6 rounded-lg border border-gray-800 hover:border-gt-red transition-colors">
              <div className="bg-gt-red/20 w-14 h-14 rounded-full flex items-center justify-center mb-4">
                <Shield className="text-gt-red" size={28} />
              </div>
              <h3 className="text-xl font-semibold mb-2">{t('services.safety.title')}</h3>
              <p className="text-gray-400">
                {t('services.safety.desc')}
              </p>
            </div>

            {/* Service 4 */}
            <div className="bg-gt-gray p-6 rounded-lg border border-gray-800 hover:border-gt-red transition-colors">
              <div className="bg-gt-red/20 w-14 h-14 rounded-full flex items-center justify-center mb-4">
                <Star className="text-gt-red" size={28} />
              </div>
              <h3 className="text-xl font-semibold mb-2">{t('services.quality.title')}</h3>
              <p className="text-gray-400">
                {t('services.quality.desc')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Vehicle Section */}
      <section id="vehicule" className="py-16 bg-gt-gray">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-center mb-4 tracking-wide">
            Notre <span className="text-gt-red">Véhicule</span>
          </h2>
          <p className="text-center text-gray-400 mb-12 max-w-2xl mx-auto">
            Voyagez dans le confort et l'élégance avec notre Renault Talisman 2020
          </p>
          
          <div className="max-w-5xl mx-auto">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              {/* Image du véhicule */}
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-gt-red/20 to-transparent rounded-lg blur-xl"></div>
                <Image 
                  src="/tali.png" 
                  alt="Renault Talisman 2020" 
                  width={600} 
                  height={400}
                  className="relative w-full h-auto rounded-lg shadow-2xl"
                />
              </div>

              {/* Caractéristiques */}
              <div className="space-y-6">
                <div className="bg-gt-black p-6 rounded-lg border border-gray-800">
                  <h3 className="text-xl font-bold mb-4 text-gt-red">Renault Talisman 2020</h3>
                  <div className="space-y-3 text-gray-300">
                    <div className="flex items-center gap-3">
                      <Car className="text-gt-red" size={20} />
                      <span>Berline haut de gamme</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Shield className="text-gt-red" size={20} />
                      <span>Couleur: Noir</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Star className="text-gt-red" size={20} />
                      <span>Confort premium garanti</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gt-black p-6 rounded-lg border border-gray-800">
                  <h4 className="font-semibold mb-3 text-gt-red">Équipements</h4>
                  <ul className="space-y-2 text-gray-300">
                    <li className="flex items-center gap-2">
                      <span className="text-gt-red">✓</span> Climatisation automatique
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-gt-red">✓</span> Sièges en cuir
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-gt-red">✓</span> Grand coffre spacieux
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-gt-red">✓</span> Système audio premium
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-gt-red">✓</span> Navigation GPS
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Booking Form Section */}
      <section id="reservation" className="py-16 bg-gt-gray">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-center mb-4 tracking-wide">
            {t('booking.title')}
          </h2>
          <p className="text-center text-gray-400 mb-12">
            {t('booking.subtitle')}
          </p>
          
          <BookingForm />
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-16 bg-gt-black">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-heading font-bold mb-6 tracking-wide">
            {t('contact.title')}
          </h2>
          <p className="text-gray-400 mb-6">
            {t('contact.subtitle')}
          </p>
          
          <div className="flex flex-col md:flex-row gap-4 justify-center items-center">
            <a
              href="tel:0672362015"
              className="px-8 py-3 bg-gt-red hover:bg-red-700 rounded-lg font-semibold transition-colors inline-flex items-center gap-2"
            >
              📞 06 72 36 20 15
            </a>
            <a
              href="mailto:granturismotaxi@gmail.com"
              className="px-8 py-3 bg-gray-800 hover:bg-gray-700 rounded-lg font-semibold transition-colors inline-flex items-center gap-2"
            >
              ✉️ {t('contact.email')}
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black py-8 border-t border-gray-800">
        <div className="container mx-auto px-4 text-center text-gray-500">
          <p>&copy; 2026 Gran Turismo Taxi - {t('footer.rights')}</p>
          <p className="mt-2 text-sm">{t('footer.tagline')}</p>
        </div>
      </footer>
    </main>
  );
}
