'use client'

import { useState, useTransition, useMemo } from 'react'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { updateAdminUserRole, revokeAdminUser } from '@/features/users/actions/users.actions'
import type { AdminUser, ClientUser, PaginatedResult } from '@/features/users/actions/users.actions'
import { ChevronLeft, ChevronRight, ShieldCheck, Users, Search, MoreHorizontal, UserX, ShieldAlert } from 'lucide-react'
import { useLocale, useT } from '@/lib/i18n/locale-context'

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

function formatBytes(bytes: number) {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}

function getColorForInitial(initial: string) {
    const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4'];
    const charCode = initial.charCodeAt(0) || 0;
    return colors[charCode % colors.length];
}

// ─────────────────────────────────────────────────────────────
// Admin Users Tab
// ─────────────────────────────────────────────────────────────

function AdminUsersTab({ initial }: { initial: AdminUser[] }) {
    const t = useT()
    const [users, setUsers] = useState(initial)
    const [pending, startTransition] = useTransition()
    const [searchTerm, setSearchTerm] = useState('')

    function handleRoleChange(id: string, role: typeof ROLES[number]) {
        startTransition(async () => {
            const res = await updateAdminUserRole(id, role)
            if (res.success) {
                setUsers(prev => prev.map(u => u.id === id ? { ...u, role } : u))
            }
        })
    }

    function handleRevoke(id: string) {
        startTransition(async () => {
            const res = await revokeAdminUser(id)
            if (res.success) {
                setUsers(prev => prev.map(u => u.id === id ? { ...u, role: 'READ_ONLY' } : u))
            }
        })
    }

    const filteredUsers = useMemo(() => {
        if (!searchTerm) return users;
        return users.filter(u =>
            (u.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (u.name || '').toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [users, searchTerm]);

    return (
        <div className="space-y-4 animate-slide-up-fade">
            <div className="flex items-center gap-4 border-b border-[var(--glass-border)] pb-4">
                <div className="relative w-full max-w-sm group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <input
                        type="text"
                        placeholder={t.users.search.admin}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="input-premium pl-12 w-full"
                    />
                </div>
            </div>

            <div className="rounded-xl border border-[var(--glass-border)] bg-[var(--card-bg)] shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="premium-table">
                        <thead>
                            <tr>
                                <th className="w-[40%]">{t.users.table.member}</th>
                                <th>{t.users.table.role}</th>
                                <th>{t.users.table.added}</th>
                                <th className="text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="text-center py-12 text-muted-foreground italic">
                                        {t.users.table.emptyAdmin}
                                    </td>
                                </tr>
                            ) : filteredUsers.map((row) => {
                                const initial = (row.name ?? row.email).charAt(0).toUpperCase();
                                const bgColor = getColorForInitial(initial);
                                return (
                                    <tr key={row.id} className="group">
                                        <td>
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-9 w-9 border border-[var(--glass-border)] rounded-xl shadow-sm">
                                                    <AvatarFallback className="text-sm font-bold text-white rounded-xl" style={{ backgroundColor: bgColor }}>
                                                        {initial}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <div className="font-medium text-[var(--page-fg)]">{row.name || '—'}</div>
                                                    <div className="text-xs text-muted-foreground">{row.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <select
                                                value={row.role}
                                                disabled={pending}
                                                onChange={e => handleRoleChange(row.id, e.target.value as typeof ROLES[number])}
                                                className={`text-xs font-semibold rounded-full px-3 py-1 border transition-colors outline-none cursor-pointer appearance-none ${roleBadgeVariant[row.role]}`}
                                            >
                                                {ROLES.map(r => (
                                                    <option key={r} value={r} className="bg-[var(--card-bg)] text-[var(--page-fg)]">
                                                        {getRoleLabel(r, t)}
                                                    </option>
                                                ))}
                                            </select>
                                        </td>
                                        <td>
                                            <span className="text-sm text-muted-foreground">
                                                {new Date(row.createdAt).toLocaleDateString('fr-FR')}
                                            </span>
                                        </td>
                                        <td className="text-right">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                disabled={pending || row.role === 'READ_ONLY'}
                                                onClick={() => handleRevoke(row.id)}
                                                className="h-8 text-xs bg-[rgba(239,68,68,0.05)] border-red-500/20 text-red-600 dark:text-red-400 hover:bg-red-500/20 hover:text-red-700 dark:hover:text-red-300 transition-colors shadow-none"
                                            >
                                                <UserX className="w-3.5 h-3.5 mr-1.5" />
                                                {t.users.actions.revoke}
                                            </Button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────
// Client Users Tab
// ─────────────────────────────────────────────────────────────

function ClientUsersTab({
    initial,
}: {
    initial: PaginatedResult<ClientUser>
}) {
    const t = useT()
    const { data, meta } = initial
    const [searchTerm, setSearchTerm] = useState('')

    const filteredUsers = useMemo(() => {
        if (!searchTerm) return data;
        return data.filter(u =>
            (u.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (u.name || '').toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [data, searchTerm]);

    return (
        <div className="space-y-4 animate-slide-up-fade">
            <div className="flex items-center gap-4 border-b border-[var(--glass-border)] pb-4">
                <div className="relative w-full group">

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
                        placeholder={t.users.search.clients}
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
                                <th className="w-[40%]">{t.users.table.client}</th>
                                <th className="text-center">{t.users.table.watches}</th>
                                <th>{t.users.table.storage}</th>
                                <th className="text-right">{t.users.table.joined}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="text-center py-12 text-muted-foreground italic">
                                        {t.users.table.emptyClient}
                                    </td>
                                </tr>
                            ) : filteredUsers.map((row) => {
                                const initialStr = (row.name || row.email).charAt(0).toUpperCase();
                                const hasActiveSub = row.subscriptionStatus === 'active';
                                const planName = row.planName || t.subscriptions.table.free;
                                const isPremium = hasActiveSub && (planName.toLowerCase().includes('pro') || planName.toLowerCase().includes('team'));

                                return (
                                    <tr key={row.email} className="group">
                                        <td>
                                            <div className="flex items-center gap-3">
                                                <Avatar className={`h-9 w-9 border rounded-full shadow-sm ${isPremium ? 'border-primary/50' : 'border-[var(--glass-border)]'}`}>
                                                    <AvatarFallback className="text-sm font-bold text-white" style={{ backgroundColor: getColorForInitial(initialStr) }}>
                                                        {initialStr}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <div className="font-medium text-[var(--page-fg)] flex items-center gap-2">
                                                        {row.name || '—'}
                                                        {hasActiveSub ? (
                                                            <Badge variant="outline" className="h-5 px-1.5 text-[10px] bg-primary/10 text-primary border-primary/20">{planName}</Badge>
                                                        ) : (
                                                            <Badge variant="outline" className="h-5 px-1.5 text-[10px] bg-slate-500/10 text-slate-400 border-slate-500/20">{t.subscriptions.table.free}</Badge>
                                                        )}
                                                    </div>
                                                    <div className="text-xs text-muted-foreground">{row.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="text-center">
                                            <span className={`inline-flex items-center justify-center w-6 h-6 rounded-md text-xs font-mono font-semibold ${row.techWatchCount > 0 ? 'bg-primary/10 text-primary border border-primary/20' : 'bg-slate-500/10 text-slate-400 border border-slate-500/20'}`}>
                                                {row.techWatchCount}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center justify-between text-xs max-w-[120px]">
                                                    <span className="font-medium text-[var(--page-fg)]">{formatBytes(row.storageUsed)}</span>
                                                    <span className="text-muted-foreground">{formatBytes(row.storageLimit)}</span>
                                                </div>
                                                <div className="h-1.5 w-full max-w-[120px] bg-slate-800 rounded-full overflow-hidden">
                                                    <div className="h-full bg-primary rounded-full" style={{ width: `${Math.min(100, (row.storageUsed / Math.max(1, row.storageLimit)) * 100)}%` }}></div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="text-right">
                                            <span className="text-sm text-muted-foreground whitespace-nowrap">
                                                {new Date(row.createdAt).toLocaleDateString('fr-FR')}
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Pagination (Premium Style) */}
                {meta.totalPages > 1 && (
                    <div className="flex items-center justify-between px-5 py-4 border-t border-[var(--glass-border)] bg-[rgba(255,255,255,0.01)]">
                        <span className="text-sm text-muted-foreground font-medium">
                            {t.users.table.total.replace('{total}', meta.total.toString()).replace('{page}', meta.page.toString()).replace('{totalPages}', meta.totalPages.toString())}
                        </span>
                        <div className="flex gap-2">
                            <Link href={meta.page <= 1 ? '#' : `/dashboard/users?page=${meta.page - 1}`} passHref>
                                <Button variant="outline" size="icon" disabled={meta.page <= 1} className="h-8 w-8 bg-[var(--card-bg)] border-[var(--chrome-border)] hover:bg-[var(--glass-elev)] text-[var(--page-fg)]">
                                    <ChevronLeft className="w-4 h-4" />
                                </Button>
                            </Link>
                            <Link href={meta.page >= meta.totalPages ? '#' : `/dashboard/users?page=${meta.page + 1}`} passHref>
                                <Button variant="outline" size="icon" disabled={meta.page >= meta.totalPages} className="h-8 w-8 bg-[var(--card-bg)] border-[var(--chrome-border)] hover:bg-[var(--glass-elev)] text-[var(--page-fg)]">
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

// ─────────────────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────────────────

type Tab = 'clients' | 'admin'

interface UsersClientProps {
    adminUsers: AdminUser[]
    clientUsers: PaginatedResult<ClientUser>
}

export function UsersClient({ adminUsers, clientUsers }: UsersClientProps) {
    const [tab, setTab] = useState<'clients' | 'admin'>('clients')
    const t = useT()

    const tabs: { id: Tab; label: string; count: number; icon: React.ElementType }[] = [
        { id: 'clients', label: t.users.tabs.clients, count: clientUsers.meta.total, icon: Users },
        { id: 'admin', label: t.users.tabs.admin, count: adminUsers.length, icon: ShieldCheck },
    ]

    return (
        <div className="" style={{ paddingTop: '0' }}>
            {/* Tabs */}
            <div className="flex flex-wrap items-center gap-2 mb-8 p-1.5 rounded-2xl w-fit" style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', backdropFilter: 'blur(10px)' }}>
                {tabs.map(({ id, label, count, icon: Icon }) => {
                    const active = tab === id
                    return (
                        <button
                            key={id}
                            onClick={() => setTab(id)}
                            className={`flex items-center gap-2.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 relative overflow-hidden ${active ? 'text-primary dark:text-white' : 'text-[var(--txt-sub)] hover:text-[var(--page-fg)]'}`}
                        >
                            {active && (
                                <span className="absolute inset-0 bg-primary/10 dark:bg-primary/20 backdrop-blur-md rounded-xl z-0 border border-primary/30"></span>
                            )}
                            <Icon className={`w-4 h-4 relative z-10 ${active ? 'text-primary dark:text-primary-foreground' : 'text-current'}`} />
                            <span className="relative z-10">{label}</span>
                            <span
                                className={`relative z-10 text-[10px] px-2 py-0.5 rounded-full font-bold tracking-wider ${active ? 'bg-primary/20 text-primary dark:bg-white/10 dark:text-white/80' : 'bg-[var(--glass-border)] text-current'}`}
                            >
                                {count}
                            </span>
                        </button>
                    )
                })}
            </div>

            {/* Content Container without generic admin-card if we manage it inside tabs */}
            <div>
                {tab === 'clients' && (
                    <ClientUsersTab initial={clientUsers} />
                )}
                {tab === 'admin' && (
                    <AdminUsersTab initial={adminUsers} />
                )}
            </div>
        </div>
    )
}
