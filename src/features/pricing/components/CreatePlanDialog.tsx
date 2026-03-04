'use client'

import { useState, useTransition, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Plus, CreditCard, Save, X, LayoutDashboard, BrainCircuit, HardDrive, GraduationCap, Edit, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useT } from '@/lib/i18n/locale-context'

export function CreatePlanDialog({ initialData }: CreatePlanDialogProps) {
    const t = useT()
    const [isOpen, setIsOpen] = useState(false)
    const [pending, startTransition] = useTransition()
    const [error, setError] = useState<string | null>(null)

    const [formData, setFormData] = useState<PlanData>({
        name: initialData?.name || '',
        slug: initialData?.slug || '',
        price: initialData?.price || 0,
        interval: initialData?.interval || 'month',
        isActive: initialData?.isActive ?? true,
        sortOrder: initialData?.sortOrder || 0,
        features: {
            ...DEFAULT_FEATURES,
            ...(initialData?.features || {})
        },
    })

    // Reset form when initialData changes or modal opens
    useEffect(() => {
        if (isOpen && initialData) {
            setFormData({
                name: initialData.name || '',
                slug: initialData.slug || '',
                price: initialData.price || 0,
                interval: initialData.interval || 'month',
                isActive: initialData.isActive ?? true,
                sortOrder: initialData.sortOrder || 0,
                features: {
                    ...DEFAULT_FEATURES,
                    ...(initialData.features || {})
                }
            })
        } else if (isOpen && !initialData) {
            setFormData({
                name: '',
                slug: '',
                price: 0,
                interval: 'month',
                isActive: true,
                sortOrder: 0,
                features: DEFAULT_FEATURES
            })
        }
    }, [isOpen, initialData])

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setError(null)

        startTransition(async () => {
            const res = initialData
                ? await updatePlan(initialData.id, formData)
                : await createPlan(formData)
            if (res.success) {
                setIsOpen(false)
            } else {
                setError(res.error || (locale === 'fr' ? 'Erreur inconnue' : 'Unknown error'))
            }
        })
    }

    function updateFeature(key: keyof PlanData['features'], value: number | boolean) {
        setFormData(prev => ({
            ...prev,
            features: { ...prev.features, [key]: value },
        }))
    }

    // Si fermé, n'affiche que le bouton d'ouverture
    if (!isOpen) {
        if (initialData) {
            return (
                <Button variant="outline" className="w-full mt-auto bg-[rgba(255,255,255,0.02)] border-[var(--chrome-border)] hover:bg-primary/10 hover:border-primary/30 hover:text-primary transition-colors" onClick={() => setIsOpen(true)}>
                    <Edit className="w-4 h-4 mr-2" />
                    {t.pricing.plans.edit}
                </Button>
            )
        }
        return (
            <Button onClick={() => setIsOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                {t.pricing.plans.new}
            </Button>
        )
    }

    // Sinon, affiche la modal (overlay plein écran avec style panel)
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
                            <CreditCard className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold tracking-tight">{initialData ? t.pricing.plans.dialog.titleEdit : t.pricing.plans.dialog.titleNew}</h2>
                            <p className="text-[11px] text-muted-foreground uppercase tracking-widest font-semibold opacity-70">{t.pricing.plans.dialog.subtitle}</p>
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
                    <form id="plan-form" onSubmit={handleSubmit} className="space-y-10">
                        {error && (
                            <div className="p-4 text-xs font-semibold rounded-xl bg-destructive/10 text-destructive border border-destructive/20 flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-destructive animate-pulse" />
                                {error}
                            </div>
                        )}

                        {/* Infos générales */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">{t.pricing.plans.dialog.general}</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">{t.pricing.plans.dialog.name}</label>
                                    <Input
                                        required
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                                        placeholder="ex: Pro, Enterprise..."
                                        className="settings-input"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">{t.pricing.plans.dialog.slug}</label>
                                    <Input
                                        required
                                        value={formData.slug}
                                        onChange={e => setFormData({ ...formData, slug: e.target.value })}
                                        placeholder="pro-monthly"
                                        className="settings-input font-mono text-sm"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">{t.pricing.plans.dialog.price}</label>
                                    <Input
                                        required
                                        type="number"
                                        min={0}
                                        value={formData.price}
                                        onChange={e => setFormData({ ...formData, price: parseInt(e.target.value) || 0 })}
                                        placeholder="2900 pour 29€"
                                        className="settings-input font-mono"
                                    />
                                    <p className="text-xs text-muted-foreground">{formData.price / 100} €</p>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground ml-1">{t.pricing.plans.dialog.interval}</label>
                                    <div className="relative group">
                                        <select
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all appearance-none cursor-pointer"
                                            value={formData.interval}
                                            onChange={e => setFormData({ ...formData, interval: e.target.value })}
                                        >
                                            <option value="month" className="bg-slate-900">{t.pricing.plans.dialog.monthly}</option>
                                            <option value="year" className="bg-slate-900">{t.pricing.plans.dialog.annual}</option>
                                        </select>
                                        <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-muted-foreground group-focus-within:text-primary transition-colors">
                                            <ChevronDown className="h-4 w-4" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Limites d'usage */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">{t.pricing.plans.dialog.limits}</h3>
                            <div className="flex flex-col gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium flex items-center gap-2">
                                        <LayoutDashboard className="w-4 h-4 text-muted-foreground" />
                                        {t.pricing.plans.dialog.techWatches}
                                    </label>
                                    <Input
                                        required
                                        type="number"
                                        value={formData.features.techWatches}
                                        onChange={e => updateFeature('techWatches', parseInt(e.target.value))}
                                        className="settings-input"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium flex items-center gap-2">
                                        <HardDrive className="w-4 h-4 text-muted-foreground" />
                                        {t.pricing.plans.dialog.storage}
                                    </label>
                                    <Input
                                        required
                                        type="number"
                                        min={0.1}
                                        step={0.1}
                                        value={formData.features.storage / 1073741824}
                                        onChange={e => updateFeature('storage', (parseFloat(e.target.value) || 0) * 1073741824)}
                                        className="settings-input"
                                    />
                                </div>
                                <div className="space-y-2 col-span-2">
                                    <label className="text-sm font-medium">{t.pricing.plans.dialog.notes}</label>
                                    <Input
                                        required
                                        type="number"
                                        value={formData.features.notes}
                                        onChange={e => updateFeature('notes', parseInt(e.target.value))}
                                        className="settings-input"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Features (Toggles) */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">{t.pricing.plans.dialog.features}</h3>
                            <div className="flex flex-col gap-4">

                                <label className="flex items-start gap-3 p-4 rounded-lg border border-border bg-muted/30 cursor-pointer hover:bg-muted/50 transition-colors">
                                    <input
                                        type="checkbox"
                                        className="mt-1 w-4 h-4 rounded border-border text-primary focus:ring-primary"
                                        checked={!!formData.features.companion}
                                        onChange={e => updateFeature('companion', e.target.checked)}
                                    />
                                    <div>
                                        <div className="text-sm font-medium flex items-center gap-2">
                                            <BrainCircuit className="w-4 h-4 text-purple-500" />
                                            {t.pricing.plans.dialog.companion}
                                        </div>
                                        <div className="text-xs text-muted-foreground mt-1">{t.pricing.plans.dialog.companionDesc}</div>
                                    </div>
                                </label>

                                <label className="flex items-start gap-3 p-4 rounded-lg border border-border bg-muted/30 cursor-pointer hover:bg-muted/50 transition-colors">
                                    <input
                                        type="checkbox"
                                        className="mt-1 w-4 h-4 rounded border-border text-primary focus:ring-primary"
                                        checked={!!formData.features.courses}
                                        onChange={e => updateFeature('courses', e.target.checked)}
                                    />
                                    <div>
                                        <div className="text-sm font-medium flex items-center gap-2">
                                            <GraduationCap className="w-4 h-4 text-primary" />
                                            {t.pricing.plans.dialog.courses}
                                        </div>
                                        <div className="text-xs text-muted-foreground mt-1">{t.pricing.plans.dialog.coursesDesc}</div>
                                    </div>
                                </label>

                                <label className="flex items-start gap-3 p-4 rounded-lg border border-border bg-muted/30 cursor-pointer hover:bg-muted/50 transition-colors">
                                    <input
                                        type="checkbox"
                                        className="mt-1 w-4 h-4 rounded border-border text-primary focus:ring-primary"
                                        checked={!!formData.features.interviews}
                                        onChange={e => updateFeature('interviews', e.target.checked)}
                                    />
                                    <div>
                                        <div className="text-sm font-medium flex items-center gap-2">
                                            <BrainCircuit className="w-4 h-4 text-emerald-500" />
                                            {t.pricing.plans.dialog.interviews}
                                        </div>
                                        <div className="text-xs text-muted-foreground mt-1">{t.pricing.plans.dialog.interviewsDesc}</div>
                                    </div>
                                </label>

                                <label className="flex items-start gap-3 p-4 rounded-lg border border-border bg-muted/30 cursor-pointer hover:bg-muted/50 transition-colors">
                                    <input
                                        type="checkbox"
                                        className="mt-1 w-4 h-4 rounded border-border text-primary focus:ring-primary"
                                        checked={!!formData.features.aiTools}
                                        onChange={e => updateFeature('aiTools', e.target.checked)}
                                    />
                                    <div>
                                        <div className="text-sm font-bold">{t.pricing.plans.dialog.aiTools}</div>
                                        <div className="text-xs text-muted-foreground mt-1 opacity-70 italic font-medium">{t.pricing.plans.dialog.comingSoon}</div>
                                    </div>
                                </label>

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
                        form="plan-form"
                        disabled={pending}
                        className="rounded-xl px-8 shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                    >
                        <Save className="w-4 h-4 mr-2" />
                        {pending ? t.actions.loading : (initialData ? t.actions.update : t.actions.create)}
                    </Button>
                </div>
            </div>
        </div>,
        document.body
    )
}

