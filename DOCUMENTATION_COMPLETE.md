# TechWatch Admin - Documentation Complète

## 🎯 Vue d'Ensemble

Application d'administration TechWatch avec architecture moderne, sécurisée et scalable.

---

## 📁 Structure du Projet

```
admin/
├── src/
│   ├── app/                    # Pages Next.js App Router
│   │   ├── dashboard/          # Routes protégées
│   │   │   ├── users/         # Gestion utilisateurs
│   │   │   ├── pricing/        # Gestion plans
│   │   │   ├── techwatches/    # Supervision TechWatch
│   │   │   ├── settings/       # Configuration système
│   │   │   └── tasks/          # Gestion tâches
│   │   ├── login/             # Page d'authentification
│   │   ├── layout.tsx         # Layout principal
│   │   ├── page.tsx           # Redirection racine
│   │   └── globals.css        # Styles globaux
│   ├── components/
│   │   ├── ui/                # Composants UI de base
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── avatar.tsx
│   │   │   └── data-table.tsx
│   │   ├── auth/              # Authentification
│   │   ├── layout/            # Layout components
│   │   └── tasks/             # Tâches
│   ├── features/               # Architecture feature-based
│   │   ├── dashboard/actions/   # Actions server
│   │   └── ...
│   ├── lib/
│   │   ├── auth.ts           # Better-Auth configuration
│   │   ├── prisma.ts         # Client Prisma
│   │   ├── utils.ts          # Utilitaires
│   │   ├── permissions.ts    # Système permissions
│   │   └── auth-client.ts    # Client Better-Auth
│   ├── proxy.ts              # Middleware protection routes
│   ├── middleware.ts         # Next.js middleware
│   └── types/
│       └── global.d.ts       # Déclarations TypeScript
├── prisma/
│   └── schema.prisma         # Schéma base de données
├── components.json            # Configuration shadcn/ui
└── package.json             # Dépendances
```

---

## 🛡️ Sécurité & Authentification

### Rôles Admin
- **SUPER_ADMIN** : Accès complet à toutes les fonctionnalités
- **ADMIN** : Gestion utilisateurs, plans, TechWatches
- **SUPPORT** : Visualisation et support limité
- **READ_ONLY** : Accès consultation uniquement

### Permissions
```typescript
export const ADMIN_PERMISSIONS = {
  'VIEW_DASHBOARD': ['READ_ONLY', 'SUPPORT', 'ADMIN', 'SUPER_ADMIN'],
  'EDIT_USERS': ['ADMIN', 'SUPER_ADMIN'],
  'VIEW_PLANS': ['READ_ONLY', 'SUPPORT', 'ADMIN', 'SUPER_ADMIN'],
  'EDIT_PLANS': ['ADMIN', 'SUPER_ADMIN'],
  // ...
}
```

### Middleware Proxy
- **Protection routes** : `/dashboard/*` nécessite authentification
- **Validation rôles** : Vérification permissions par route
- **Redirection automatique** : Vers login ou dashboard selon contexte

---

## 🎨 Design System

### Variables CSS
```css
:root {
  --accent-primary: #7C3AED;
  --accent-primary-bg: rgba(124, 58, 237, 0.08);
}

.dark {
  --accent-primary: #A78BFA;
}
```

### Classes Utilitaires
- `.admin-card` : Cards administration
- `.auth-form-*` : Styles formulaires login
- `.nav-link-*` : Navigation sidebar
- `.status-*` : Badges statuts
- `.priority-*` : Badges priorités

---

## 📊 Composants UI

### DataTable
- **Recherche intégrée** : Filtrage par colonne
- **Tri automatique** : Support colonnes multiples
- **Actions CRUD** : Voir, Modifier, Supprimer
- **Responsive design** : Mobile-first

### Composants Base
- **Button** : Variants (default, outline, destructive, ghost)
- **Input** : Champs formulaires stylisés
- **Badge** : Statuts et labels
- **Avatar** : Images et fallbacks
- **Formulaires** : Login, création, édition

---

## 🚀 Démarrage Rapide

