import { CreditCard, Tag, Check, X as XIcon, Edit, Trash2, Zap, LayoutGrid, Rocket, Info } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { getPlans, getPromotions, PlanFeatures } from '@/features/pricing/actions/pricing.actions'
import { CreatePlanDialog } from '@/features/pricing/components/CreatePlanDialog'
import { CreatePromoDialog } from '@/features/pricing/components/CreatePromoDialog'
import { PageHero } from '@/components/ui/PageHero'
import { Button } from '@/components/ui/button'
import { cookies } from 'next/headers'
import { getT, type Locale } from '@/lib/i18n'
import { getSession } from '@/lib/session'
import { hasPermission, type AdminRole } from '@/lib/permissions'

export default async function PricingPage() {
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
            {canEditPlans && <CreatePlanDialog />}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {plans.map((plan: any, idx: number) => {
              const features = plan.features as PlanFeatures
              const isPopular = plan.name.toLowerCase().includes('pro')
              const priceLabel = formatPrice(plan.price)

              return (
                <div key={plan.id} className="group relative flex flex-col p-6 rounded-2xl bg-[var(--card-bg)] border transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                  style={{
                    borderColor: isPopular ? 'rgba(139,92,246,0.3)' : 'var(--glass-border)',
                    boxShadow: isPopular ? '0 10px 40px -10px rgba(139,92,246,0.15)' : 'none'
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
                        {plan.price > 0 && <span className="text-sm font-medium text-muted-foreground">/{plan.interval === 'month' ? 'mois' : 'an'}</span>}
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
                        <span className="font-medium text-white">{features.storage ? (features.storage / 1073741824).toFixed(0) : '0'} GB</span> d'espace de stockage
                      </li>
                      <li className="flex items-center gap-3 text-slate-300">
                        {features.companion ? <div className="p-0.5 rounded-full bg-primary/20 text-primary"><Check className="w-3 h-3" strokeWidth={3} /></div> : <div className="p-0.5 rounded-full bg-slate-500/20 text-slate-500"><XIcon className="w-3 h-3" strokeWidth={3} /></div>}
                        <span className={features.companion ? 'text-[var(--page-fg)]' : 'text-muted-foreground'}>IA Companion</span>
                      </li>
                      <li className="flex items-center gap-3 text-slate-300">
                        {features.courses ? <div className="p-0.5 rounded-full bg-primary/20 text-primary"><Check className="w-3 h-3" strokeWidth={3} /></div> : <div className="p-0.5 rounded-full bg-slate-500/20 text-slate-500"><XIcon className="w-3 h-3" strokeWidth={3} /></div>}
                        <span className={features.courses ? 'text-[var(--page-fg)]' : 'text-muted-foreground'}>Accès illimité aux cours</span>
                      </li>
                      <li className="flex items-center gap-3 text-slate-300">
                        {features.interviews ? <div className="p-0.5 rounded-full bg-primary/20 text-primary"><Check className="w-3 h-3" strokeWidth={3} /></div> : <div className="p-0.5 rounded-full bg-slate-500/20 text-slate-500"><XIcon className="w-3 h-3" strokeWidth={3} /></div>}
                        <span className={features.interviews ? 'text-[var(--page-fg)]' : 'text-muted-foreground'}>Simulateur d'entretiens</span>
                      </li>
                    </ul>
                  </div>

                  {canEditPlans && <CreatePlanDialog initialData={plan} />}
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
            {canEditPromos && <CreatePromoDialog plans={plans.map((p: any) => ({ id: p.id, name: p.name }))} />}
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
                            {canEditPromos && (
                              <Button size="icon" variant="outline" className="h-8 w-8 bg-transparent border-transparent text-muted-foreground hover:text-red-400 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            )}
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
