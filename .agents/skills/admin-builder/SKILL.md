---
name: admin-builder
description: Skill agent for building the TechWatch Admin panel. Knows the full design system (glassmorphism, violet brand, dark sidebar), the current admin project state, and how to add new features (users, billing, pricing, settings) matching the app-client style.
---

# Admin Builder Skill

Tu es un expert en développement du panneau d'administration TechWatch. Tu connais parfaitement les deux projets (`app-client` et `admin`) et tu sais reproduire fidèlement le design system de l'un dans l'autre.

---

## 📁 Structure des projets

```
veille/
├── app-client/       # App utilisateur (Next.js 15, Tailwind v4, shadcn/ui)
│   ├── architecture/ # Docs architecture admin
│   │   ├── ADMIN_IMPLEMENTATION_GUIDE.md
│   │   ├── ADMIN_SECURITY_ARCHITECTURE.md
│   │   ├── PRICING_ARCHITECTURE_PLAN.md
│   │   └── SHARED_DB_ARCHITECTURE.md
│   └── src/          # Source app-client
└── admin/            # App admin (Next.js 15, Tailwind v4, shadcn/ui)
    └── src/
        ├── app/
        │   ├── layout.tsx          # Root layout (Geist font, dark mode)
        │   ├── globals.css         # Design system complet (premium, glassmorphism)
        │   ├── login/page.tsx      # Page login
        │   └── dashboard/
        │       ├── layout.tsx      # Layout protégé (vérifie session)
        │       ├── page.tsx        # Dashboard avec stats
        │       ├── users/page.tsx  # Gestion utilisateurs
        │       ├── pricing/        # Plans tarifaires
        │       ├── techwatches/    # TechWatches admin
        │       ├── tasks/          # Tâches
        │       └── settings/       # Paramètres
        ├── components/
        │   ├── layout/Sidebar.tsx  # Sidebar dark (chrome-bg)
        │   ├── auth/
        │   │   ├── AdminLoginForm.tsx
        │   │   └── AdminLogoutButton.tsx
        │   └── ui/                 # shadcn/ui: button, badge, avatar, data-table, input
        ├── features/
        │   └── dashboard/
        │       └── actions/        # Server actions
        ├── lib/
        │   ├── auth.ts             # Better-Auth config
        │   ├── auth-client.ts      # Better-Auth client
        │   ├── prisma.ts           # Prisma client
        │   ├── permissions.ts      # RBAC permissions
        │   └── utils.ts            # cn() utility
        └── types/
```

---

## 🎨 Design System (CRITIQUE — à respecter absolument)

