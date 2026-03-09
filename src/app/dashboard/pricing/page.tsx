import { CreditCard, Tag, Check, X as XIcon, Edit, Trash2, Zap, LayoutGrid, Rocket, Info, ExternalLink } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { getPlans, getPromotions } from '@/features/pricing/actions/pricing.actions'
import { syncAllPlansFromProvider } from '@/features/pricing/actions/sync.actions'
import { CreatePlanDialog } from '@/features/pricing/components/CreatePlanDialog'
import { SyncProviderButton } from '@/features/pricing/components/SyncProviderButton'
import { DeletePlanButton } from '@/features/pricing/components/DeletePlanButton'
import { PricingTabs } from '@/features/pricing/components/PricingTabs'
import { CreatePromoDialog } from '@/features/pricing/components/CreatePromoDialog'
import { DeletePromoButton } from '@/features/pricing/components/DeletePromoButton'
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
  mindmaps: number
  roadmap: number
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
  const provider = process.env.PAYMENT_PROVIDER || 'stripe'
  const providerName = provider.charAt(0).toUpperCase() + provider.slice(1)

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
                  <SyncProviderButton providerName={providerName} />
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

          <PricingTabs plans={plans} canEditPlans={canEditPlans} t={t} providerName={providerName} />
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
              <p className="text-sm text-muted-foreground mt-1">
                Créez des remises via <span className="font-semibold text-[var(--page-fg)]">{providerName}</span> pour vos campagnes de conversion.
              </p>
            </div>
            {canEditPromos && (
              <div className="flex items-center gap-2">
                {/* Lien vers le dashboard du provider actif */}
                <a
                  href={provider === 'paddle'
                    ? 'https://sandbox-vendors.paddle.com/discounts'
                    : 'https://dashboard.stripe.com/coupons'}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-[var(--page-fg)]">
                    <ExternalLink className="w-3.5 h-3.5" />
                    Dashboard {providerName}
                  </Button>
                </a>
                <CreatePromoDialog plans={plans.map((p: any) => ({ id: p.id, name: p.name }))} />
              </div>
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
                          <div className="flex justify-end items-center gap-2">
                            <Badge variant="outline" className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${promo.isActive ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                              {promo.isActive ? 'ACTIF' : 'INACTIF'}
                            </Badge>
                            {canEditPromos && (
                              <DeletePromoButton promoId={promo.id} promoCode={promo.code} />
                            )}
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
