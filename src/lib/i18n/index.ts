export type Locale = 'fr' | 'en'

export const translations = {
    fr: {
        // Navigation
        nav: {
            dashboard: 'Dashboard',
            users: 'Utilisateurs',
            pricing: 'Plans & Promos',
            techwatches: 'TechWatch',
            analytics: 'Analytics',
            settings: 'Paramètres',
            navigation: 'Navigation',
            tasks: 'Tâches',
            subscriptions: 'Abonnements',
        },
        // Actions
        actions: {
            logout: 'Déconnexion',
            save: 'Enregistrer',
            cancel: 'Annuler',
            edit: 'Modifier',
            delete: 'Supprimer',
            search: 'Rechercher...',
            confirm: 'Confirmer',
            close: 'Fermer',
            back: 'Retour',
            loading: 'Chargement...',
            create: 'Créer',
            update: 'Mettre à jour',
            revoke: 'Révoquer',
            add: 'Ajouter',
        },
        // Page heroes
        hero: {
            dashboard: { title: 'Dashboard', description: 'Vue d\'ensemble de votre plateforme' },
            users: { title: 'Utilisateurs', description: 'Gérez les comptes clients et l\'équipe admin' },
            pricing: { title: 'Plans & Promos', description: 'Gérez les abonnements et codes promotionnels' },
            techwatches: { title: 'TechWatch', description: 'Supervise les veilles technologiques des utilisateurs' },
            analytics: { title: 'Analytics', description: 'Métriques et indicateurs de performance' },
            settings: { title: 'Paramètres', description: 'Configuration et préférences du panel admin' },
            tasks: { title: 'Gestion des Tâches', description: 'Suivez et gérez les tâches d\'administration' },
            subscriptions: { title: 'Souscriptions & Abonnements', description: 'Suivez l\'état des abonnements de vos clients en temps réel.' },
        },
        // Components & Features
        pricing: {
            plans: {
                title: 'Abonnements',
                description: 'Offres actuellement synchronisées avec l\'application client.',
                new: 'Nouveau Plan',
                edit: 'Modifier le Plan',
                dialog: {
                    titleNew: 'Nouveau plan',
                    titleEdit: 'Modifier le plan',
                    subtitle: 'Configuration des limites',
                    general: 'Général',
                    name: 'Nom du plan',
                    slug: 'Slug API',
                    price: 'Prix (en centimes)',
                    interval: 'Intervalle',
                    monthly: 'Mensuel',
                    annual: 'Annuel',
                    limits: 'Limites d\'usage (-1 pour illimité)',
                    techWatches: 'Nombre de TechWatches',
                    storage: 'Stockage (en Gigaoctets)',
                    notes: 'Nombre de notes cloud max',
                    features: 'Fonctionnalités avancées',
                    companion: 'Compagnon IA',
                    companionDesc: 'Accès au chat persistant avec les agents IA',
                    courses: 'Création de cours',
                    coursesDesc: 'Génération de cours et quiz via IA',
                    interviews: 'Entretiens Coach',
                    interviewsDesc: 'Génération de sessions d\'entretien technique',
                    aiTools: 'Outils IA (Micro-services)',
                    comingSoon: 'Bientôt disponible',
                }
            },
            promos: {
                title: 'Codes Promotionnels',
                description: 'Gérez vos campagnes de réduction et offres spéciales.',
                new: 'Nouveau Code Promo',
                dialog: {
                    title: 'Nouvelle promotion',
                    subtitle: 'Configuration du code',
                    details: 'Détails du code',
                    code: 'Code Promo',
                    type: 'Type de remise',
                    percentage: 'Pourcentage (%)',
                    fixed: 'Montant fixe (€)',
                    value: 'Valeur',
                    restrictions: 'Restrictions',
                    planLabel: 'Plan applicable (Optionnel)',
                    allPlans: 'Tous les plans (Global)',
                    maxUses: 'Nombre d\'utilisations max (Optionnel)',
                }
            }
        },
        users: {
            tabs: {
                clients: 'Utilisateurs Clients',
                admin: 'Équipe Admin',
            },
            search: {
                clients: 'Rechercher un client (page courante)...',
                admin: 'Rechercher par email ou nom...',
            },
            table: {
                member: 'Membre de l\'équipe',
                role: 'Rôle d\'accès',
                added: 'Date d\'ajout',
                client: 'Utilisateur Client',
                watches: 'Veilles Actives',
                storage: 'Stockage Utilisé',
                joined: 'Inscription',
                emptyAdmin: 'Aucun administrateur trouvé.',
                emptyClient: 'Aucun utilisateur client trouvé sur cette page.',
                total: '{total} utilisateurs au total (Page {page} sur {totalPages})',
            },
            role: {
                SUPER_ADMIN: 'Super Admin',
                ADMIN: 'Admin',
                SUPPORT: 'Support',
                READ_ONLY: 'Lecture seule',
            },
            actions: {
                revoke: 'Révoquer',
            },
        },
        subscriptions: {
            search: 'Rechercher par email, nom ou plan...',
            table: {
                subscriber: 'Abonné',
                plan: 'Plan',
                price: 'Tarif',
                status: 'Statut',
                renewal: 'Renouvellement',
                empty: 'Aucune souscription trouvée sur cette page.',
                expires: 'Expire à cette date',
                total: '{total} souscriptions (Page {page} sur {totalPages})',
                free: 'Gratuit',
            },
            status: {
                active: 'Actif',
                canceled: 'Annulé',
                incomplete: 'Incomplet',
                past_due: 'Impayé',
                trialing: 'Essai',
            }
        },
        topbar: {
            search: 'Rechercher',
            help: 'Aide & raccourcis',
            breadcrumb: {
                dashboard: 'Dashboard',
                users: 'Utilisateurs',
                analytics: 'Analytics',
                pricing: 'Plans & Tarifs',
                techwatches: 'TechWatch',
                settings: 'Paramètres',
            }
        },
        // Command palette
        command: {
            placeholder: 'Rechercher une page, une action...',
            noResults: 'Aucun résultat',
            sections: {
                navigation: 'Navigation',
                actions: 'Actions rapides',
            },
            items: {
                toggleTheme: 'Basculer Dark / Light',
                toggleLocale: 'Basculer FR / EN',
                logout: 'Se déconnecter',
                help: 'Aide & raccourcis',
            },
        },
        // Help modal
        help: {
            title: 'Raccourcis clavier',
            shortcuts: [
                { key: 'Ctrl + K', label: 'Ouvrir la Command Palette' },
                { key: 'Ctrl + Shift + L', label: 'Basculer Dark / Light' },
                { key: 'Alt + L', label: 'Basculer FR / EN' },
                { key: 'Ctrl + H', label: 'Aide & raccourcis' },
                { key: 'Escape', label: 'Fermer les modales' },
                { key: '↑ ↓', label: 'Naviguer dans la palette' },
                { key: 'Enter', label: 'Confirmer la sélection' },
            ],
        },
    },
    en: {
        nav: {
            dashboard: 'Dashboard',
            users: 'Users',
            pricing: 'Plans & Promos',
            techwatches: 'TechWatch',
            analytics: 'Analytics',
            settings: 'Settings',
            navigation: 'Navigation',
            tasks: 'Tasks',
            subscriptions: 'Subscriptions',
        },
        actions: {
            logout: 'Logout',
            save: 'Save',
            cancel: 'Cancel',
            edit: 'Edit',
            delete: 'Delete',
            search: 'Search...',
            confirm: 'Confirm',
            close: 'Close',
            back: 'Back',
            loading: 'Loading...',
            create: 'Create',
            update: 'Update',
            revoke: 'Revoke',
            add: 'Add',
        },
        hero: {
            dashboard: { title: 'Dashboard', description: 'Overview of your platform' },
            users: { title: 'Users', description: 'Manage client accounts and admin team' },
            pricing: { title: 'Plans & Promos', description: 'Manage subscriptions and promo codes' },
            techwatches: { title: 'TechWatch', description: 'Monitor users\' technology watches' },
            analytics: { title: 'Analytics', description: 'Metrics and performance indicators' },
            settings: { title: 'Settings', description: 'Configuration and admin panel preferences' },
            tasks: { title: 'Task Management', description: 'Track and manage administration tasks' },
            subscriptions: { title: 'Subscriptions & Memberships', description: 'Track your clients\' subscription status in real time.' },
        },
        pricing: {
            plans: {
                title: 'Plans',
                description: 'Offers currently synced with the client application.',
                new: 'New Plan',
                edit: 'Edit Plan',
                dialog: {
                    titleNew: 'New Plan',
                    titleEdit: 'Edit Plan',
                    subtitle: 'Limits Configuration',
                    general: 'General',
                    name: 'Plan Name',
                    slug: 'API Slug',
                    price: 'Price (in cents)',
                    interval: 'Interval',
                    monthly: 'Monthly',
                    annual: 'Annual',
                    limits: 'Usage Limits (-1 for unlimited)',
                    techWatches: 'TechWatches Count',
                    storage: 'Storage (in Gigabytes)',
                    notes: 'Max cloud notes',
                    features: 'Advanced Features',
                    companion: 'AI Companion',
                    companionDesc: 'Access to persistent chat with AI agents',
                    courses: 'Course Creation',
                    coursesDesc: 'AI-powered course and quiz generation',
                    interviews: 'Coach Interviews',
                    interviewsDesc: 'AI-powered technical interview sessions',
                    aiTools: 'AI Tools (Micro-services)',
                    comingSoon: 'Coming Soon',
                }
            },
            promos: {
                title: 'Promo Codes',
                description: 'Manage your discount campaigns and special offers.',
                new: 'New Promo Code',
                dialog: {
                    title: 'New Promotion',
                    subtitle: 'Code Configuration',
                    details: 'Code Details',
                    code: 'Promo Code',
                    type: 'Discount Type',
                    percentage: 'Percentage (%)',
                    fixed: 'Fixed Amount (€)',
                    value: 'Value',
                    restrictions: 'Restrictions',
                    planLabel: 'Applicable Plan (Optional)',
                    allPlans: 'All Plans (Global)',
                    maxUses: 'Max Uses (Optional)',
                }
            }
        },
        users: {
            tabs: {
                clients: 'Client Users',
                admin: 'Admin Team',
            },
            search: {
                clients: 'Search a client (current page)...',
                admin: 'Search by email or name...',
            },
            table: {
                member: 'Team Member',
                role: 'Access Role',
                added: 'Date Added',
                client: 'Client User',
                watches: 'Active Watches',
                storage: 'Storage Used',
                joined: 'Joined',
                emptyAdmin: 'No administrators found.',
                emptyClient: 'No client users found on this page.',
                total: '{total} total users (Page {page} of {totalPages})',
            },
            role: {
                SUPER_ADMIN: 'Super Admin',
                ADMIN: 'Admin',
                SUPPORT: 'Support',
                READ_ONLY: 'Read Only',
            },
            actions: {
                revoke: 'Revoke',
            },
        },
        subscriptions: {
            search: 'Search by email, name or plan...',
            table: {
                subscriber: 'Subscriber',
                plan: 'Plan',
                price: 'Price',
                status: 'Status',
                renewal: 'Renewal',
                empty: 'No subscriptions found on this page.',
                expires: 'Expires on this date',
                total: '{total} subscriptions (Page {page} of {totalPages})',
                free: 'Free',
            },
            status: {
                active: 'Active',
                canceled: 'Canceled',
                incomplete: 'Incomplete',
                past_due: 'Past Due',
                trialing: 'Trialing',
            }
        },
        topbar: {
            search: 'Search',
            help: 'Help & shortcuts',
            breadcrumb: {
                dashboard: 'Dashboard',
                users: 'Users',
                analytics: 'Analytics',
                pricing: 'Plans & Pricing',
                techwatches: 'TechWatch',
                settings: 'Settings',
            }
        },
        command: {
            placeholder: 'Search a page, an action...',
            noResults: 'No results',
            sections: {
                navigation: 'Navigation',
                actions: 'Quick actions',
            },
            items: {
                toggleTheme: 'Toggle Dark / Light',
                toggleLocale: 'Toggle FR / EN',
                logout: 'Sign out',
                help: 'Help & shortcuts',
            },
        },
        help: {
            title: 'Keyboard shortcuts',
            shortcuts: [
                { key: 'Ctrl + K', label: 'Open Command Palette' },
                { key: 'Ctrl + Shift + L', label: 'Toggle Dark / Light' },
                { key: 'Alt + L', label: 'Toggle FR / EN' },
                { key: 'Ctrl + H', label: 'Help & shortcuts' },
                { key: 'Escape', label: 'Close modals' },
                { key: '↑ ↓', label: 'Navigate palette' },
                { key: 'Enter', label: 'Confirm selection' },
            ],
        },
    },
} as const

export type Translations = typeof translations[Locale]

export function getT(locale: Locale): typeof translations[typeof locale] {
    return translations[locale]
}
