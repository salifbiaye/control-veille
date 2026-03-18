'use client'

import { useState, useTransition, useMemo } from 'react'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
    updateAdminUserRole,
    revokeAdminUser,
    togglePremiumLifetime,
    banUser,
    unbanUser,
} from '@/features/users/actions/users.actions'
import { refundSubscription } from '@/features/subscriptions/actions/subscriptions.actions'
import type { AdminUser, ClientUser } from '@/features/users/actions/users.actions'
import {
    ChevronLeft, ChevronRight, ShieldCheck, Users, Search,
    UserX, Lock, Star, Crown, CalendarClock, Ban, Eye, ArrowUpDown, CheckCircle2
} from 'lucide-react'
import { useT } from '@/lib/i18n/locale-context'
import { ConfirmModal } from '@/components/ui/ConfirmModal'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet'
import {
    useReactTable,
    getCoreRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    getFilteredRowModel,
    flexRender,
    type ColumnDef,
    type SortingState,
    type ColumnFiltersState,
} from '@tanstack/react-table'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MoreHorizontal } from 'lucide-react'
import { UsersActivityChart } from './UsersActivityChart'
import { getAnalyticsStats } from '@/features/analytics/actions/analytics.actions'
import { useEffect } from 'react'

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────

const ROLES = ['SUPER_ADMIN', 'ADMIN', 'SUPPORT', 'READ_ONLY'] as const

const roleBadgeVariant: Record<string, string> = {
    SUPER_ADMIN: 'bg-red-500/10 text-red-600 dark:text-red-500 border-red-500/20',
    ADMIN: 'bg-amber-500/10 text-amber-600 dark:text-amber-500 border-amber-500/20',
    SUPPORT: 'bg-primary/10 text-primary dark:text-primary border-primary/20',
    READ_ONLY: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20',
}

const getRoleLabel = (role: string, t: any) => {
    switch (role) {
        case 'SUPER_ADMIN': return t.users.role.SUPER_ADMIN
        case 'ADMIN': return t.users.role.ADMIN
        case 'SUPPORT': return t.users.role.SUPPORT
        case 'READ_ONLY': return t.users.role.READ_ONLY
        default: return role
    }
}