### Installation
```bash
# Installer dépendances
npm install --legacy-peer-deps

# Variables environnement
cp env-example.txt .env.local
cp env-public-example.txt .env.public.local

# Base de données
npx prisma generate
npx prisma db push
```

### Lancement
```bash
# Développement
npm run dev

# Production
npm run build
npm start
```

---

## 📋 Fonctionnalités Implémentées

### ✅ Dashboard
- **Statistiques en temps réel** : Utilisateurs, TechWatches, articles
- **Actions rapides** : Accès direct aux fonctionnalités principales
- **État système** : Monitoring des services

### ✅ Gestion Utilisateurs
- **DataTable complète** : Liste avec recherche et filtres
- **Informations détaillées** : Avatars, abonnements, statuts
- **Actions modales** : Voir profil, modifier, supprimer

### ✅ Gestion Plans
- **Plans d'abonnement** : Free, Pro, Enterprise
- **Promotions** : Codes et périodes de validité
- **Prix dynamiques** : Calcul automatique

### ✅ Supervision TechWatches
- **Vue d'ensemble** : Statuts, activités, utilisateurs
- **Actions rapides** : Voir, modifier, supprimer
- **Métadonnées riches** : Descriptions, dates, compteurs

### ✅ Configuration Système
- **Paramètres configurables** : Maintenance, limites, notifications
- **Sécurité** : Auth 2FA, timeout, sessions
- **Base de données** : Connexions, sauvegardes, monitoring

### ✅ Système de Tâches
- **Gestion complète** : Création, édition, suppression
- **Priorités** : Haute, moyenne, basse
- **Statuts** : À faire, en cours, terminées

---

## 🔧 Architecture Technique

### Stack
- **Frontend** : Next.js 15+, React 19+, TypeScript
- **Backend** : Next.js API routes, PostgreSQL
- **ORM** : Prisma avec schéma partagé
- **Auth** : Better-Auth (email/password + rôles)
- **UI** : TailwindCSS v4, composants custom
- **Icons** : Lucide React
- **Database** : PostgreSQL (partagée avec app-client)

### Patterns
- **Feature-based** : Organisation par fonctionnalité
- **Server Actions** : Logique métier côté serveur
- **Type Safety** : TypeScript strict
- **Middleware** : Protection et validation des routes

---

## 🧪 Tests & Validation

### Tests Fonctionnels
- **Authentification** : Login, logout, sessions
- **Permissions** : Accès par rôle et restrictions
- **CRUD** : Création, lecture, mise à jour, suppression
- **Navigation** : Routing, sidebar, breadcrumbs

### Validation Sécurité
- **Injection SQL** : Prisma ORM protection
- **XSS** : Sanitisation inputs et outputs
- **CSRF** : Tokens CSRF Better-Auth
- **Auth** : Sessions sécurisées, timeout

---

## 🚨 Dépannage

### Problèmes Communs
```bash
# Erreurs TypeScript
npm run type-check

# Base de données
npx prisma studio

# Logs développement
npm run dev
```

### Solutions
- **Dépendances** : Utiliser `--legacy-peer-deps` si conflit Zod
- **Imports** : Vérifier les chemins dans `tsconfig.json`
- **Environment** : Variables `.env.local` correctement configurées

---

## 📈 Évolutions Prévues

### Phase 2
- **Analytics avancées** : Graphiques et export CSV
- **Notifications temps réel** : WebSocket pour admin
- **Audit logs** : Traçabilité complète des actions

### Phase 3
- **Multi-tenants** : Support plusieurs organisations
- **API REST** : Endpoints pour intégrations externes
- **Performance** : Optimisation et monitoring

---

## 👥 Support

### Documentation
- **Guide utilisateur** : Manuel admin complet
- **API Reference** : Documentation des endpoints
- **Tutoriels vidéo** : Démonstration des fonctionnalités

### Contact
- **Issues** : GitHub repository
- **Discussions** : Forum communautaire
- **Email** : support@techwatch.com

---

## 📄 Licence

MIT License - Usage commercial et personnel autorisé

---

*Généré le 3 Mars 2026*
