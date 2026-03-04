# TechWatch Admin

Application d'administration pour la plateforme TechWatch.

## 🚀 Démarrage

1. **Installer les dépendances**
   ```bash
   npm install
   ```

2. **Configurer les variables d'environnement**
   ```bash
   cp env-example.txt .env
   cp env-public-example.txt .env.local
   ```

3. **Configurer la base de données**
   - Mettre à jour `DATABASE_URL` dans `.env`
   - Lancer les migrations :
   ```bash
   npx prisma migrate dev
   ```

4. **Démarrer le serveur de développement**
   ```bash
   npm run dev
   ```

L'application sera disponible sur `http://localhost:3001`

## 📁 Structure

```
admin/
├── src/
│   ├── app/                    # Pages Next.js
│   │   ├── (auth)/            # Pages d'authentification
│   │   ├── dashboard/         # Pages admin protégées
│   │   └── api/               # API routes
│   ├── components/            # Composants React
│   │   ├── auth/              # Authentification
│   │   ├── layout/            # Layout components
│   │   ├── tasks/             # Gestion des tâches
│   │   └── ui/                # UI components
│   └── lib/                   # Utilitaires
│       ├── auth.ts            # Configuration Better-Auth
│       ├── auth-client.ts     # Client auth
│       ├── prisma.ts          # Client Prisma
│       └── utils.ts           # Fonctions utilitaires
├── prisma/
│   └── schema.prisma          # Schéma de base de données
└── public/                    # Fichiers statiques
```

## 🔐 Authentification

L'application utilise **Better-Auth** avec :
- Login par email/mot de passe
- Rôles : SUPER_ADMIN, ADMIN, SUPPORT, READ_ONLY
- Sessions sécurisées
- Pas d'OAuth Google (admin uniquement)

## 🎨 Design System

- **Palette** : Neutral + accent-primary `#7C3AED`
- **Framework** : TailwindCSS v4 + shadcn/ui
- **Thème** : Dark/Light mode
- **Composants** : LottieLoader adapté de app-client

## 📊 Fonctionnalités

### ✅ Implémentées
- [x] Authentification sécurisée
- [x] Dashboard avec statistiques
- [x] Sidebar navigation moderne
- [x] Système de tâches complet
- [x] Design system cohérent

### 🚧 À développer
- [ ] Gestion des utilisateurs (CRUD)
- [ ] DataTables avancées
- [ ] Gestion des TechWatch
- [ ] Statistiques et analytics
- [ ] Paramètres système

## 🛠️ Tech Stack

- **Framework** : Next.js 15+ (App Router)
- **Authentification** : Better-Auth
- **Base de données** : PostgreSQL + Prisma
- **UI** : TailwindCSS + shadcn/ui
- **Animations** : Lottie React
- **Icons** : Lucide React

## 📝 Notes

- Port par défaut : **3001**
- Base de données partagée avec app-client
- Structure `features/` comme app-client
- Composants réutilisables et modulaires
