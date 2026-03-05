'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { ChevronLeft, ChevronRight, Receipt, Search, CreditCard, MoreHorizontal, Eye, User, Banknote } from 'lucide-react'
import type { SubscriptionDetails, PaginatedResult } from '@/features/subscriptions/actions/subscriptions.actions'
import { refundSubscription } from '@/features/subscriptions/actions/subscriptions.actions'
import { useT, useLocale } from '@/lib/i18n/locale-context'
import { SubscriptionsActivityChart } from './SubscriptionsActivityChart'
import { getAnalyticsStats } from '@/features/analytics/actions/analytics.actions'
import { useEffect, useTransition } from 'react'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ConfirmModal } from '@/components/ui/ConfirmModal'

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
    const { locale } = useLocale()
    const [subscriptions, setSubscriptions] = useState(initial.data)
    const { meta } = initial
    const [searchTerm, setSearchTerm] = useState('')
    const [growthData, setGrowthData] = useState<any[]>([])
    const [isPending, startTransition] = useTransition()
    const [refundModal, setRefundModal] = useState<{ isOpen: boolean, subId: string | null }>({
        isOpen: false,
        subId: null
    })

    // Sync state if props change (e.g. following revalidatePath)
    useEffect(() => {
        setSubscriptions(initial.data)
    }, [initial.data])

    useEffect(() => {
        getAnalyticsStats().then((stats: any) => {
            setGrowthData(stats.subscriptionsGrowth || [])
        })
    }, [])

    function confirmRefund() {
        if (!refundModal.subId) return
        const subId = refundModal.subId
        setRefundModal({ isOpen: false, subId: null })

        startTransition(async () => {
            const res = await refundSubscription(subId)
            if (res.success) {
                setSubscriptions(prev => prev.map(s =>
                    s.id === subId ? { ...s, status: 'refunded' } : s
                ))
            }
        })
    }

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
        <div className="space-y-6 animate-slide-up-fade">
            {/* 1. Activity Chart */}
            {growthData.length > 0 && (
                <div className="mb-2">
                    <SubscriptionsActivityChart data={growthData} />
                </div>
            )}

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
                                <th>{t.subscriptions.table.renewal}</th>
                                <th className="text-right">Actions</th>
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
                                const isPremium = sub.planName.toLowerCase().includes('pro') || sub.planName.toLowerCase().includes('team') || sub.planName.toLowerCase().includes('premium')

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
                                                {sub.planPrice > 0 && <span className="text-xs text-muted-foreground">/{sub.interval === 'month' ? (locale === 'fr' ? 'mois' : 'mo') : (locale === 'fr' ? 'an' : 'yr')}</span>}
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
                                        <td className="text-right whitespace-nowrap">
                                            {sub.currentPeriodEnd ? (
                                                <div className="flex flex-col items-end">
                                                    <span className="text-sm text-[var(--page-fg)]">
                                                        {new Date(sub.currentPeriodEnd).toLocaleDateString(locale === 'fr' ? 'fr-FR' : 'en-US')}
                                                    </span>
                                                    {sub.status === 'canceled' && (
                                                        <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider font-mono">{t.subscriptions.table.expires}</span>
                                                    )}
                                                </div>
                                            ) : (
                                                <span className="text-sm text-muted-foreground">—</span>
                                            )}
                                        </td>
                                        <td className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-white/5 data-[state=open]:bg-white/5">
                                                        <span className="sr-only">Open menu</span>
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-[180px] bg-[var(--card-bg)] border-[var(--glass-border)] text-white">
                                                    <DropdownMenuLabel className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold font-mono">Operations</DropdownMenuLabel>
                                                    <DropdownMenuSeparator className="bg-[var(--glass-border)]" />
                                                    <Link href={`/dashboard/users?search=${sub.userEmail}`}>
                                                        <DropdownMenuItem className="hover:bg-white/5 cursor-pointer gap-2">
                                                            <User className="w-4 h-4 text-primary" />
                                                            Voir l'utilisateur
                                                        </DropdownMenuItem>
                                                    </Link>
                                                    {sub.stripeSubscriptionId ? (
                                                        <Link href={`https://dashboard.stripe.com/subscriptions/${sub.stripeSubscriptionId}`} target="_blank" rel="noopener noreferrer">
                                                            <DropdownMenuItem className="hover:bg-white/5 cursor-pointer gap-2">
                                                                <Receipt className="w-4 h-4 text-slate-400" />
                                                                Factures Stripe
                                                            </DropdownMenuItem>
                                                        </Link>
                                                    ) : sub.stripeCustomerId ? (
                                                        <Link href={`https://dashboard.stripe.com/customers/${sub.stripeCustomerId}`} target="_blank" rel="noopener noreferrer">
                                                            <DropdownMenuItem className="hover:bg-white/5 cursor-pointer gap-2">
                                                                <Receipt className="w-4 h-4 text-slate-400" />
                                                                Factures Stripe
                                                            </DropdownMenuItem>
                                                        </Link>
                                                    ) : (
                                                        <DropdownMenuItem className="hover:bg-white/5 gap-2 text-slate-500" disabled>
                                                            <Receipt className="w-4 h-4 text-slate-600" />
                                                            Factures Stripe (N/A)
                                                        </DropdownMenuItem>
                                                    )}
                                                    <DropdownMenuSeparator className="bg-[var(--glass-border)]" />
                                                    {sub.status === 'active' && (
                                                        <DropdownMenuItem
                                                            onClick={() => setRefundModal({ isOpen: true, subId: sub.id })}
                                                            className="text-red-400 focus:text-red-400 focus:bg-red-500/10 cursor-pointer gap-2"
                                                        >
                                                            <Banknote className="w-4 h-4" />
                                                            Rembourser
                                                        </DropdownMenuItem>
                                                    )}
                                                </DropdownMenuContent>
                                            </DropdownMenu>
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

            <ConfirmModal
                isOpen={refundModal.isOpen}
                variant="danger"
                title="Rembourser l'abonnement"
                description="Êtes-vous sûr de vouloir rembourser cet abonnement ? L'utilisateur perdra son accès Premium immédiatement."
                confirmLabel="Rembourser"
                onConfirm={confirmRefund}
                onCancel={() => setRefundModal({ isOpen: false, subId: null })}
                isPending={isPending}
            />
        </div>
    )
}
