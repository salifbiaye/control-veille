'use client'

import { useState } from 'react'
import { LayoutGrid, Database, CreditCard } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Check, X as XIcon, Trash2 } from 'lucide-react'
import { CreatePlanDialog } from '@/features/pricing/components/CreatePlanDialog'
import { DeletePlanButton } from '@/features/pricing/components/DeletePlanButton'
import { PlanFeatures } from '@/app/dashboard/pricing/page'

interface PricingTabsProps {
    plans: any[]
    canEditPlans: boolean
    t: any
    providerName?: string
}

export function PricingTabs({ plans, canEditPlans, t, providerName = 'Stripe' }: PricingTabsProps) {
    const [activeTab, setActiveTab] = useState<'provider' | 'manual'>('provider')

    const providerPlans = plans.filter(p => p.stripeMonthlyPriceId || p.stripeYearlyPriceId || p.paddlePriceIdMonthly || p.paddlePriceIdYearly)
    const manualPlans = plans.filter(p => !p.stripeMonthlyPriceId && !p.stripeYearlyPriceId && !p.paddlePriceIdMonthly && !p.paddlePriceIdYearly)

    const displayedPlans = activeTab === 'provider' ? providerPlans : manualPlans

    const formatPrice = (price: number) => {
        if (price === 0) return t.pricing.plans.free
        return `${(price / 100).toFixed(2)}€`
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--glass-border)] pb-4">
                <div className="flex items-center gap-1 p-1 bg-[rgba(255,255,255,0.03)] dark:bg-[rgba(255,255,255,0.03)] bg-slate-100/50 rounded-xl border border-[var(--glass-border)] self-start">
                    <button
                        onClick={() => setActiveTab('provider')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'provider'
                            ? 'bg-primary text-white shadow-lg'
                            : 'text-muted-foreground hover:text-[var(--page-fg)] hover:bg-[rgba(0,0,0,0.05)] dark:hover:bg-[rgba(255,255,255,0.05)] dark:hover:text-white'
                            }`}
                    >
                        <CreditCard className="w-4 h-4" />
                        {providerName}
                        <Badge variant="outline" className={`ml-1 px-1.5 py-0 h-5 border-0 ${activeTab === 'provider' ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-white/5 text-muted-foreground'}`}>
                            {providerPlans.length}
                        </Badge>
                    </button>
                    <button
                        onClick={() => setActiveTab('manual')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'manual'
                            ? 'bg-primary text-white shadow-lg'
                            : 'text-muted-foreground hover:text-[var(--page-fg)] hover:bg-[rgba(0,0,0,0.05)] dark:hover:bg-[rgba(255,255,255,0.05)] dark:hover:text-white'
                            }`}
                    >
                        <Database className="w-4 h-4" />
                        {t.pricing.plans.tabs.manualLabel}
                        <Badge variant="outline" className={`ml-1 px-1.5 py-0 h-5 border-0 ${activeTab === 'manual' ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-white/5 text-muted-foreground'}`}>
                            {manualPlans.length}
                        </Badge>
                    </button>
                </div>

                <div className="flex items-center gap-2">
                    <p className="text-xs text-muted-foreground">
                        {activeTab === 'provider'
                            ? t.pricing.plans.tabs.providerDesc
                            : t.pricing.plans.tabs.manualDesc}
                    </p>
                </div>
            </div>

            {displayedPlans.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center bg-[var(--card-bg)] rounded-2xl border border-[var(--glass-border)] border-dashed">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                        {activeTab === 'provider' ? <CreditCard className="w-8 h-8 text-primary" /> : <Database className="w-8 h-8 text-primary" />}
                    </div>
                    <h3 className="text-lg font-semibold text-white">{t.pricing.plans.noneFound}</h3>
                    <p className="text-sm text-muted-foreground max-w-xs mt-2">
                        {activeTab === 'provider'
                            ? t.pricing.plans.noneProviderDesc
                            : t.pricing.plans.noneManualDesc}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {displayedPlans.map((plan: any) => {
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
                                        {t.pricing.plans.popular}
                                    </div>
                                )}

                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="text-xl font-bold text-[var(--page-fg)]">{plan.name}</h3>
                                        <div className="flex items-baseline gap-1 mt-2">
                                            <span className="text-3xl font-extrabold tracking-tight text-white">{priceLabel}</span>
                                            {plan.monthlyPrice > 0 && <span className="text-sm font-medium text-muted-foreground">{t.pricing.plans.perMonth} | {yearlyPriceLabel}{t.pricing.plans.perYear}</span>}
                                        </div>
                                    </div>

                                    <Badge variant="outline" className={`border ${plan.isActive ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-slate-500/10 text-slate-400 border-slate-500/20'} px-2 py-0.5 rounded-full text-[10px] font-bold`}>
                                        {plan.isActive ? t.pricing.plans.active : t.pricing.plans.inactive}
                                    </Badge>
                                </div>

                                <p className="text-sm text-muted-foreground mb-6 line-clamp-2">
                                    {plan.description || t.pricing.plans.noDescription}
                                </p>

                                <div className="flex-1 space-y-3 mb-8">
                                    <div className="flex items-start gap-3 justify-center border-b border-[var(--glass-border)] pb-3 mb-3">
                                        <div className="text-center">
                                            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{t.pricing.plans.subscribers}</p>
                                            <p className="text-2xl font-bold text-primary">{plan._count.subscriptions}</p>
                                        </div>
                                    </div>

                                    <ul className="space-y-2.5 text-sm">
                                        <li className="flex items-center gap-3 text-slate-300">
                                            <div className="p-0.5 rounded-full bg-emerald-500/20 text-emerald-400"><Check className="w-3 h-3" strokeWidth={3} /></div>
                                            <span className="font-medium text-white">{features.techWatches === -1 ? t.pricing.plans.unlimited : (features.techWatches || '0')}</span> TechWatches
                                        </li>
                                        {/* ... other features ... */}
                                        <li className="flex items-center gap-3 text-slate-300">
                                            <div className="p-0.5 rounded-full bg-emerald-500/20 text-emerald-400"><Check className="w-3 h-3" strokeWidth={3} /></div>
                                            <span className="font-medium text-white">{features.notes === -1 ? t.pricing.plans.unlimitedF : (features.notes || '0')}</span> Notes
                                        </li>
                                        <li className="flex items-center gap-3 text-slate-300">
                                            <div className="p-0.5 rounded-full bg-emerald-500/20 text-emerald-400"><Check className="w-3 h-3" strokeWidth={3} /></div>
                                            <span className="font-medium text-white">{features.storage && features.storage >= 1073741824 ? (features.storage / 1073741824).toFixed(0) : (features.storage ? (features.storage / 1048576).toFixed(0) : '0')} {features.storage && features.storage >= 1073741824 ? 'GB' : 'MB'}</span> {t.pricing.plans.features.storage}
                                        </li>
                                        <li className="flex items-center gap-3 text-slate-300">
                                            {features.companion ? <div className="p-0.5 rounded-full bg-primary/20 text-primary"><Check className="w-3 h-3" strokeWidth={3} /></div> : <div className="p-0.5 rounded-full bg-slate-500/20 text-slate-500"><XIcon className="w-3 h-3" strokeWidth={3} /></div>}
                                            <span className={features.companion ? 'text-[var(--page-fg)]' : 'text-muted-foreground'}>{t.pricing.plans.features.companion}</span>
                                        </li>
                                        {/* Simplified features for brevity here, I'll copy the full list from page.tsx */}
                                        <li className="flex items-center gap-3 text-slate-300">
                                            {features.courses ? <div className="p-0.5 rounded-full bg-primary/20 text-primary"><Check className="w-3 h-3" strokeWidth={3} /></div> : <div className="p-0.5 rounded-full bg-slate-500/20 text-slate-500"><XIcon className="w-3 h-3" strokeWidth={3} /></div>}
                                            <span className={features.courses ? 'text-[var(--page-fg)]' : 'text-muted-foreground'}>{features.courses === -1 ? t.pricing.plans.unlimitedF : (Number(features.courses) > 0 ? `${features.courses} Cours` : '0 Cours')}</span>
                                        </li>
                                        <li className="flex items-center gap-3 text-slate-300">
                                            {(Number(features.mindmaps) > 0) ? <div className="p-0.5 rounded-full bg-primary/20 text-primary"><Check className="w-3 h-3" strokeWidth={3} /></div> : <div className="p-0.5 rounded-full bg-slate-500/20 text-slate-500"><XIcon className="w-3 h-3" strokeWidth={3} /></div>}
                                            <span className={Number(features.mindmaps) > 0 ? 'text-[var(--page-fg)]' : 'text-muted-foreground'}>
                                                {Number(features.mindmaps) === -1 ? t.pricing.plans.unlimitedF : Number(features.mindmaps) > 0 ? `${features.mindmaps} Mindmap(s)` : '0 Mindmaps'}
                                            </span>
                                        </li>
                                        <li className="flex items-center gap-3 text-slate-300">
                                            {(Number(features.roadmap) > 0) ? <div className="p-0.5 rounded-full bg-primary/20 text-primary"><Check className="w-3 h-3" strokeWidth={3} /></div> : <div className="p-0.5 rounded-full bg-slate-500/20 text-slate-500"><XIcon className="w-3 h-3" strokeWidth={3} /></div>}
                                            <span className={Number(features.roadmap) > 0 ? 'text-[var(--page-fg)]' : 'text-muted-foreground'}>
                                                {Number(features.roadmap) === -1 ? t.pricing.plans.unlimited : Number(features.roadmap) > 0 ? `${features.roadmap} Roadmap(s)` : '0 Roadmaps'}
                                            </span>
                                        </li>
                                        <li className="flex items-center gap-3 text-slate-300">
                                            {features.agenda ? <div className="p-0.5 rounded-full bg-primary/20 text-primary"><Check className="w-3 h-3" strokeWidth={3} /></div> : <div className="p-0.5 rounded-full bg-slate-500/20 text-slate-500"><XIcon className="w-3 h-3" strokeWidth={3} /></div>}
                                            <span className={features.agenda ? 'text-[var(--page-fg)]' : 'text-muted-foreground'}>{t.pricing.plans.features.agenda}</span>
                                        </li>
                                        <li className="flex items-center gap-3 text-slate-300">
                                            {features.comparisons ? <div className="p-0.5 rounded-full bg-primary/20 text-primary"><Check className="w-3 h-3" strokeWidth={3} /></div> : <div className="p-0.5 rounded-full bg-slate-500/20 text-slate-500"><XIcon className="w-3 h-3" strokeWidth={3} /></div>}
                                            <span className={features.comparisons ? 'text-[var(--page-fg)]' : 'text-muted-foreground'}>{t.pricing.plans.features.comparisons}</span>
                                        </li>
                                        <li className="flex items-center gap-3 text-slate-300">
                                            {features.interviews ? <div className="p-0.5 rounded-full bg-primary/20 text-primary"><Check className="w-3 h-3" strokeWidth={3} /></div> : <div className="p-0.5 rounded-full bg-slate-500/20 text-slate-500"><XIcon className="w-3 h-3" strokeWidth={3} /></div>}
                                            <span className={features.interviews ? 'text-[var(--page-fg)]' : 'text-muted-foreground'}>{t.pricing.plans.features.interviews}</span>
                                        </li>
                                        <li className="flex items-center gap-3 text-slate-300">
                                            {features.chatHistory ? <div className="p-0.5 rounded-full bg-primary/20 text-primary"><Check className="w-3 h-3" strokeWidth={3} /></div> : <div className="p-0.5 rounded-full bg-slate-500/20 text-slate-500"><XIcon className="w-3 h-3" strokeWidth={3} /></div>}
                                            <span className={features.chatHistory ? 'text-[var(--page-fg)]' : 'text-muted-foreground'}>{t.pricing.plans.features.chatHistory}</span>
                                        </li>
                                        <li className="flex items-center gap-3 text-slate-300">
                                            <div className="p-0.5 rounded-full bg-blue-500/20 text-blue-400"><Check className="w-3 h-3" strokeWidth={3} /></div>
                                            <span className="font-medium text-white">{features.articles === -1 ? t.pricing.plans.unlimited : (features.articles || '0')}</span> {t.pricing.plans.features.articles}
                                        </li>
                                        <li className="flex items-center gap-3 text-slate-300">
                                            <div className="p-0.5 rounded-full bg-blue-500/20 text-blue-400"><Check className="w-3 h-3" strokeWidth={3} /></div>
                                            <span className="font-medium text-white">{features.tasks === -1 ? t.pricing.plans.unlimitedF : (features.tasks || '0')}</span> {t.pricing.plans.features.tasks}
                                        </li>
                                        <li className="flex items-center gap-3 text-slate-300">
                                            <div className="p-0.5 rounded-full bg-blue-500/20 text-blue-400"><Check className="w-3 h-3" strokeWidth={3} /></div>
                                            <span className="font-medium text-white">{features.resources === -1 ? t.pricing.plans.unlimitedF : (features.resources || '0')}</span> {t.pricing.plans.features.resources}
                                        </li>
                                    </ul>
                                </div>

                                {canEditPlans && (() => {
                                    const isStripePlan = !!plan.stripeMonthlyPriceId || !!plan.stripeYearlyPriceId
                                    const isPaddlePlan = !!plan.paddlePriceIdMonthly || !!plan.paddlePriceIdYearly

                                    return (
                                        <div className="flex items-center gap-2 mt-auto pt-4 border-t border-[var(--glass-border)]">
                                            {/* Stripe + Manual : bouton modifier */}
                                            {!isPaddlePlan && (
                                                <div className="flex-1">
                                                    <CreatePlanDialog
                                                        initialData={plan as any}
                                                        triggerLabel={isStripePlan ? t.pricing.plans.manageOffer : (plan.monthlyPrice === 0 ? t.pricing.plans.configureFree : t.pricing.plans.edit)}
                                                        triggerVariant="outline"
                                                    />
                                                </div>
                                            )}

                                            {/* Paddle : info à la place du bouton modifier */}
                                            {isPaddlePlan && (
                                                <p className="flex-1 text-xs text-muted-foreground">
                                                    {t.sidebar.managedInPaddle}
                                                </p>
                                            )}

                                            {/* Tous les plans : bouton supprimer */}
                                            <DeletePlanButton
                                                planId={plan.id}
                                                planName={plan.name}
                                                hasSubscriptions={plan._count.subscriptions > 0}
                                            />
                                        </div>
                                    )
                                })()}
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
