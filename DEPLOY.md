# 🚀 Guide de déploiement Railway

## Pré-requis
- Compte Railway (https://railway.app)
- Base de données Supabase configurée
- Compte Brevo configuré

## ⚠️ IMPORTANT : Variables d'environnement

Railway a besoin de TOUTES les variables d'environnement **AVANT** le build.

### Étapes de configuration sur Railway :

1. **New Project** → Deploy from GitHub
2. Sélectionnez `GrandTurismoTaxi`
3. **AVANT le premier déploiement**, cliquez sur **Variables**
4. Ajoutez ces variables (copiez depuis votre `.env.local` local) :

```bash
# Supabase (OBLIGATOIRE pour le build Next.js)
NEXT_PUBLIC_SUPABASE_URL=votre_url_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_clé_anon_supabase
SUPABASE_SERVICE_ROLE_KEY=votre_clé_service_role_supabase

# Brevo Email (OBLIGATOIRE)
BREVO_API_KEY=votre_clé_brevo
ADMIN_EMAIL=granturismotaxi@gmail.com
FROM_EMAIL=granturismotaxi@gmail.com
FROM_NAME=Gran Turismo Taxi

# Admin Panel (OBLIGATOIRE)
NEXT_PUBLIC_ADMIN_PASSWORD=choisir_un_mot_de_passe_fort
```

5. **Deploy** → Railway va automatiquement :
   - Installer les dépendances (`npm ci`)
   - Build Next.js (`npm run build`)
   - Lancer l'application (`npm start`)

## Post-déploiement

1. Ouvrez l'URL fournie par Railway
2. Testez le système de réservation
3. Testez le panel admin : `https://votre-url.railway.app/admin`
4. Vérifiez que les emails partent correctement

## 🔧 Debugging

Si le build échoue avec "Type error" ou "Failed to compile" :
- Vérifiez que **toutes** les variables `NEXT_PUBLIC_*` sont configurées
- Les variables avec `NEXT_PUBLIC_` sont nécessaires **pendant le build**
- Consultez les logs de build dans Railway

Si les emails ne partent pas :
- Vérifiez `BREVO_API_KEY` dans Railway
- Vérifiez que `FROM_EMAIL` est vérifié dans Brevo
