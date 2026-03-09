'use client'

import { useState, useEffect, useMemo, useTransition } from 'react'
import { Database, Search, Activity, FileText, CheckCircle2, Folder, Eye, Trash2, MoreHorizontal, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useT } from '@/lib/i18n/locale-context'
import { TechWatchesActivityChart } from './TechWatchesActivityChart'
import { getAnalyticsStats } from '@/features/analytics/actions/analytics.actions'
import { deleteTechWatch } from '@/features/techwatches/actions/techwatches.actions'
import { ConfirmModal } from '@/components/ui/ConfirmModal'
import { TechWatchDetailSheet } from './TechWatchDetailSheet'

interface TechWatch {
    id: string
    name: string
    description: string | null
    iconEmoji: string | null
    color: string | null
    logoUrl: string | null
    createdAt: Date
    updatedAt: Date
    user: {
        name: string | null
        email: string
        image: string | null
    }
    _count: {
        articles: number
        tasks: number
        resources: number
    }
}

export function TechWatchesClient({ data: techWatches }: { data: TechWatch[] }) {
    const t = useT()
    const [searchTerm, setSearchTerm] = useState('')
    const [growthData, setGrowthData] = useState<any[]>([])
    const [isPending, startTransition] = useTransition()
    const [deleteId, setDeleteId] = useState<string | null>(null)
    const [selectedTW, setSelectedTW] = useState<TechWatch | null>(null)
    const [isSheetOpen, setIsSheetOpen] = useState(false)
    const [logoErrors, setLogoErrors] = useState<Record<string, boolean>>({})

    useEffect(() => {
        getAnalyticsStats().then(stats => {
            setGrowthData(stats.techWatchesGrowth || [])
        })
    }, [])

    const handleDelete = (id: string) => {
        setDeleteId(id)
    }

    const handleViewDetails = (tw: TechWatch) => {
        setSelectedTW(tw)
        setIsSheetOpen(true)
    }

    const handleOpenClient = (id: string) => {
        const clientUrl = process.env.NEXT_PUBLIC_CLIENT_APP_URL || 'http://localhost:3000'
        window.open(`${clientUrl}/dashboard/${id}`, '_blank')
    }

    const confirmDelete = () => {
        if (!deleteId) return
        startTransition(async () => {
            const res = await deleteTechWatch(deleteId)
            if (res.success) {
                setDeleteId(null)
            }
        })
    }

    const filtered = useMemo(() => {
        if (!searchTerm) return techWatches
        const search = searchTerm.toLowerCase()
        return techWatches.filter(tw =>
            tw.name.toLowerCase().includes(search) ||
            (tw.description || '').toLowerCase().includes(search) ||
            (tw.user?.name || '').toLowerCase().includes(search) ||
            (tw.user?.email || '').toLowerCase().includes(search)
        )
    }, [techWatches, searchTerm])

    return (
        <div className="space-y-6">
            {/* 1. Activity Chart */}
            {growthData.length > 0 && (
                <div className="mb-2">
                    <TechWatchesActivityChart data={growthData} />
                </div>
            )}

            <div className="admin-card overflow-hidden">
                <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[var(--glass-border)] pb-4">
                    <div>
                        <h2 className="text-xl font-bold text-[var(--page-fg)] flex items-center gap-2">
                            <Database className="w-5 h-5 text-primary" />
                            {t.techwatches.title}
                        </h2>
                        <p className="text-sm text-muted-foreground mt-1">{t.techwatches.description}</p>
                    </div>

                    <div className="relative w-full max-sm group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground transition-colors group-focus-within:text-primary pointer-events-none" />
                        <input
                            type="text"
                            placeholder={t.actions.search}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full h-11 rounded-xl bg-[rgba(255,255,255,0.01)] border border-[var(--glass-border)] px-4 pl-12 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all font-medium"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto rounded-xl border border-[var(--glass-border)] mt-4">
                    <table className="premium-table">
                        <thead>
                            <tr>
                                <th className="w-[35%]">{t.techwatches.table.project}</th>
                                <th>{t.techwatches.table.owner}</th>
                                <th className="text-center">{t.techwatches.table.content}</th>
                                <th>{t.techwatches.table.activity}</th>
                                <th className="text-right">{t.techwatches.table.actions}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="text-center py-12 text-muted-foreground italic">
                                        {t.techwatches.table.empty}
                                    </td>
                                </tr>
                            ) : filtered.map((tw) => {
                                const hasActivity = tw._count.articles > 0 || tw._count.tasks > 0 || tw._count.resources > 0
                                const userInitial = (tw.user?.name || tw.user?.email || '?').charAt(0).toUpperCase()

                                return (
                                    <tr key={tw.id} className="group">
                                        <td>
                                            <div className="flex items-center gap-3">
                                                {tw.logoUrl && !logoErrors[tw.id] ? (
                                                    <div className="flex-shrink-0 w-10 h-10 rounded-xl overflow-hidden border border-white/10 bg-white/5 shadow-inner">
                                                        <img
                                                            src={tw.logoUrl}
                                                            alt={tw.name ?? ""}
                                                            className="w-full h-full object-cover"
                                                            onError={() => setLogoErrors(prev => ({ ...prev, [tw.id]: true }))}
                                                        />
                                                    </div>
                                                ) : (
                                                    <div className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center shadow-inner border border-white/5" style={{ backgroundColor: tw.color || 'var(--brand)' }}>
                                                        <span className="text-lg">{tw.iconEmoji || '📦'}</span>
                                                    </div>
                                                )}
                                                <div>
                                                    <div className="font-bold text-[var(--page-fg)] flex items-center gap-2">
                                                        {tw.name}
                                                        {hasActivity && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" title="Actif récemment"></span>}
                                                    </div>
                                                    <div className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{tw.description || "Aucune description"}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="flex items-center gap-2">
                                                <Avatar className="h-7 w-7 border border-white/10">
                                                    {tw.user?.image ? (
                                                        <AvatarImage src={tw.user.image} alt={tw.user.name || ''} />
                                                    ) : (
                                                        <AvatarFallback className="text-[10px] bg-slate-800 text-slate-300">{userInitial}</AvatarFallback>
                                                    )}
                                                </Avatar>
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-medium text-[var(--page-fg)]">{tw.user?.name || '—'}</span>
                                                    <span className="text-[10px] text-muted-foreground">{tw.user?.email}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="flex items-center justify-center gap-3">
                                                <div className="flex flex-col items-center" title="Articles">
                                                    {tw._count.articles > 0 ? (
                                                        <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 gap-1 px-1.5 py-0">
                                                            <FileText className="w-3 h-3" /> {tw._count.articles}
                                                        </Badge>
                                                    ) : (
                                                        <span className="text-[10px] text-muted-foreground opacity-60 font-mono">0 art.</span>
                                                    )}
                                                </div>
                                                <div className="flex flex-col items-center" title="Tâches">
                                                    {tw._count.tasks > 0 ? (
                                                        <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 gap-1 px-1.5 py-0">
                                                            <CheckCircle2 className="w-3 h-3" /> {tw._count.tasks}
                                                        </Badge>
                                                    ) : (
                                                        <span className="text-[10px] text-muted-foreground opacity-60 font-mono">0 task</span>
                                                    )}
                                                </div>
                                                <div className="flex flex-col items-center" title="Ressources">
                                                    {tw._count.resources > 0 ? (
                                                        <Badge variant="outline" className="bg-amber-500/10 text-amber-400 border-amber-500/20 gap-1 px-1.5 py-0">
                                                            <Folder className="w-3 h-3" /> {tw._count.resources}
                                                        </Badge>
                                                    ) : (
                                                        <span className="text-[10px] text-muted-foreground opacity-60 font-mono">0 res.</span>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="flex flex-col gap-0.5">
                                                <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                                                    <Activity className="w-3 h-3 text-muted-foreground" />
                                                    {t.techwatches.table.created}: <span className="text-[var(--page-fg)] font-medium opacity-80">{new Date(tw.createdAt).toLocaleDateString()}</span>
                                                </span>
                                                <span className="text-[10px] text-muted-foreground opacity-60 pl-4.5">
                                                    {t.techwatches.table.updated}: {new Date(tw.updatedAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-[var(--glass-hover)] data-[state=open]:bg-[var(--glass-hover)]">
                                                        <span className="sr-only">Open menu</span>
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-[160px] bg-[var(--card-bg)] border-[var(--glass-border)] text-white">
                                                    <DropdownMenuLabel className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Actions</DropdownMenuLabel>
                                                    <DropdownMenuSeparator className="bg-[var(--glass-border)]" />
                                                    <DropdownMenuItem
                                                        onClick={() => handleViewDetails(tw)}
                                                        className="hover:bg-white/5 cursor-pointer gap-2"
                                                    >
                                                        <Eye className="w-4 h-4 text-primary" />
                                                        Voir les détails
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={() => handleOpenClient(tw.id)}
                                                        className="hover:bg-white/5 cursor-pointer gap-2"
                                                    >
                                                        <ExternalLink className="w-4 h-4 text-blue-400" />
                                                        Ouvrir Client
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator className="bg-[var(--glass-border)]" />
                                                    <DropdownMenuItem
                                                        onClick={() => handleDelete(tw.id)}
                                                        disabled={isPending}
                                                        className="text-red-400 focus:text-red-400 focus:bg-red-500/10 cursor-pointer gap-2"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                        Supprimer
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            <TechWatchDetailSheet
                techWatch={selectedTW}
                isOpen={isSheetOpen}
                onClose={() => setIsSheetOpen(false)}
            />

            <ConfirmModal
                isOpen={!!deleteId}
                variant="danger"
                title="Supprimer la TechWatche"
                description="Êtes-vous sûr de vouloir supprimer cette TechWatche ? Cette action est irréversible et supprimera tous les articles et tâches associés."
                confirmLabel="Supprimer"
                onConfirm={confirmDelete}
                onCancel={() => setDeleteId(null)}
                isPending={isPending}
            />
        </div>
    )
}
