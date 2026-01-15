# Gran Turismo Taxi - Site de Réservation avec Gestion BDD

Un site web complet pour la réservation de taxis à Marseille avec back-office administrateur et base de données Supabase.

## 🚀 Fonctionnalités

### ✅ Site Web Client

#### 1️⃣ Landing Page
- **Design moderne** noir/rouge avec branding Gran Turismo
- **Sections** : Hero, Services, Réservation, Contact
- **100% Responsive** - Mobile, tablette et desktop
- **Multilingue** : Français / Anglais

#### 2️⃣ Formulaire de Réservation
Champs requis :
- ✅ Nom complet
- ✅ Téléphone (validation format français)
- ✅ Adresse de départ (autocomplétion API Adresse)
- ✅ Adresse d'arrivée (autocomplétion API Adresse)
- ✅ Date & heure
- ✅ Nombre de passagers
- ✅ Options (bagages volumineux, retour à vide)
- ✅ Commentaire (optionnel)

**Fonctionnalités avancées** :
- 🗺️ **Carte interactive** avec itinéraire complet (Leaflet + OSRM)
- 💰 **Calcul automatique du tarif** en temps réel
- 🎯 **Auto-zoom** de la carte sur le trajet
- ⏱️ **Durée estimée** formatée (ex: 1h26)
- 📍 **Géolocalisation** précise départ/arrivée

#### 3️⃣ Système de Tarification
- Calcul basé sur les tarifs réglementaires 2025 (Bouches-du-Rhône)
- Prise en charge : 4,26€
- Tarifs jour/nuit différenciés
- Suppléments : bagages volumineux, passagers supplémentaires, retour à vide
- Estimation complète avec détails

### ✅ Back-Office Admin

#### 1️⃣ Authentification
- 🔐 Accès sécurisé par mot de passe
- 🔒 Session persistante

#### 2️⃣ Gestion des Réservations
**Vue Liste** :
- 📋 Liste complète avec filtres par statut
- 👤 Détails clients (nom, téléphone)
- � Informations trajet (départ, arrivée, date)
- 💰 Prix, distance, durée
- 🏷️ Options et suppléments
- ✅ Actions : Confirmer / Refuser / Terminer
- � Rafraîchissement automatique (30s)

**Vue Calendrier** :
- � Planning horaire par jour (00:00 → 23:00)
- 🕐 Visualisation des créneaux occupés
- 📊 Statistiques du jour
- ⏮️⏭️ Navigation entre les jours
- 🔴 Heures occupées en rouge
- 🟢 Disponibilité en temps réel

#### 3️⃣ Statuts de Réservation
- 🟡 **Pending** : En attente de validation
- 🟢 **Confirmed** : Confirmée par l'admin
- � **Rejected** : Refusée
- 🔵 **Completed** : Course terminée
- ⚫ **Cancelled** : Annulée

### ✅ Intégration Base de Données (Supabase)

- �️ **Stockage persistant** de toutes les réservations
- 🔒 **Row Level Security (RLS)** configuré
- � **API REST automatique** générée par Supabase
- 🔄 **Temps réel** : mises à jour instantanées
- 📊 **Table `reservations`** avec tous les champs nécessaires

## 🛠️ Stack Technique

- **Framework** : Next.js 14.2.35 (App Router)
- **Language** : TypeScript
- **Styling** : Tailwind CSS
- **Formulaires** : React Hook Form + Zod
- **Base de données** : Supabase (PostgreSQL)
- **Cartes** : Leaflet 1.9.4 + React Leaflet 4.2.1
- **Routing** : OSRM (Open Source Routing Machine)
- **Géocodage** : API Adresse (data.gouv.fr)
- **Tiles** : CartoDB Dark Matter (gratuit)
- **i18n** : React Context API
- **Déploiement** : Docker + Railway

## 📦 Installation

### 1. Installation des dépendances
```bash
npm install
```

### 2. Configuration Supabase (5 minutes)

**Guide rapide** : Suivez `QUICKSTART_SUPABASE.md`

**Étapes** :
1. Créez un compte sur https://supabase.com (gratuit)
2. Créez un nouveau projet
3. Exécutez le script SQL : `supabase/schema.sql`
4. Récupérez URL + API Key
5. Configurez `.env.local`

### 3. Configuration des variables d'environnement

Créez un fichier `.env.local` à la racine (voir `.env.example`) :

```bash
# Supabase (REQUIS pour les réservations)
NEXT_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_cle_anon_ici

# Admin Password
NEXT_PUBLIC_ADMIN_PASSWORD=admin123

# Email Configuration (optionnel)
RESEND_API_KEY=re_xxxxx
ADMIN_EMAIL=granturismotaxi@gmail.com

# Google Calendar (optionnel)
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
GOOGLE_REFRESH_TOKEN=your_refresh_token
GOOGLE_CALENDAR_ID=primary

# Site URL
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 4. Lancer en développement
```bash
npm run dev
```

Accessible sur : 
- **Site** : http://localhost:3000
- **Admin** : http://localhost:3000/admin (mot de passe : admin123)

## 📚 Documentation

- 📄 **`QUICKSTART_SUPABASE.md`** - Configuration rapide (5 min)
- 📄 **`SUPABASE_SETUP.md`** - Configuration détaillée
- 📄 **`DOCUMENTATION_RESERVATION.md`** - Documentation technique complète
- 📄 **`README_RESERVATIONS.md`** - Guide d'utilisation

## 🐳 Déploiement Docker & Railway

### Build local
```bash
docker build -t gran-turismo-taxi .
docker run -p 3000:3000 --env-file .env gran-turismo-taxi
```

### Déploiement sur Railway

1. **Push sur GitHub**
```bash
git init
git add .
git commit -m "Initial commit"
git push
```

2. **Déployer sur Railway**
   - Connectez-vous sur [Railway](https://railway.app)
   - Nouveau projet → Deploy from GitHub
   - Configurez les variables d'environnement
   - Railway détectera le Dockerfile automatiquement

## 📂 Structure du Projet

```
TAXI-Site/
├── app/                    # Pages Next.js
│   ├── page.tsx           # Accueil
│   ├── admin/page.tsx     # Back-office
│   └── api/               # API Routes
├── components/            # Composants React
├── lib/                   # Services (email, calendar, storage)
├── types/                 # Types TypeScript
├── Dockerfile            # Configuration Docker
└── railway.yml           # Configuration Railway
```

## 📞 Contact

**Gran Turismo Taxi**  
Téléphone : 06 72 36 20 15  
Email : granturismotaxi@gmail.com  
Service : 7j/7 – 24h/24
