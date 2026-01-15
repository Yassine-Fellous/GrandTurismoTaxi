'use client';

import { useState, useEffect } from 'react';
import { LogOut, List, Calendar } from 'lucide-react';
import ReservationsList from '@/components/admin/ReservationsList';
import CalendarView from '@/components/admin/CalendarView';
import Image from 'next/image';

type ViewMode = 'list' | 'calendar';

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('list');

  useEffect(() => {
    // Check if already authenticated
    const auth = sessionStorage.getItem('admin_auth');
    if (auth === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simple password check (in production, use proper authentication)
    if (password === process.env.NEXT_PUBLIC_ADMIN_PASSWORD || password === 'admin123') {
      sessionStorage.setItem('admin_auth', 'true');
      setIsAuthenticated(true);
      setError('');
    } else {
      setError('Mot de passe incorrect');
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('admin_auth');
    setIsAuthenticated(false);
    setPassword('');
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gt-black px-4">
        <div className="max-w-md w-full">
          <div className="bg-gt-gray p-8 rounded-lg border border-gray-800">
            {/* Logo */}
            <div className="flex justify-center mb-6">
              <div className="text-gt-red text-4xl font-bold">GT TAXI</div>
            </div>
            
            <h2 className="text-xl font-semibold text-center mb-6">
              Accès Administration
            </h2>
            
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label htmlFor="password" className="block text-sm font-medium mb-2">
                  Mot de passe
                </label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-gt-black border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-gt-red text-white"
                  placeholder="Entrez le mot de passe"
                  required
                />
              </div>

              {error && (
                <p className="text-red-400 text-sm">{error}</p>
              )}

              <button
                type="submit"
                className="w-full py-3 bg-gt-red hover:bg-red-700 text-white font-semibold rounded-lg transition-colors"
              >
                Se connecter
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gt-black">
      <header className="bg-black py-6 border-b border-gray-800">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              {/* Logo */}
              <div className="text-gt-red text-3xl font-bold">GT TAXI</div>
              <div>
                <h1 className="text-xl font-bold text-gt-red">Panneau d'administration</h1>
                <p className="text-gray-400 text-sm">Gestion des réservations</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm transition-colors"
            >
              <LogOut size={18} />
              Déconnexion
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Onglets */}
        <div className="flex gap-2 mb-6 border-b border-gray-800">
          <button
            onClick={() => setViewMode('list')}
            className={`flex items-center gap-2 px-4 py-2 border-b-2 transition-colors ${
              viewMode === 'list'
                ? 'border-gt-red text-gt-red'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            <List size={20} />
            Liste des réservations
          </button>
          <button
            onClick={() => setViewMode('calendar')}
            className={`flex items-center gap-2 px-4 py-2 border-b-2 transition-colors ${
              viewMode === 'calendar'
                ? 'border-gt-red text-gt-red'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            <Calendar size={20} />
            Vue calendrier
          </button>
        </div>

        {/* Contenu */}
        {viewMode === 'list' ? <ReservationsList /> : <CalendarView />}
      </main>
    </div>
  );
}
