'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { ChevronLeft, ChevronRight, Receipt, Search, CreditCard } from 'lucide-react'
import type { SubscriptionDetails, PaginatedResult } from '@/features/subscriptions/actions/subscriptions.actions'
import { useT } from '@/lib/i18n/locale-context'

function getColorForInitial(initial: string) {
    const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4']
    const charCode = initial.charCodeAt(0) || 0
    return colors[charCode % colors.length]
}

function formatPrice(price: number, t: any) {
    if (price === 0) return t.subscriptions.table.free
    return `${(price / 100).toFixed(2)}€`
}

export function SubscriptionsClient({ initial }: { initial: PaginatedResult<SubscriptionDetails> }) {
    const t = useT()
    const { data: subscriptions, meta } = initial
    const [searchTerm, setSearchTerm] = useState('')

    const filtered = subscriptions.filter(sub => {
        if (!searchTerm) return true
        const search = searchTerm.toLowerCase()
        return (
            (sub.userName || '').toLowerCase().includes(search) ||
            (sub.userEmail || '').toLowerCase().includes(search) ||
            (sub.planName || '').toLowerCase().includes(search)
        )
    })

    return (
        <div className="space-y-4 animate-slide-up-fade">
            <div className="flex items-center gap-4 border-b border-[var(--glass-border)] pb-4">
                <div className="relative w-full max-w-sm group">
                    <Search
                        className="absolute left-4 top-1/2 -translate-y-1/2 
                        w-4 h-4 
                        text-muted-foreground 
                        transition-colors 
                        group-focus-within:text-primary 
                        pointer-events-none"
                    />
                    <input
                        type="text"
                        placeholder={t.subscriptions.search}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="
                            w-full
                            h-11
                            rounded-xl
                            bg-background/60
                            backdrop-blur-md
                            border border-[var(--glass-border)]
                            px-4
                            pl-12
                            text-sm
                            outline-none
                            focus:border-primary
                            focus:ring-2
                            focus:ring-primary/20
                            transition-all
                        "
                    />
                </div>
            </div>

            <div className="rounded-xl border border-[var(--glass-border)] bg-[var(--card-bg)] shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="premium-table">
                        <thead>
                            <tr>
                                <th className="w-[35%]">{t.subscriptions.table.subscriber}</th>
                                <th>{t.subscriptions.table.plan}</th>
                                <th>{t.subscriptions.table.price}</th>
                                <th>{t.subscriptions.table.status}</th>
                                <th className="text-right">{t.subscriptions.table.renewal}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="text-center py-12 text-muted-foreground italic">
                                        {t.subscriptions.table.empty}
                                    </td>
                                </tr>
                            ) : filtered.map((sub) => {
                                const initialStr = (sub.userName && sub.userName !== '—' ? sub.userName : sub.userEmail).charAt(0).toUpperCase()
                                const bgColor = getColorForInitial(initialStr)
                                const isPremium = sub.planName.toLowerCase().includes('pro') || sub.planName.toLowerCase().includes('team')

                                return (
                                    <tr key={sub.id} className="group">
                                        <td>
                                            <div className="flex items-center gap-3">
                                                <Avatar className={`h-9 w-9 border shadow-sm ${isPremium ? 'border-primary/50' : 'border-white/10'}`}>
                                                    <AvatarFallback className="text-sm font-bold text-white shadow-inner" style={{ backgroundColor: bgColor }}>
                                                        {initialStr}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <div className="font-medium text-[var(--page-fg)] flex items-center gap-2">
                                                        {sub.userName}
                                                        {isPremium && (
                                                            <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary shadow-primary" title="Abonné Premium"></span>
                                                        )}
                                                    </div>
                                                    <div className="text-xs text-muted-foreground">{sub.userEmail}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="flex items-center gap-2">
                                                <CreditCard className={`w-3.5 h-3.5 ${isPremium ? 'text-primary' : 'text-slate-400'}`} />
                                                <span className="font-semibold text-[var(--page-fg)]">{sub.planName}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="font-mono text-sm tracking-tight text-slate-300">
                                                {formatPrice(sub.planPrice, t)}
                                                {sub.planPrice > 0 && <span className="text-xs text-muted-foreground">/{sub.interval === 'month' ? (t.locale === 'fr' ? 'mois' : 'mo') : (t.locale === 'fr' ? 'an' : 'yr')}</span>}
                                            </div>
                                        </td>
                                        <td>
                                            {sub.status === 'active' ? (
                                                <Badge variant="outline" className="h-6 px-2.5 text-xs bg-emerald-500/10 text-emerald-400 border-emerald-500/20">{t.subscriptions.status.active}</Badge>
                                            ) : sub.status === 'canceled' ? (
                                                <Badge variant="outline" className="h-6 px-2.5 text-xs bg-slate-500/10 text-slate-400 border-slate-500/20">{t.subscriptions.status.canceled}</Badge>
                                            ) : (
                                                <Badge variant="outline" className="h-6 px-2.5 text-xs bg-amber-500/10 text-amber-500 border-amber-500/20">{(t.subscriptions.status as any)[sub.status] || sub.status}</Badge>
                                            )}
                                        </td>
                                        <td className="text-right">
                                            {sub.currentPeriodEnd ? (
                                                <div className="flex flex-col items-end">
                                                    <span className="text-sm text-[var(--page-fg)]">
                                                        {new Date(sub.currentPeriodEnd).toLocaleDateString(t.locale === 'fr' ? 'fr-FR' : 'en-US')}
                                                    </span>
                                                    {sub.status === 'canceled' && (
                                                        <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">{t.subscriptions.table.expires}</span>
                                                    )}
                                                </div>
                                            ) : (
                                                <span className="text-sm text-muted-foreground">—</span>
                                            )}
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {meta.totalPages > 1 && (
                    <div className="flex items-center justify-between px-5 py-4 border-t border-[var(--glass-border)] bg-[rgba(255,255,255,0.01)]">
                        <span className="text-sm text-muted-foreground font-medium">
                            {t.subscriptions.table.total.replace('{total}', meta.total.toString()).replace('{page}', meta.page.toString()).replace('{totalPages}', meta.totalPages.toString())}
                        </span>
                        <div className="flex gap-2">
                            <Link href={meta.page <= 1 ? '#' : `/dashboard/subscriptions?page=${meta.page - 1}`} passHref>
                                <Button variant="outline" size="icon" disabled={meta.page <= 1} className="h-8 w-8 bg-[var(--card-bg)] border-[var(--chrome-border)] hover:bg-slate-800">
                                    <ChevronLeft className="w-4 h-4" />
                                </Button>
                            </Link>
                            <Link href={meta.page >= meta.totalPages ? '#' : `/dashboard/subscriptions?page=${meta.page + 1}`} passHref>
                                <Button variant="outline" size="icon" disabled={meta.page >= meta.totalPages} className="h-8 w-8 bg-[var(--card-bg)] border-[var(--chrome-border)] hover:bg-slate-800">
                                    <ChevronRight className="w-4 h-4" />
                                </Button>
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
