# 🚀 Guide de déploiement Railway

## Pré-requis
- Compte Railway (https://railway.app)
- Base de données Supabase configurée
- Variables d'environnement prêtes

## Variables d'environnement à configurer sur Railway

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://pullaqyeyqguwlbglvli.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_clé_anon
SUPABASE_SERVICE_ROLE_KEY=votre_clé_service

# Brevo Email
BREVO_API_KEY=votre_clé_brevo
ADMIN_EMAIL=granturismotaxi@gmail.com
FROM_EMAIL=granturismotaxi@gmail.com
FROM_NAME=Gran Turismo Taxi

# Admin
NEXT_PUBLIC_ADMIN_PASSWORD=votre_mot_de_passe
```

## Déploiement

1. Connectez votre repo GitHub à Railway
2. Ajoutez les variables d'environnement
3. Railway détecte automatiquement Next.js
4. Déploiement automatique !

## Post-déploiement

- Testez le système de réservation
- Vérifiez les emails
- Testez le panel admin avec le mot de passe
