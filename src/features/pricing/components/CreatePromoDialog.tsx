'use client'

import { useState, useTransition } from 'react'
import { createPortal } from 'react-dom'
import { Plus, Tag, Save, X, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { createPromotion } from '@/features/pricing/actions/pricing.actions'
import type { PromotionData } from '@/features/pricing/actions/pricing.actions'

import { useT, useLocale } from '@/lib/i18n/locale-context'

export function CreatePromoDialog({ plans }: { plans: { id: string; name: string }[] }) {
    const t = useT()
    const { locale } = useLocale()
    const [isOpen, setIsOpen] = useState(false)
    const [pending, startTransition] = useTransition()
    const [error, setError] = useState<string | null>(null)

    const [formData, setFormData] = useState<PromotionData>({
        code: '',
        planId: null,
        discountType: 'percentage',
        discountValue: 20,
        maxUses: null,
        expiresAt: null,
        isActive: true,
    })

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setError(null)

        if (!formData.code) return setError(locale === 'fr' ? 'Code promo requis' : 'Promo code required')

        startTransition(async () => {
            const res = await createPromotion(formData)
            if (res.success) {
                setIsOpen(false)
            } else {
                setError(res.error || (locale === 'fr' ? 'Erreur inconnue' : 'Unknown error'))
            }
        })
    }

    if (!isOpen) {
        return (
            <Button variant="outline" onClick={() => setIsOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                {t.pricing.promos.new}
            </Button>
        )
    }

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex justify-end">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-background/60 backdrop-blur-md transition-opacity"
                style={{ animation: 'fadeIn 0.2s ease-out' }}
                onClick={() => !pending && setIsOpen(false)}
            />

            {/* Sheet */}
            <div
                className="relative w-full max-w-md h-full flex flex-col shadow-2xl overflow-hidden"
                style={{
                    background: 'var(--card-bg)',
                    borderLeft: '1px solid var(--glass-border)',
                    boxShadow: '-10px 0 40px rgba(0,0,0,0.3)',
                    animation: 'slideInRight 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                }}
            >
                <div className="flex items-center justify-between p-6 border-b border-border bg-card/50 backdrop-blur-sm z-10">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl" style={{ background: 'color-mix(in srgb, var(--brand) 15%, transparent)' }}>
                            <Tag className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold tracking-tight">{t.pricing.promos.dialog.title}</h2>
                            <p className="text-[11px] text-muted-foreground uppercase tracking-widest font-semibold opacity-70">{t.pricing.promos.dialog.subtitle}</p>
                        </div>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="rounded-full hover:bg-white/5"
                        onClick={() => setIsOpen(false)}
                        disabled={pending}
                    >
                        <X className="w-5 h-5" />
                    </Button>
                </div>

                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                    <form id="promo-form" onSubmit={handleSubmit} className="space-y-10">
                        {error && (
                            <div className="p-4 text-xs font-semibold rounded-xl bg-destructive/10 text-destructive border border-destructive/20 flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-destructive animate-pulse" />
                                {error}
                            </div>
                        )}

                        <div className="space-y-4">
                            <h3 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground ml-1">{t.pricing.promos.dialog.details}</h3>

                            <div className="space-y-2">
                                <label className="text-sm font-medium ml-1">{t.pricing.promos.dialog.code}</label>
                                <Input
                                    required
                                    value={formData.code}
                                    onChange={e => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                    placeholder="ex: LAUNCH20"
                                    className="settings-input font-mono uppercase h-11"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium ml-1">{t.pricing.promos.dialog.type}</label>
                                    <div className="relative group">
                                        <select
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all appearance-none cursor-pointer"
                                            value={formData.discountType}
                                            onChange={e => setFormData({ ...formData, discountType: e.target.value as 'percentage' | 'fixed' })}
                                        >
                                            <option value="percentage" className="bg-slate-900">{t.pricing.promos.dialog.percentage}</option>
                                            <option value="fixed" className="bg-slate-900">{t.pricing.promos.dialog.fixed}</option>
                                        </select>
                                        <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-muted-foreground group-focus-within:text-primary transition-colors">
                                            <ChevronDown className="h-4 w-4" />
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium ml-1">{t.pricing.promos.dialog.value} ({formData.discountType === 'percentage' ? '%' : '€'})</label>
                                    <Input
                                        required
                                        type="number"
                                        min={1}
                                        value={formData.discountValue}
                                        onChange={e => setFormData({ ...formData, discountValue: parseInt(e.target.value) || 0 })}
                                        className="settings-input font-mono h-11"
                                    />
                                    {formData.discountType === 'fixed' && (
                                        <p className="text-[10px] text-muted-foreground ml-1">{locale === 'fr' ? 'En centimes :' : 'In cents :'} {formData.discountValue} €</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground ml-1">{t.pricing.promos.dialog.restrictions}</h3>

                            <div className="space-y-2">
                                <label className="text-sm font-medium ml-1">{t.pricing.promos.dialog.planLabel}</label>
                                <div className="relative group">
                                    <select
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all appearance-none cursor-pointer"
                                        value={formData.planId || ''}
                                        onChange={e => setFormData({ ...formData, planId: e.target.value || null })}
                                    >
                                        <option value="" className="bg-slate-900">{t.pricing.promos.dialog.allPlans}</option>
                                        {plans.map(p => (
                                            <option key={p.id} value={p.id} className="bg-slate-900">{p.name}</option>
                                        ))}
                                    </select>
                                    <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-muted-foreground group-focus-within:text-primary transition-colors">
                                        <ChevronDown className="h-4 w-4" />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-muted-foreground ml-1">{t.pricing.promos.dialog.maxUses}</label>
                                    <Input
                                        type="number"
                                        min={1}
                                        value={formData.maxUses || ''}
                                        onChange={e => setFormData({ ...formData, maxUses: parseInt(e.target.value) || null })}
                                        placeholder="ex: 100"
                                        className="settings-input h-11"
                                    />
                                </div>
                            </div>
                        </div>

                    </form>
                </div>

                <div className="flex items-center justify-end gap-3 p-6 border-t border-border bg-card/50 backdrop-blur-sm z-10 mt-auto">
                    <Button variant="ghost" className="rounded-xl px-6" onClick={() => setIsOpen(false)} disabled={pending}>
                        {t.actions.cancel}
                    </Button>
                    <Button
                        type="submit"
                        form="promo-form"
                        disabled={pending}
                        className="rounded-xl px-8 shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                    >
                        <Save className="w-4 h-4 mr-2" />
                        {pending ? t.actions.loading : t.actions.create}
                    </Button>
                </div>
            </div>
        </div>,
        document.body
    )
}