function formatBytes(bytes: number | bigint) {
    const val = Number(bytes)
    if (val === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(val) / Math.log(k))
    return `${parseFloat((val / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}

function getColorForInitial(initial: string) {
    const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4']
    const charCode = initial.charCodeAt(0) || 0
    return colors[charCode % colors.length]
}

// ─────────────────────────────────────────────────────────────
// Admin Users Tab
// ─────────────────────────────────────────────────────────────

function AdminUsersTab({ initial }: { initial: AdminUser[] }) {
    const t = useT()
    const [users, setUsers] = useState(initial)
    const [pending, startTransition] = useTransition()
    const [globalFilter, setGlobalFilter] = useState('')
    const [sorting, setSorting] = useState<SortingState>([{ id: 'createdAt', desc: true }])

    // Confirm modal state
    const [confirmModal, setConfirmModal] = useState<{
        isOpen: boolean
        type: 'revoke' | 'role'
        userId: string
        newRole?: typeof ROLES[number]
        label?: string
    }>({ isOpen: false, type: 'revoke', userId: '' })

    function requestRevoke(id: string) {
        if (users.find(u => u.id === id)?.role === 'SUPER_ADMIN') return
        setConfirmModal({ isOpen: true, type: 'revoke', userId: id })
    }

    function confirmRevoke() {
        const { userId } = confirmModal
        setConfirmModal(m => ({ ...m, isOpen: false }))
        startTransition(async () => {
            const res = await revokeAdminUser(userId)
            if (res.success) setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: 'READ_ONLY' } : u))
        })
    }

    function requestRoleChange(id: string, role: typeof ROLES[number]) {
        if (users.find(u => u.id === id)?.role === 'SUPER_ADMIN') return
        const currentRole = users.find(u => u.id === id)?.role
        const demotion = ROLES.indexOf(role) > ROLES.indexOf(currentRole as typeof ROLES[number])
        if (demotion) {
            setConfirmModal({ isOpen: true, type: 'role', userId: id, newRole: role, label: getRoleLabel(role, t) })
        } else {
            applyRoleChange(id, role)
        }
    }

    function confirmRoleChange() {
        const { userId, newRole } = confirmModal
        setConfirmModal(m => ({ ...m, isOpen: false }))
        if (newRole) applyRoleChange(userId, newRole)
    }

    function applyRoleChange(id: string, role: typeof ROLES[number]) {
        startTransition(async () => {
            const res = await updateAdminUserRole(id, role)
            if (res.success) setUsers(prev => prev.map(u => u.id === id ? { ...u, role } : u))
        })
    }

    const columns = useMemo<ColumnDef<AdminUser>[]>(() => [
        {
            accessorFn: row => `${row.name} ${row.email}`,
            id: 'member',
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    className="px-0 font-medium hover:bg-transparent -ml-2 h-auto text-[var(--page-fg)]"
                >
                    {t.users.table.member}
                    <ArrowUpDown className="ml-2 h-3 w-3" />
                </Button>
            ),
            cell: ({ row }) => {
                const user = row.original
                const initial = (user.name ?? user.email).charAt(0).toUpperCase()
                const bgColor = getColorForInitial(initial)
                const isSuperAdmin = user.role === 'SUPER_ADMIN'
                return (
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <Avatar className="h-9 w-9 border border-[var(--glass-border)] rounded-xl shadow-sm">
                                <AvatarFallback className="text-sm font-bold text-white rounded-xl" style={{ backgroundColor: bgColor }}>
                                    {initial}
                                </AvatarFallback>
                            </Avatar>
                            {isSuperAdmin && (
                                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                                    <Crown className="w-2.5 h-2.5 text-white" />
                                </span>
                            )}
                        </div>
                        <div>
                            <div className="font-medium text-[var(--page-fg)]">{user.name || '—'}</div>
                            <div className="text-xs text-muted-foreground">{user.email}</div>
                        </div>
                    </div>
                )
            }
        },
        {
            accessorKey: 'role',
            header: () => <div>{t.users.table.role}</div>,
            cell: ({ row }) => {
                const user = row.original
                const isSuperAdmin = user.role === 'SUPER_ADMIN'
                return isSuperAdmin ? (
                    <div className={`inline-flex items-center gap-1.5 text-xs font-semibold rounded-full px-3 py-1 border ${roleBadgeVariant['SUPER_ADMIN']}`}>
                        <Lock className="w-3 h-3" />
                        {getRoleLabel('SUPER_ADMIN', t)}
                    </div>
                ) : (
                    <select
                        value={user.role}
                        disabled={pending}
                        onChange={e => requestRoleChange(user.id, e.target.value as typeof ROLES[number])}
                        className={`text-xs font-semibold rounded-full px-3 py-1 border transition-colors outline-none cursor-pointer appearance-none ${roleBadgeVariant[user.role]}`}
                    >
                        {ROLES.filter(r => r !== 'SUPER_ADMIN').map(r => (
                            <option key={r} value={r} className="bg-[var(--card-bg)] text-[var(--page-fg)]">
                                {getRoleLabel(r, t)}
                            </option>
                        ))}
                    </select>
                )
            }
        },
        {
            accessorKey: 'createdAt',
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    className="px-0 font-medium hover:bg-transparent h-auto text-[var(--page-fg)]"
                >
                    {t.users.table.added}
                    <ArrowUpDown className="ml-2 h-3 w-3" />
                </Button>
            ),
            cell: ({ row }) => (
                <span className="text-sm text-muted-foreground">
                    {new Date(row.original.createdAt).toLocaleDateString('fr-FR')}
                </span>
            )
        },
        {
            id: 'actions',
            header: () => <div className="text-right">Actions</div>,
            cell: ({ row }) => {
                const user = row.original
                const isSuperAdmin = user.role === 'SUPER_ADMIN'
                return (
                    <div className="text-right">
                        <Button
                            size="sm"
                            variant="outline"
                            disabled={pending || user.role === 'READ_ONLY' || isSuperAdmin}
                            onClick={() => requestRevoke(user.id)}
                            className="h-8 text-xs bg-[rgba(239,68,68,0.05)] border-red-500/20 text-red-600 dark:text-red-400 hover:bg-red-500/20 hover:text-red-700 dark:hover:text-red-300 transition-colors shadow-none disabled:opacity-30"
                            title={isSuperAdmin ? 'Les Super Admins ne peuvent pas être révoqués' : ''}
                        >
                            {isSuperAdmin ? <Lock className="w-3.5 h-3.5" /> : <UserX className="w-3.5 h-3.5 mr-1.5" />}
                            {!isSuperAdmin && t.users.actions.revoke}
                        </Button>
                    </div>
                )
            }
        }
    ], [t, pending])

    const table = useReactTable({
        data: users,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        state: { globalFilter, sorting },
        onGlobalFilterChange: setGlobalFilter,
        onSortingChange: setSorting,
        initialState: { pagination: { pageSize: 10 } }
    })

    return (
        <div className="space-y-6 animate-slide-up-fade">
            <ConfirmModal
                isOpen={confirmModal.isOpen}
                variant="warning"
                title={confirmModal.type === 'revoke' ? 'Révoquer l\'accès' : `Changer le rôle en ${confirmModal.label}`}
                description={
                    confirmModal.type === 'revoke'
                        ? 'Cette personne sera rétrogradée en lecture seule. Elle ne pourra plus effectuer d\'actions dans l\'admin.'
                        : `Vous êtes sur le point de changer le rôle de cet administrateur. Cette action est réversible.`
                }
                confirmLabel={confirmModal.type === 'revoke' ? 'Révoquer' : 'Confirmer'}
                onConfirm={confirmModal.type === 'revoke' ? confirmRevoke : confirmRoleChange}
                onCancel={() => setConfirmModal(m => ({ ...m, isOpen: false }))}
                isPending={pending}
            />

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                {/* 1. Global Search */}
                <div className="relative flex-1 group max-w-md">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground transition-colors group-focus-within:text-primary pointer-events-none" />
                    <input
                        type="text"
                        placeholder={t.users.search.admin}
                        value={globalFilter}
                        onChange={(e) => setGlobalFilter(e.target.value)}
                        className="w-full h-11 rounded-xl bg-[rgba(255,255,255,0.01)] border border-[var(--glass-border)] px-4 pl-12 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all font-medium"
                    />
                </div>
            </div>

            <div className="rounded-xl border border-[var(--glass-border)] bg-[var(--card-bg)] shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="premium-table">
                        <thead>
                            {table.getHeaderGroups().map(headerGroup => (
                                <tr key={headerGroup.id}>
                                    {headerGroup.headers.map(header => (
                                        <th key={header.id} className={header.column.id === 'actions' ? 'text-right' : ''}>
                                            {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                                        </th>
                                    ))}
                                </tr>
                            ))}
                        </thead>
                        <tbody>
                            {table.getRowModel().rows?.length ? (
                                table.getRowModel().rows.map(row => (
                                    <tr key={row.id} className="group hover:bg-[rgba(255,255,255,0.01)] transition-colors">
                                        {row.getVisibleCells().map(cell => (
                                            <td key={cell.id}>
                                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={columns.length} className="text-center py-12 text-muted-foreground italic">
                                        {t.users.table.emptyAdmin}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between px-5 py-4 border-t border-[var(--glass-border)] bg-[rgba(255,255,255,0.01)] gap-4">
                    <div className="text-sm text-muted-foreground font-medium flex items-center gap-4">
                        <span className="flex items-center gap-1.5">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            {table.getFilteredRowModel().rows.length} <span className="hidden sm:inline">admins trouvés</span>
                        </span>
                        {table.getPageCount() > 0 && (
                            <span className="text-xs px-2 py-0.5 rounded-md bg-white/5 border border-white/5">
                                Page {table.getState().pagination.pageIndex + 1} / {table.getPageCount() || 1}
                            </span>
                        )}
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => table.previousPage()}
                            disabled={!table.getCanPreviousPage()}
                            className="h-8 px-3 gap-1.5 bg-[var(--card-bg)] border-[var(--chrome-border)] hover:bg-[var(--glass-elev)] text-[var(--page-fg)] disabled:opacity-20 text-xs transition-all"
                        >
                            <ChevronLeft className="w-3.5 h-3.5" />
                            Précédent
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => table.nextPage()}
                            disabled={!table.getCanNextPage()}
                            className="h-8 px-3 gap-1.5 bg-[var(--card-bg)] border-[var(--chrome-border)] hover:bg-[var(--glass-elev)] text-[var(--page-fg)] disabled:opacity-20 text-xs transition-all"
                        >
                            Suivant
                            <ChevronRight className="w-3.5 h-3.5" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}


// ─────────────────────────────────────────────────────────────
// Client Users Tab (TanStack Table)
// ─────────────────────────────────────────────────────────────

function ClientUsersTab({ data }: { data: ClientUser[] }) {
    const t = useT()
    const [users, setUsers] = useState(data)
    const [globalFilter, setGlobalFilter] = useState('')
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
    const [sorting, setSorting] = useState<SortingState>([{ id: 'createdAt', desc: true }])
    const [planFilter, setPlanFilter] = useState<'all' | 'free' | 'pro' | 'premium'>('all')
    const [pending, startTransition] = useTransition()

    const BAN_REASONS = [
        'Violation des conditions d\'utilisation',
        'Spam ou comportement abusif',
        'Fraude ou activité suspecte',
        'Contenu inapproprié',
        'Compte compromis',
        'Autre',
    ]

    // Modals state
    const [actionModal, setActionModal] = useState<{
        isOpen: boolean
        type: 'lifetime' | 'ban' | 'unban'
        userId: string
        value?: boolean
    }>({ isOpen: false, type: 'lifetime', userId: '' })
    const [banReason, setBanReason] = useState(BAN_REASONS[0])
    const [customBanReason, setCustomBanReason] = useState('')

    const [refundModal, setRefundModal] = useState<{ isOpen: boolean, subscriptionId: string | null }>({
        isOpen: false,
        subscriptionId: null
    })

    const [detailsModal, setDetailsModal] = useState<{ isOpen: boolean, user: ClientUser | null }>({
        isOpen: false,
        user: null
    })

    function confirmAction() {
        const { type, userId, value } = actionModal
        setActionModal(m => ({ ...m, isOpen: false }))

        startTransition(async () => {
            if (type === 'lifetime' && value !== undefined) {
                const res = await togglePremiumLifetime(userId, value)
                if (res.success) setUsers(prev => prev.map(u => u.id === userId ? { ...u, isPremiumLifetime: value } : u))
            } else if (type === 'unban') {
                const res = await unbanUser(userId)
                if (res.success) setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: 'USER' } : u))
            } else if (type === 'ban') {
                const finalReason = banReason === 'Autre' ? (customBanReason.trim() || 'Autre') : banReason
                const res = await banUser(userId, finalReason)
                if (res.success) {
                    setUsers(prev => prev.map(u =>
                        u.id === userId ? { ...u, role: 'BANNED', subscriptionStatus: 'canceled' } : u
                    ))
                    if (detailsModal.user?.id === userId) {
                        setDetailsModal(prev => ({
                            ...prev,
                            user: prev.user ? { ...prev.user, role: 'BANNED', subscriptionStatus: 'canceled' } : null
                        }))
                    }
                }
            }
        })
    }

    function confirmRefund() {
        if (!refundModal.subscriptionId) return
        const subId = refundModal.subscriptionId
        setRefundModal({ isOpen: false, subscriptionId: null })

        startTransition(async () => {
            const res = await refundSubscription(subId)
            if (res.success) {
                setUsers(prev => prev.map(u =>
                    u.subscriptionId === subId
                        ? { ...u, subscriptionStatus: 'refunded', planName: 'Free' }
                        : u
                ))

                if (detailsModal.user?.subscriptionId === subId) {
                    setDetailsModal(prev => ({
                        ...prev,
                        user: prev.user ? { ...prev.user, subscriptionStatus: 'refunded', planName: 'Free' } : null
                    }))
                }
            }
        })
    }

    const columns = useMemo<ColumnDef<ClientUser>[]>(() => [
        {
            accessorFn: row => `${row.name} ${row.email}`,
            id: 'client',
            header: ({ column }) => {
                return (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                        className="px-0 font-medium hover:bg-transparent -ml-2 h-auto text-[var(--page-fg)]"
                    >
                        {t.users.table.client}
                        <ArrowUpDown className="ml-2 h-3 w-3" />
                    </Button>
                )
            },
            cell: ({ row }) => {
                const user = row.original
                const initialStr = (user.name || user.email).charAt(0).toUpperCase()
                const hasActiveSub = user.subscriptionStatus === 'active'
                const planName = user.planName || t.subscriptions?.table?.free || 'Free'

                const isLifetime = user.isPremiumLifetime
                const isBanned = (user as any).role === 'BANNED'

                // Logic fix for plan detection
                const lowerPlan = planName.toLowerCase()
                const isPro = lowerPlan.includes('pro')
                const isTeam = lowerPlan.includes('team')
                const isPremium = isLifetime || (hasActiveSub && (isPro || isTeam))

                return (
                    <div className={`flex items-center gap-3 ${isBanned ? 'opacity-50 grayscale-[0.5]' : ''}`}>
                        <Avatar className={`h-9 w-9 border rounded-full shadow-sm ${isPremium ? 'border-primary/50' : 'border-[var(--glass-border)]'}`}>
                            <AvatarFallback className="text-sm font-bold text-white" style={{ backgroundColor: getColorForInitial(initialStr) }}>
                                {initialStr}
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <div className="font-medium text-[var(--page-fg)] flex items-center gap-2">
                                {user.name || '—'}
                                {isBanned ? (
                                    <Badge variant="outline" className="h-5 px-1.5 text-[10px] bg-red-500/10 text-red-500 border-red-500/20 gap-1">
                                        <Ban className="w-2.5 h-2.5" />
                                        BANNI
                                    </Badge>
                                ) : isLifetime ? (
                                    <Badge variant="outline" className="h-5 px-1.5 text-[10px] bg-violet-600/10 text-violet-400 border-violet-600/20 gap-1">
                                        <Star className="w-2.5 h-2.5" />
                                        LIFETIME PRO
                                    </Badge>
                                ) : hasActiveSub ? (
                                    <Badge variant="outline" className={`h-5 px-1.5 text-[10px] border-primary/20 bg-primary/10 text-primary`}>
                                        {planName}
                                        {user.cancelAtPeriodEnd && ' · fin'}
                                    </Badge>
                                ) : (
                                    <Badge variant="outline" className="h-5 px-1.5 text-[10px] bg-slate-500/10 text-slate-400 border-slate-500/20">
                                        Free
                                    </Badge>
                                )}
                            </div>
                            <div className="text-xs text-muted-foreground">{user.email}</div>
                        </div>
                    </div>
                )
            }
        },
        {
            accessorKey: 'techWatchCount',
            header: () => <div className="text-center">{t.users.table.watches}</div>,
            cell: ({ row }) => {
                const count = row.original.techWatchCount
                return (
                    <div className="text-center">
                        <span className={`inline-flex items-center justify-center min-w-[24px] px-1.5 h-6 rounded-md text-xs font-mono font-semibold ${count > 0 ? 'bg-primary/10 text-primary border border-primary/20' : 'bg-slate-500/10 text-slate-400 border border-slate-500/20'}`}>
                            {count}
                        </span>
                    </div>
                )
            }
        },
        {
            accessorKey: 'createdAt',
            header: ({ column }) => {
                return (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                        className="px-0 font-medium hover:bg-transparent h-auto text-[var(--page-fg)]"
                    >
                        Date d'inscription
                        <ArrowUpDown className="ml-2 h-3 w-3" />
                    </Button>
                )
            },
            cell: ({ row }) => (
                <span className="text-xs text-muted-foreground">
                    {new Date(row.original.createdAt).toLocaleDateString('fr-FR')}
                </span>
            )
        },
        {
            id: 'actions',
            header: () => <div className="text-right">Actions</div>,
            cell: ({ row }) => {
                const user = row.original
                const hasActiveSub = user.subscriptionStatus === 'active'
                const isLifetime = user.isPremiumLifetime
                const isBanned = (user as any).role === 'BANNED'

                return (
                    <div className="flex justify-end items-center">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="ghost"
                                    className="h-8 w-8 p-0"
                                    disabled={pending}
                                >
                                    <span className="sr-only">Open menu</span>
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuItem onClick={() => setDetailsModal({ isOpen: true, user })}>
                                    <Eye className="mr-2 h-4 w-4 text-muted-foreground" />
                                    Voir détails
                                </DropdownMenuItem>

                                <DropdownMenuSeparator />

                                {!hasActiveSub && (
                                    <DropdownMenuItem onClick={() => setActionModal({ isOpen: true, type: 'lifetime', userId: user.id, value: !isLifetime })}>
                                        <Star className={`mr-2 h-4 w-4 ${isLifetime ? 'fill-primary text-primary' : 'text-muted-foreground'}`} />
                                        {isLifetime ? 'Désactiver Lifetime' : '⭐ Activer Lifetime Pro'}
                                    </DropdownMenuItem>
                                )}

                                {isBanned ? (
                                    <DropdownMenuItem onClick={() => setActionModal({ isOpen: true, type: 'unban', userId: user.id })} className="text-green-600 focus:text-green-600 focus:bg-green-500/10">
                                        <CheckCircle2 className="mr-2 h-4 w-4" />
                                        Débannir
                                    </DropdownMenuItem>
                                ) : (
                                    <DropdownMenuItem onClick={() => setActionModal({ isOpen: true, type: 'ban', userId: user.id })} className="text-red-600 focus:text-red-600 focus:bg-red-500/10">
                                        <Ban className="mr-2 h-4 w-4" />
                                        Bannir le client
                                    </DropdownMenuItem>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                )
            }
        }
    ], [t, pending])

    // Memoize filtered data for Plan status
    const filteredUsers = useMemo(() => {
        if (planFilter === 'all') return users
        return users.filter(user => {
            const plan = (user.planName || '').toLowerCase()
            const isLifetime = user.isPremiumLifetime
            const hasActiveSub = user.subscriptionStatus === 'active'

            if (planFilter === 'free') return !isLifetime && !hasActiveSub
            if (planFilter === 'pro') return isLifetime || (hasActiveSub && plan.includes('pro'))
            if (planFilter === 'premium') return hasActiveSub && (plan.includes('team') || plan.includes('premium'))
            return true
        })
    }, [users, planFilter])

    const table = useReactTable({
        data: filteredUsers,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        state: { globalFilter, sorting, columnFilters },
        onGlobalFilterChange: setGlobalFilter,
        onColumnFiltersChange: setColumnFilters,
        onSortingChange: setSorting,
        initialState: { pagination: { pageSize: 10 } }
    })

    return (
        <div className="space-y-6 animate-slide-up-fade">
            <ConfirmModal
                isOpen={actionModal.isOpen}
                variant={actionModal.type === 'unban' ? 'warning' : 'danger'}
                title={
                    actionModal.type === 'unban' ? 'Débannir l\'utilisateur' :
                        actionModal.type === 'ban' ? 'Bannir l\'utilisateur' :
                            actionModal.value ? 'Activer le Premium Lifetime' : 'Désactiver le Premium Lifetime'
                }
                description={
                    actionModal.type === 'unban' ? 'L\'utilisateur retrouvera ses accès normaux à la plateforme.' :
                        actionModal.type === 'ban' ? 'Cet utilisateur perdra instantanément l\'accès à la plateforme. Vous pourrez le débannir plus tard.' :
                            actionModal.value
                                ? 'Cet utilisateur aura accès à toutes les fonctionnalités Pro gratuitement, sans abonnement Stripe.'
                                : 'Cet utilisateur retournera à son plan normal (Free ou abonnement Stripe actif).'
                }
                confirmLabel={
                    actionModal.type === 'unban' ? 'Débannir' :
                        actionModal.type === 'ban' ? 'Bannir' :
                            actionModal.value ? '⭐ Activer' : 'Désactiver'
                }
                onConfirm={confirmAction}
                onCancel={() => setActionModal(m => ({ ...m, isOpen: false }))}
                isPending={pending}
            >
                {actionModal.type === 'ban' && (
                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: 'rgba(248,250,252,0.45)' }}>
                            Motif du bannissement
                        </label>
                        <select
                            value={banReason}
                            onChange={e => { setBanReason(e.target.value); setCustomBanReason('') }}
                            className="w-full rounded-lg px-3 py-2 text-sm outline-none"
                            style={{
                                background: 'rgba(255,255,255,0.04)',
                                border: '1px solid rgba(239,68,68,0.25)',
                                color: 'var(--page-fg)',
                            }}
                        >
                            {BAN_REASONS.map(r => (
                                <option key={r} value={r} style={{ background: '#1a1a1e' }}>{r}</option>
                            ))}
                        </select>
                        {banReason === 'Autre' && (
                            <input
                                type="text"
                                placeholder="Précisez le motif..."
                                value={customBanReason}
                                onChange={e => setCustomBanReason(e.target.value)}
                                className="w-full rounded-lg px-3 py-2 text-sm outline-none mt-2"
                                style={{
                                    background: 'rgba(255,255,255,0.04)',
                                    border: '1px solid rgba(239,68,68,0.25)',
                                    color: 'var(--page-fg)',
                                }}
                            />
                        )}
                        <p className="text-[11px] mt-1.5" style={{ color: 'rgba(248,250,252,0.35)' }}>
                            Ce motif sera inclus dans l'email envoyé à l'utilisateur.
                        </p>
                    </div>
                )}
            </ConfirmModal>

            <ConfirmModal
                isOpen={refundModal.isOpen}
                variant="danger"
                title="Confirmer le remboursement"
                description="Êtes-vous sûr de vouloir rembourser le dernier paiement de cet utilisateur ? L'abonnement sera également annulé dans Stripe."
                confirmLabel="Confirmer le remboursement"
                onConfirm={confirmRefund}
                onCancel={() => setRefundModal({ isOpen: false, subscriptionId: null })}
                isPending={pending}
            />

            {/* Render Details Sheet */}
            <Sheet open={detailsModal.isOpen} onOpenChange={(open) => !open && setDetailsModal({ isOpen: false, user: null })}>
                <SheetContent className="bg-[var(--background)] border-l border-[var(--glass-border)] sm:max-w-md">
                    <SheetHeader className="mb-6">
                        <SheetTitle className="text-xl">Détails de l'utilisateur</SheetTitle>
                        <SheetDescription>
                            Aperçu complet du compte et de l'usage.
                        </SheetDescription>
                    </SheetHeader>
                    {detailsModal.user && (
                        <div className="space-y-6">
                            <div className="flex items-center gap-4 p-4 rounded-xl border border-[var(--glass-border)] bg-[rgba(255,255,255,0.02)]">
                                <Avatar className="h-12 w-12 border border-[var(--glass-border)]">
                                    <AvatarFallback className="text-lg font-bold text-white" style={{ backgroundColor: getColorForInitial(detailsModal.user.name || detailsModal.user.email) }}>
                                        {(detailsModal.user.name || detailsModal.user.email).charAt(0).toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="font-semibold text-[var(--page-fg)]">{detailsModal.user.name || 'Sans Nom'}</p>
                                    <p className="text-sm text-muted-foreground">{detailsModal.user.email}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 rounded-xl border border-[var(--glass-border)] bg-[var(--card-bg)]">
                                    <p className="text-xs text-muted-foreground mb-1">ID Utilisateur</p>
                                    <p className="text-xs font-mono font-medium truncate" title={detailsModal.user.id}>{detailsModal.user.id.substring(0, 16)}...</p>
                                </div>
                                <div className="p-4 rounded-xl border border-[var(--glass-border)] bg-[var(--card-bg)]">
                                    <p className="text-xs text-muted-foreground mb-1">Date d'inscription</p>
                                    <p className="text-sm font-medium">{new Date(detailsModal.user.createdAt).toLocaleDateString('fr-FR')}</p>
                                </div>
                                <div className="p-4 rounded-xl border border-[var(--glass-border)] bg-[var(--card-bg)]">
                                    <p className="text-xs text-muted-foreground mb-1">Status Abonnement</p>
                                    <div className="mt-1">
                                        {detailsModal.user.isPremiumLifetime ? (
                                            <Badge variant="outline" className="bg-violet-500/10 text-violet-400 border-violet-500/20">Lifetime Pro</Badge>
                                        ) : detailsModal.user.subscriptionStatus === 'active' ? (
                                            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">{detailsModal.user.planName || 'Pro'}</Badge>
                                        ) : (
                                            <Badge variant="outline" className="bg-slate-500/10 text-slate-400 border-slate-500/20">Free</Badge>
                                        )}
                                        {detailsModal.user.subscriptionId && detailsModal.user.subscriptionStatus === 'active' && (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setRefundModal({ isOpen: true, subscriptionId: detailsModal.user!.subscriptionId })}
                                                className="mt-2 w-full text-xs border-red-500/30 hover:bg-red-500/10 hover:text-red-400 gap-2"
                                            >
                                                <MoreHorizontal className="w-3 h-3" />
                                                Rembourser le paiement
                                            </Button>
                                        )}
                                    </div>
                                </div>
                                <div className="p-4 rounded-xl border border-[var(--glass-border)] bg-[var(--card-bg)]">
                                    <p className="text-xs text-muted-foreground mb-1">Veilles créées</p>
                                    <p className="text-xl font-bold text-[var(--page-fg)]">{detailsModal.user.techWatchCount}</p>
                                </div>
                            </div>

                            <div className="p-4 rounded-xl border border-[var(--glass-border)] bg-[var(--card-bg)]">
                                <div className="flex justify-between items-center mb-2">
                                    <p className="text-sm font-medium text-[var(--page-fg)]">Stockage Cloud</p>
                                    <p className="text-xs text-muted-foreground">{formatBytes(detailsModal.user.storageUsed)} / {formatBytes(detailsModal.user.storageLimit)}</p>
                                </div>
                                <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-primary rounded-full transition-all"
                                        style={{ width: `${Math.min(100, (Number(detailsModal.user.storageUsed) / Math.max(1, Number(detailsModal.user.storageLimit))) * 100)}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </SheetContent>
            </Sheet>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                {/* 1. Global Search */}
                <div className="relative flex-1 group max-w-md">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground transition-colors group-focus-within:text-primary pointer-events-none" />
                    <input
                        type="text"
                        placeholder={t.users.search.clients}
                        value={globalFilter}
                        onChange={(e) => setGlobalFilter(e.target.value)}
                        className="w-full h-11 rounded-xl bg-[rgba(255,255,255,0.01)] border border-[var(--glass-border)] px-4 pl-12 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all font-medium"
                    />
                </div>

                {/* 2. Plan Filters */}
                <div className="flex items-center gap-1 p-1 rounded-xl bg-[rgba(255,255,255,0.02)] border border-[var(--glass-border)] overflow-x-auto no-scrollbar">
                    {[
                        { id: 'all', label: t.users.filters.all },
                        { id: 'free', label: t.users.filters.free },
                        { id: 'pro', label: t.users.filters.pro },
                        { id: 'premium', label: t.users.filters.premium }
                    ].map((f) => (
                        <button
                            key={f.id}
                            onClick={() => setPlanFilter(f.id as any)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${planFilter === f.id
                                ? 'bg-primary text-white shadow-lg'
                                : 'text-muted-foreground hover:text-[var(--page-fg)] hover:bg-white/5'
                                }`}
                        >
                            {f.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="rounded-xl border border-[var(--glass-border)] bg-[var(--card-bg)] shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="premium-table">
                        <thead>
                            {table.getHeaderGroups().map(headerGroup => (
                                <tr key={headerGroup.id}>
                                    {headerGroup.headers.map(header => (
                                        <th key={header.id} className={header.column.id === 'actions' ? 'text-right' : ''}>
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(header.column.columnDef.header, header.getContext())}
                                        </th>
                                    ))}
                                </tr>
                            ))}
                        </thead>
                        <tbody>
                            {table.getRowModel().rows?.length ? (
                                table.getRowModel().rows.map(row => (
                                    <tr key={row.id} className="group hover:bg-[rgba(255,255,255,0.01)] transition-colors">
                                        {row.getVisibleCells().map(cell => (
                                            <td key={cell.id}>
                                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={columns.length} className="text-center py-12 text-muted-foreground italic">
                                        {t.users.table.emptyClient}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between px-5 py-4 border-t border-[var(--glass-border)] bg-[rgba(255,255,255,0.01)] gap-4">
                    <div className="text-sm text-muted-foreground font-medium flex items-center gap-4">
                        <span className="flex items-center gap-1.5">
                            <Users className="w-3.5 h-3.5" />
                            {table.getFilteredRowModel().rows.length} <span className="hidden sm:inline">utilisateurs trouvés</span>
                        </span>
                        {table.getPageCount() > 0 && (
                            <span className="text-xs px-2 py-0.5 rounded-md bg-white/5 border border-white/5">
                                Page {table.getState().pagination.pageIndex + 1} / {table.getPageCount() || 1}
                            </span>
                        )}
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => table.previousPage()}
                            disabled={!table.getCanPreviousPage()}
                            className="h-8 px-3 gap-1.5 bg-[var(--card-bg)] border-[var(--chrome-border)] hover:bg-[var(--glass-elev)] text-[var(--page-fg)] disabled:opacity-20 text-xs transition-all"
                        >
                            <ChevronLeft className="w-3.5 h-3.5" />
                            Précédent
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => table.nextPage()}
                            disabled={!table.getCanNextPage()}
                            className="h-8 px-3 gap-1.5 bg-[var(--card-bg)] border-[var(--chrome-border)] hover:bg-[var(--glass-elev)] text-[var(--page-fg)] disabled:opacity-20 text-xs transition-all"
                        >
                            Suivant
                            <ChevronRight className="w-3.5 h-3.5" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}

// ─────────────────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────────────────

type Tab = 'clients' | 'admin'

interface UsersClientProps {
    adminUsers: AdminUser[]
    clientUsers: ClientUser[]
}

export function UsersClient({ adminUsers, clientUsers }: UsersClientProps) {
    const [tab, setTab] = useState<'clients' | 'admin'>('clients')
    const [growthData, setGrowthData] = useState<any[]>([])
    const t = useT()

    // Fetch unified growth data for chart
    useEffect(() => {
        getAnalyticsStats().then(stats => {
            setGrowthData(stats.usersGrowth || [])
        })
    }, [])

    const tabs: { id: Tab; label: string; count: number; icon: React.ElementType }[] = [
        { id: 'clients', label: t.users.tabs.clients, count: clientUsers.length, icon: Users },
        { id: 'admin', label: t.users.tabs.admin, count: adminUsers.length, icon: ShieldCheck },
    ]

    return (
        <div className="space-y-8" style={{ paddingTop: '0' }}>
            {/* Unified Activity Chart at the top */}
            {growthData.length > 0 && (
                <UsersActivityChart
                    data={growthData}
                    title={t.users.charts.registrations}
                    description="Évolution des inscriptions par rôle sur les 30 derniers jours"
                />
            )}

            <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-2xl w-fit" style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', backdropFilter: 'blur(10px)' }}>
                {tabs.map(({ id, label, count, icon: Icon }) => {
                    const active = tab === id
                    return (
                        <button
                            key={id}
                            onClick={() => setTab(id)}
                            className={`flex items-center gap-2.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 relative overflow-hidden ${active ? 'text-primary dark:text-white' : 'text-[var(--txt-sub)] hover:text-[var(--page-fg)]'}`}
                        >
                            {active && (
                                <span className="absolute inset-0 bg-primary/10 dark:bg-primary/20 backdrop-blur-md rounded-xl z-0 border border-primary/30" />
                            )}
                            <Icon className={`w-4 h-4 relative z-10 ${active ? 'text-primary dark:text-primary-foreground' : 'text-current'}`} />
                            <span className="relative z-10">{label}</span>
                            <span className={`relative z-10 text-[10px] px-2 py-0.5 rounded-full font-bold tracking-wider ${active ? 'bg-primary/20 text-primary dark:bg-white/10 dark:text-white/80' : 'bg-[var(--glass-border)] text-current'}`}>
                                {count}
                            </span>
                        </button>
                    )
                })}
            </div>

            <div>
                {tab === 'clients' && <ClientUsersTab data={clientUsers} />}
                {tab === 'admin' && <AdminUsersTab initial={adminUsers} />}
            </div>
        </div>
    )
}
