import { CreditCard, Tag, Check, X as XIcon, Edit, Trash2, Zap, LayoutGrid, Rocket, Info } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { getPlans, getPromotions } from '@/features/pricing/actions/pricing.actions'
import { syncAllPlansFromStripe } from '@/features/pricing/actions/sync.actions'
import { CreatePlanDialog } from '@/features/pricing/components/CreatePlanDialog'
import { SyncStripeButton } from '@/features/pricing/components/SyncStripeButton'
import { DeletePlanButton } from '@/features/pricing/components/DeletePlanButton'
import { PageHero } from '@/components/ui/PageHero'
import { Button } from '@/components/ui/button'
import { cookies } from 'next/headers'
import { getT, type Locale } from '@/lib/i18n'
import { getSession, requirePermission } from '@/lib/session'
import { hasPermission, type AdminRole } from '@/lib/permissions'

export interface PlanFeatures {
  techWatches: number
  notes: number
  storage: number
  companion: boolean
  courses: number
  interviews: boolean
  aiTools: boolean
  mindmaps: boolean
  roadmap: boolean
  comparisons: boolean
  chatHistory: boolean
  articles: number
  tasks: number
  resources: number
  agenda: boolean
  [key: string]: number | boolean
}

export default async function PricingPage() {
  await requirePermission('VIEW_PLANS')
  const cookieStore = await cookies()
  const lang = (cookieStore.get('NEXT_LOCALE')?.value as Locale) || 'fr'
  const t = getT(lang)

  const [plansRes, promosRes, session] = await Promise.all([
    getPlans(),
    getPromotions(),
    getSession()
  ])

  const userRole = (session?.user?.role as AdminRole) || 'READ_ONLY'
  const canEditPlans = hasPermission(userRole, 'EDIT_PLANS')
  const canEditPromos = hasPermission(userRole, 'EDIT_PROMOTIONS')

  const plans = plansRes.plans || []
  const promos = promosRes.promos || []

  const formatPrice = (price: number) => {
    if (price === 0) return 'Gratuit'
    return `${(price / 100).toFixed(2)}€`
  }

  return (
    <div className="animate-slide-up-fade">
      <PageHero
        title={t.hero.pricing.title}
        description={t.hero.pricing.description}
        label={t.nav.pricing}
      />

      <div className="page-container" style={{ paddingTop: '0' }}>

        {/*
          ─────────────────────────────────────────────────────────────
          SECTION: PLANS TICKETS (Cards)
          ─────────────────────────────────────────────────────────────
        */}
        <div className="mb-10 animate-slide-up-fade" style={{ animationDelay: '100ms' }}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-[var(--page-fg)] flex items-center gap-2">
                <LayoutGrid className="w-5 h-5 text-primary" />
                Abonnements
              </h2>
              <p className="text-sm text-muted-foreground mt-1">Offres actuellement synchronisées avec l'application client.</p>
            </div>
            <div className="flex items-center gap-3">
              {canEditPlans && (
                <>
                  <SyncStripeButton />
                  {plans.find((p: any) => p.monthlyPrice === 0 && p.yearlyPrice === 0) ? (
                    <CreatePlanDialog
                      initialData={plans.find((p: any) => p.monthlyPrice === 0 && p.yearlyPrice === 0) as any}
                      triggerLabel="Configurer le Pack Gratuit"
                      triggerVariant="outline"
                    />
                  ) : (
                    <CreatePlanDialog
                      triggerLabel="Créer Pack Gratuit"
                      triggerVariant="outline"
                      defaultMonthlyPrice={0}
                      defaultYearlyPrice={0}
                    />
                  )}
                </>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {plans.map((plan: any, idx: number) => {
              const features = plan.features as PlanFeatures
              const isPopular = !!features.isPopular
              const priceLabel = formatPrice(plan.monthlyPrice)
              const yearlyPriceLabel = formatPrice(plan.yearlyPrice)

              return (
                <div key={plan.id} className="group relative flex flex-col p-6 rounded-2xl bg-[var(--card-bg)] border transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                  style={{
                    borderColor: isPopular ? 'rgba(139,92,246,0.5)' : 'var(--glass-border)',
                    boxShadow: isPopular ? '0 10px 40px -10px rgba(139,92,246,0.2)' : 'none'
                  }}>

                  {isPopular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-primary rounded-full text-[10px] font-bold tracking-wider text-white shadow-primary/50">
                      POPULAIRE
                    </div>
                  )}

                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-[var(--page-fg)]">{plan.name}</h3>
                      <div className="flex items-baseline gap-1 mt-2">
                        <span className="text-3xl font-extrabold tracking-tight text-white">{priceLabel}</span>
                        {plan.monthlyPrice > 0 && <span className="text-sm font-medium text-muted-foreground">/mois | {yearlyPriceLabel}/an</span>}
                      </div>
                    </div>

                    <Badge variant="outline" className={`border ${plan.isActive ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-slate-500/10 text-slate-400 border-slate-500/20'} px-2 py-0.5 rounded-full text-[10px] font-bold`}>
                      {plan.isActive ? 'ACTIF' : 'INACTIF'}
                    </Badge>
                  </div>

                  <p className="text-sm text-muted-foreground mb-6 line-clamp-2">
                    {plan.description || "Aucune description fournie pour ce plan."}
                  </p>

                  <div className="flex-1 space-y-3 mb-8">
                    <div className="flex items-start gap-3 justify-center border-b border-[var(--glass-border)] pb-3 mb-3">
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Abonnés</p>
                        <p className="text-2xl font-bold text-primary">{plan._count.subscriptions}</p>
                      </div>
                    </div>

                    <ul className="space-y-2.5 text-sm">
                      <li className="flex items-center gap-3 text-slate-300">
                        <div className="p-0.5 rounded-full bg-emerald-500/20 text-emerald-400"><Check className="w-3 h-3" strokeWidth={3} /></div>
                        <span className="font-medium text-white">{features.techWatches === -1 ? 'Illimités' : (features.techWatches || '0')}</span> TechWatches
                      </li>
                      <li className="flex items-center gap-3 text-slate-300">
                        <div className="p-0.5 rounded-full bg-emerald-500/20 text-emerald-400"><Check className="w-3 h-3" strokeWidth={3} /></div>
                        <span className="font-medium text-white">{features.notes === -1 ? 'Illimitées' : (features.notes || '0')}</span> Notes
                      </li>
                      <li className="flex items-center gap-3 text-slate-300">
                        <div className="p-0.5 rounded-full bg-emerald-500/20 text-emerald-400"><Check className="w-3 h-3" strokeWidth={3} /></div>
                        <span className="font-medium text-white">{features.storage && features.storage >= 1073741824 ? (features.storage / 1073741824).toFixed(0) : (features.storage ? (features.storage / 1048576).toFixed(0) : '0')} {features.storage && features.storage >= 1073741824 ? 'GB' : 'MB'}</span> d'espace de stockage
                      </li>
                      <li className="flex items-center gap-3 text-slate-300">
                        {features.companion ? <div className="p-0.5 rounded-full bg-primary/20 text-primary"><Check className="w-3 h-3" strokeWidth={3} /></div> : <div className="p-0.5 rounded-full bg-slate-500/20 text-slate-500"><XIcon className="w-3 h-3" strokeWidth={3} /></div>}
                        <span className={features.companion ? 'text-[var(--page-fg)]' : 'text-muted-foreground'}>Assistant IA</span>
                      </li>
                      <li className="flex items-center gap-3 text-slate-300">
                        {features.courses ? <div className="p-0.5 rounded-full bg-primary/20 text-primary"><Check className="w-3 h-3" strokeWidth={3} /></div> : <div className="p-0.5 rounded-full bg-slate-500/20 text-slate-500"><XIcon className="w-3 h-3" strokeWidth={3} /></div>}
                        <span className={features.courses ? 'text-[var(--page-fg)]' : 'text-muted-foreground'}>{features.courses === -1 ? 'Création de cours illimitée' : (Number(features.courses) > 0 ? `${features.courses} Création de cours` : 'Pas de création de cours')}</span>
                      </li>
                      <li className="flex items-center gap-3 text-slate-300">
                        {features.mindmaps ? <div className="p-0.5 rounded-full bg-primary/20 text-primary"><Check className="w-3 h-3" strokeWidth={3} /></div> : <div className="p-0.5 rounded-full bg-slate-500/20 text-slate-500"><XIcon className="w-3 h-3" strokeWidth={3} /></div>}
                        <span className={features.mindmaps ? 'text-[var(--page-fg)]' : 'text-muted-foreground'}>Mindmaps</span>
                      </li>
                      <li className="flex items-center gap-3 text-slate-300">
                        {features.roadmap ? <div className="p-0.5 rounded-full bg-primary/20 text-primary"><Check className="w-3 h-3" strokeWidth={3} /></div> : <div className="p-0.5 rounded-full bg-slate-500/20 text-slate-500"><XIcon className="w-3 h-3" strokeWidth={3} /></div>}
                        <span className={features.roadmap ? 'text-[var(--page-fg)]' : 'text-muted-foreground'}>Roadmaps</span>
                      </li>
                      <li className="flex items-center gap-3 text-slate-300">
                        {features.agenda ? <div className="p-0.5 rounded-full bg-primary/20 text-primary"><Check className="w-3 h-3" strokeWidth={3} /></div> : <div className="p-0.5 rounded-full bg-slate-500/20 text-slate-500"><XIcon className="w-3 h-3" strokeWidth={3} /></div>}
                        <span className={features.agenda ? 'text-[var(--page-fg)]' : 'text-muted-foreground'}>Agenda Pro (Heatmap & Backlog)</span>
                      </li>
                      <li className="flex items-center gap-3 text-slate-300">
                        {features.comparisons ? <div className="p-0.5 rounded-full bg-primary/20 text-primary"><Check className="w-3 h-3" strokeWidth={3} /></div> : <div className="p-0.5 rounded-full bg-slate-500/20 text-slate-500"><XIcon className="w-3 h-3" strokeWidth={3} /></div>}
                        <span className={features.comparisons ? 'text-[var(--page-fg)]' : 'text-muted-foreground'}>Comparatifs</span>
                      </li>
                      <li className="flex items-center gap-3 text-slate-300">
                        {features.interviews ? <div className="p-0.5 rounded-full bg-primary/20 text-primary"><Check className="w-3 h-3" strokeWidth={3} /></div> : <div className="p-0.5 rounded-full bg-slate-500/20 text-slate-500"><XIcon className="w-3 h-3" strokeWidth={3} /></div>}
                        <span className={features.interviews ? 'text-[var(--page-fg)]' : 'text-muted-foreground'}>Simulateur & Quiz</span>
                      </li>
                      <li className="flex items-center gap-3 text-slate-300">
                        {features.chatHistory ? <div className="p-0.5 rounded-full bg-primary/20 text-primary"><Check className="w-3 h-3" strokeWidth={3} /></div> : <div className="p-0.5 rounded-full bg-slate-500/20 text-slate-500"><XIcon className="w-3 h-3" strokeWidth={3} /></div>}
                        <span className={features.chatHistory ? 'text-[var(--page-fg)]' : 'text-muted-foreground'}>Historique des discussions IA</span>
                      </li>
                      <li className="flex items-center gap-3 text-slate-300">
                        <div className="p-0.5 rounded-full bg-blue-500/20 text-blue-400"><Check className="w-3 h-3" strokeWidth={3} /></div>
                        <span className="font-medium text-white">{features.articles === -1 ? 'Illimités' : (features.articles || '0')}</span> Articles autorisés
                      </li>
                      <li className="flex items-center gap-3 text-slate-300">
                        <div className="p-0.5 rounded-full bg-blue-500/20 text-blue-400"><Check className="w-3 h-3" strokeWidth={3} /></div>
                        <span className="font-medium text-white">{features.tasks === -1 ? 'Illimitées' : (features.tasks || '0')}</span> Tâches autorisées
                      </li>
                      <li className="flex items-center gap-3 text-slate-300">
                        <div className="p-0.5 rounded-full bg-blue-500/20 text-blue-400"><Check className="w-3 h-3" strokeWidth={3} /></div>
                        <span className="font-medium text-white">{features.resources === -1 ? 'Illimitées' : (features.resources || '0')}</span> Ressources autorisées
                      </li>
                    </ul>
                  </div>

                  {canEditPlans && (
                    <div className="flex items-center gap-2 mt-auto pt-4 border-t border-[var(--glass-border)]">
                      {canEditPlans && (
                        <div className="flex-1">
                          <CreatePlanDialog
                            initialData={plan as any}
                            triggerLabel={plan.stripeMonthlyPriceId ? "Gérer l'Offre & Trial" : (plan.monthlyPrice === 0 ? "Configurer le Pack Gratuit" : "Modifier le Plan")}
                            triggerVariant="outline"
                          />
                        </div>
                      )}

                      {(!plan.stripeMonthlyPriceId && !plan.stripeYearlyPriceId) && (
                        <DeletePlanButton
                          planId={plan.id}
                          planName={plan.name}
                          hasSubscriptions={plan._count.subscriptions > 0}
                        />
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/*
          ─────────────────────────────────────────────────────────────
          SECTION: CODES PROMO
          ─────────────────────────────────────────────────────────────
        */}
        <div className="animate-slide-up-fade" style={{ animationDelay: '200ms' }}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-[var(--page-fg)] flex items-center gap-2">
                <Tag className="w-5 h-5 text-primary" />
                Codes Promotionnels
              </h2>
              <p className="text-sm text-muted-foreground mt-1">Créez des remises pour vos campagnes de conversion.</p>
            </div>
            {canEditPromos && (
              <a href="https://dashboard.stripe.com/coupons" target="_blank" rel="noopener noreferrer">
                <Button variant="outline" className="gap-2">
                  <Tag className="w-4 h-4" />
                  Gérer sur Stripe
                </Button>
              </a>
            )}
          </div>

          <div className="rounded-2xl border border-[var(--glass-border)] bg-[var(--card-bg)] shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="premium-table">
                <thead>
                  <tr>
                    <th className="w-[20%]">Code Promo</th>
                    <th>Valeur de la Remise</th>
                    <th>Restriction</th>
                    <th className="w-[30%] text-center">Utilisations (Jauge)</th>
                    <th className="text-right">Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {promos.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-12 text-muted-foreground italic">
                        Aucun code promotionnel actif.
                      </td>
                    </tr>
                  ) : promos.map((promo: any) => {
                    const maxUsesInt = promo.maxUses ? parseInt(promo.maxUses) : null
                    const percentUsed = maxUsesInt && maxUsesInt > 0 ? Math.min(100, (promo.usedCount / maxUsesInt) * 100) : 0

                    let bgProgress = 'bg-primary'
                    if (percentUsed >= 90) bgProgress = 'bg-red-500'
                    else if (percentUsed >= 50) bgProgress = 'bg-amber-500'

                    return (
                      <tr key={promo.id} className="group">
                        <td>
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-primary/10 text-primary border border-primary/20">
                              <Tag className="w-4 h-4" />
                            </div>
                            <span className="font-mono font-bold tracking-widest text-[var(--page-fg)]">{promo.code}</span>
                          </div>
                        </td>
                        <td>
                          <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-md text-sm font-bold bg-primary/10 text-primary border border-primary/20 shadow-sm">
                            {promo.discountType === 'percentage' ? `-${promo.discountValue}%` : `-${formatPrice(promo.discountValue)}`}
                          </span>
                        </td>
                        <td>
                          <span className="text-sm font-medium text-slate-300 bg-[rgba(255,255,255,0.03)] px-2.5 py-1 rounded-md border border-[var(--glass-border)]">
                            {promo.plan ? `Plan ${promo.plan.name}` : 'Globale'}
                          </span>
                        </td>
                        <td>
                          <div className="flex flex-col gap-2 max-w-[200px] mx-auto">
                            <div className="flex items-center justify-between text-xs font-mono">
                              <span className="text-white">{promo.usedCount}</span>
                              <span className="text-muted-foreground">/ {maxUsesInt ? maxUsesInt : 'Illimité'}</span>
                            </div>
                            {maxUsesInt ? (
                              <div className="h-2 w-full bg-[rgba(255,255,255,0.05)] rounded-full overflow-hidden shadow-inner">
                                <div className={`h-full ${bgProgress} rounded-full transition-all duration-500`} style={{ width: `${percentUsed}%` }}></div>
                              </div>
                            ) : (
                              <div className="h-2 w-full bg-[rgba(255,255,255,0.02)] rounded-full overflow-hidden flex items-center justify-center">
                                <span className="text-[8px] uppercase tracking-widest text-muted-foreground font-bold">Sans Limite</span>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="text-right">
                          <div className="flex justify-end gap-2">
                            <Badge variant="outline" className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${promo.isActive ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                              {promo.isActive ? 'ACTIF' : 'INACTIF'}
                            </Badge>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