### Principe fondamental
Le design s'inspire d'Apple, Stripe et Linear : **calme, professionnel, intentionnel**.
- Couleurs accentuées utilisées **avec parcimonie** (< 10% de l'UI)
- Glassmorphism subtil (blur 8-12px, alpha 0.75-0.85)
- Animations uniquement sur hover/focus/state-change (jamais infini)

### Variables CSS clés (définies dans `globals.css`)

```css
/* Fond sidebar — TOUJOURS sombre, même en light mode */
--chrome-bg:     rgba(10, 10, 10, 0.96);
--chrome-border: rgba(255, 255, 255, 0.08);

/* Brand violet */
--brand:         #7C3AED;
--brand-light:   #A78BFA;

/* Glassmorphism */
--glass-bg:      rgba(255,255,255,0.75);     /* light */
--glass-border:  rgba(0,0,0,0.08);
--glass-blur:    12px;

/* Dark mode glassmorphism */
--glass-bg:      rgba(23,23,23,0.85);        /* dark */
--glass-border:  rgba(255,255,255,0.09);

/* Texte */
--page-fg:  #171717;   /* light */
--page-fg:  #FAFAFA;   /* dark */
--txt-sub:  rgba(23,23,23,0.60);
--txt-muted: rgba(23,23,23,0.40);
```

### Classes utilitaires importantes

| Classe | Usage |
|--------|-------|
| `.glass` | Surface translucide avec backdrop-filter |
| `.dot-grid` | Fond grille de points |
| `.animate-slide-up` | Animation d'entrée (mount only) |
| `.animate-zoom-in` | Zoom d'entrée |
| `.gradient-text` | Texte couleur brand |
| `.admin-card` | Carte admin (rounded-lg border bg-card shadow-sm) |
| `.admin-content` | Zone contenu (flex-1 p-6) |
| `.admin-sidebar` | Sidebar (w-64 bg-card border-r) |
| `.auth-form-card` | Carte formulaire auth |
| `.auth-form-input` | Input stylé auth |
| `.auth-form-submit` | Bouton submit auth |

### Couleurs accent (utiliser rarement)
```
Violet:  #7C3AED  /  #A78BFA   (violet clair)
Bleu:    #3B82F6
Vert:    #10B981
Amber:   #F59E0B
```

### Palette neutrals
```
neutral-50:  #FAFAFA
neutral-950: #0A0A0A
```

---

## 🏗️ Patterns d'implémentation

### 1. Pattern Page (Server Component)

```tsx
// admin/src/app/dashboard/[feature]/page.tsx
import { getFeatureData } from '@/features/[feature]/actions/[feature].actions'

export default async function FeaturePage() {
  const data = await getFeatureData()
  
  return (
    <div className="admin-content">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Titre de la page</h1>
        <p className="text-muted-foreground mt-2">Description courte</p>
      </div>
      
      {/* Contenu */}
      <div className="admin-card p-6">
        {/* ... */}
      </div>
    </div>
  )
}
```

### 2. Pattern Stats Card (Dashboard)

```tsx
<div className="admin-card p-6">
  <div className="flex items-center justify-between">
    <div>
      <p className="text-sm font-medium text-muted-foreground">Titre</p>
      <p className="text-2xl font-bold text-foreground mt-2">Valeur</p>
      <div className="flex items-center gap-2 mt-2">
        <p className="text-sm text-green-600">+X%</p>
        <span className="text-xs text-muted-foreground">• détail</span>
      </div>
    </div>
    <div className="p-3 rounded-lg bg-muted text-blue-600">
      <Icon className="w-6 h-6" />
    </div>
  </div>
</div>
```

### 3. Pattern DataTable

```tsx
// Utilise le composant DataTable existant dans components/ui/data-table.tsx
import { DataTable } from '@/components/ui/data-table'

const columns = [
  {
    header: 'Colonne',
    accessorKey: 'field' as keyof DataType,
    cell: (row: DataType) => <div>{row.field}</div>,
  },
]

// Dans le return :
<div className="admin-card">
  <DataTable columns={columns} data={data} searchKey="email" />
</div>
```

### 4. Pattern Sidebar (TOUJOURS dark)

La sidebar utilise `--chrome-bg` comme fond (toujours sombre) :

```tsx
// Style obligatoire pour la sidebar
style={{ 
  background: 'var(--chrome-bg)', 
  borderRight: '1px solid var(--chrome-border)', 
  backdropFilter: 'blur(20px)' 
}}

// Lien actif
isActive
  ? 'bg-[rgba(124,58,237,0.22)] border border-[rgba(124,58,237,0.35)] shadow-[0_0_12px_rgba(124,58,237,0.15)]'
  : 'text-muted-foreground hover:bg-[rgba(124,58,237,0.12)]'
```

### 5. Pattern Server Action

```typescript
// admin/src/features/[feature]/actions/[feature].actions.ts
import { prisma } from '@/lib/prisma'

export async function getFeatureData() {
  try {
    const data = await prisma.model.findMany({
      // ...
    })
    return { data, error: null }
  } catch (error) {
    console.error('[FEATURE] Error:', error)
    return { data: [], error: 'Erreur lors du chargement' }
  }
}
```

### 6. Pattern Formulaire Client

```tsx
'use client'

import { useState } from 'react'
import { Loader2 } from 'lucide-react'

export function FeatureForm() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      // action
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="settings-label">Label</label>
        <input className="settings-input" />
      </div>
      {error && <p className="text-xs text-red-400">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="auth-form-submit flex items-center gap-2 px-4 py-2.5 rounded-lg font-semibold text-sm"
        style={{ background: loading ? 'rgba(124,58,237,0.5)' : '#7C3AED' }}
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Enregistrer'}
      </button>
    </form>
  )
}
```

---

## 🔐 Authentification et Sécurité

### Config auth admin (`src/lib/auth.ts`)
- Better-Auth avec Prisma adapter
- `emailAndPassword` uniquement (pas de social providers)
- Rôles : `SUPER_ADMIN`, `ADMIN`, `SUPPORT`, `READ_ONLY`

### Vérification session dans les layouts
```tsx
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'

const session = await auth.api.getSession({ headers: await headers() })
if (!session) redirect('/login')
```

### Système de permissions (`src/lib/permissions.ts`)
```typescript
import { hasPermission } from '@/lib/permissions'

// Vérifier une permission
if (!hasPermission(session.user.role, 'EDIT_USERS')) {
  throw new Error('Permission denied')
}
```

Permissions disponibles :
- `VIEW_DASHBOARD`, `VIEW_USERS`, `EDIT_USERS`, `DELETE_USERS`
- `VIEW_PLANS`, `EDIT_PLANS`, `DELETE_PLANS`
- `VIEW_PROMOTIONS`, `EDIT_PROMOTIONS`, `DELETE_PROMOTIONS`

---

## 📊 Fonctionnalités à implémenter

### ✅ Déjà fait
- Layout root (`app/layout.tsx`) avec Geist font
- `globals.css` avec design system complet
- Sidebar dark avec navigation
- Page Login avec formulaire auth
- Dashboard page avec stats cards
- Page Users avec DataTable
- Server actions dashboard
- Composants UI de base (button, badge, avatar, data-table, input)

### 🔲 À faire (par ordre de priorité)

#### 1. Billing / Plans tarifaires (`/dashboard/pricing`)
- Liste des plans avec DataTable
- Formulaire création/modification plan
- Toggle actif/inactif
- Prix, durée, features

#### 2. Gestion détaillée utilisateurs (`/dashboard/users/[userId]`)
- Fiche utilisateur complète
- Modifier rôle, statut abonnement
- Historique activité
- Ban/unban utilisateur

#### 3. Paramètres système (`/dashboard/settings`)
- Config générale (nom app, maintenance mode)
- Config email (SMTP)
- Config Stripe/paiement

#### 4. Analytics (`/dashboard/analytics`)
- Graphiques revenue (recharts)
- Évolution utilisateurs
- Conversion rates

#### 5. Promotions/Codes promo
- Créer codes de réduction
- Lier à des plans
- Durée et % réduction

---

## 🗄️ Schéma Prisma (base partagée avec app-client)

Le fichier Prisma du admin (`admin/prisma/schema.prisma`) pointe vers la même DB que l'app-client. Les modèles principaux :

- `User` — utilisateurs (id, name, email, role, emailVerified, image, createdAt)
- `Session` — sessions auth
- `Account` — comptes OAuth
- `TechWatch` — veilles technologiques (id, userId, techId, status, createdAt)
- `Plan` — plans tarifaires (id, name, price, interval, features, isActive)
- `Subscription` — abonnements (id, userId, planId, status, currentPeriodEnd)

Pour accéder au schéma complet : `app-client/prisma/schema.prisma`

---

## ⚠️ Règles & Pièges à éviter

### 1. Server vs Client Components
- Les **pages** (`page.tsx`) doivent rester des **Server Components** (pas de `'use client'`)
- Les interactions (formulaires, tables cliquables) → créer des **Client Components** enfants
- Passer les données via props du Server au Client

```
❌ Mauvais :
page.tsx → 'use client' + useState

✅ Correct :
page.tsx → Server Component → importe <FeatureClient data={data} />
FeatureClient.tsx → 'use client' + useState
```

### 2. Auth dans les layouts
- Toujours vérifier la session dans `dashboard/layout.tsx`
- Utiliser `auth.api.getSession({ headers: await headers() })`
- Ne JAMAIS vérifier l'auth dans les pages individuelles (déjà fait par le layout)

### 3. Classes CSS admin
- Utiliser `.admin-card` pour les cartes (pas `bg-white` ou `bg-card` seul)
- Utiliser `.admin-content` pour le wrapper de page (pas `p-6` seul)
- Utiliser `.settings-input` pour les inputs (pas les classes Tailwind brutes)

### 4. Sidebar — TOUJOURS dark
- La sidebar doit utiliser `var(--chrome-bg)` même en light mode
- Ne JAMAIS utiliser `bg-card` ou `bg-white` pour la sidebar

### 5. Couleur brand
- Utiliser `#7C3AED` pour le violet principal
- Utiliser `#A78BFA` pour le violet clair (icônes, hovers)
- Toujours avec transparence pour les fonds : `rgba(124,58,237,0.22)`

---

## 🚀 Commandes utiles

```bash
# Dans veille/admin/
npm run dev      # Port 3001 (ou défini dans .env)
npm run build
npx prisma studio  # Explore la DB

# Ajouter un composant shadcn/ui
npx shadcn@latest add [component]
# Exemples :
npx shadcn@latest add dialog
npx shadcn@latest add select
npx shadcn@latest add form
npx shadcn@latest add switch
npx shadcn@latest add table
npx shadcn@latest add card
```

---

## 📚 Références importantes

- `app-client/architecture/ADMIN_IMPLEMENTATION_GUIDE.md` — Guide complet d'implémentation
- `app-client/architecture/ADMIN_SECURITY_ARCHITECTURE.md` — Architecture sécurité
- `app-client/architecture/PRICING_ARCHITECTURE_PLAN.md` — Plan pricing
- `app-client/architecture/SHARED_DB_ARCHITECTURE.md` — Schéma DB partagé
- `admin/src/app/globals.css` — Design system complet (1067 lignes)
- `admin/src/app/dashboard/page.tsx` — Exemple de page dashboard
- `admin/src/components/layout/Sidebar.tsx` — Exemple sidebar
- `app-client/src/components/layout/Sidebar.tsx` — Sidebar originale (référence design)
