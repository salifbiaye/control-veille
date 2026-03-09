import { useState } from 'react'

import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription
} from '@/components/ui/sheet'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Calendar, FileText, CheckCircle2, Folder, User, Globe, Tag } from 'lucide-react'
import { useT } from '@/lib/i18n/locale-context'

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

interface TechWatchDetailSheetProps {
    techWatch: TechWatch | null
    isOpen: boolean
    onClose: () => void
}

export function TechWatchDetailSheet({ techWatch, isOpen, onClose }: TechWatchDetailSheetProps) {
    const t = useT()
    const [logoError, setLogoError] = useState(false)

    if (!techWatch) return null

    const userInitial = (techWatch.user?.name || techWatch.user?.email || '?').charAt(0).toUpperCase()

    return (
        <Sheet open={isOpen} onOpenChange={onClose}>
            <SheetContent className="bg-[var(--card-bg)] border-[var(--glass-border)] text-[var(--page-fg)] sm:max-w-md overflow-y-auto">
                <SheetHeader className="pb-6 border-b border-[var(--glass-border)]">
                    <div className="flex items-center gap-4 text-left">
                        {techWatch.logoUrl && !logoError ? (
                            <div className="w-16 h-16 rounded-2xl overflow-hidden border border-white/10 shadow-lg bg-white/5">
                                <img
                                    src={techWatch.logoUrl}
                                    alt={techWatch.name}
                                    className="w-full h-full object-cover"
                                    onError={() => setLogoError(true)}
                                />
                            </div>
                        ) : (
                            <div
                                className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-lg border border-white/10"
                                style={{ backgroundColor: techWatch.color || 'var(--brand)' }}
                            >
                                {techWatch.iconEmoji || '📦'}
                            </div>
                        )}
                        <div>
                            <SheetTitle className="text-2xl font-bold text-[var(--page-fg)]">{techWatch.name}</SheetTitle>
                            <SheetDescription className="text-muted-foreground mt-1 font-mono text-[10px] opacity-70">
                                {techWatch.id}
                            </SheetDescription>
                        </div>
                    </div>
                </SheetHeader>

                <div className="py-8 space-y-8">
                    {/* Propriétaire */}
                    <div className="space-y-3">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                            <User className="w-3 h-3" />
                            Propriétaire
                        </h4>
                        <div className="flex items-center gap-3 p-3 rounded-xl bg-[var(--page-fg)]/[0.03] border border-[var(--glass-border)]">
                            <Avatar className="h-10 w-10 border border-white/10">
                                {techWatch.user?.image ? (
                                    <AvatarImage src={techWatch.user.image} alt={techWatch.user.name || ''} />
                                ) : (
                                    <AvatarFallback className="bg-slate-800 text-slate-300">{userInitial}</AvatarFallback>
                                )}
                            </Avatar>
                            <div className="flex flex-col">
                                <span className="font-semibold text-[var(--page-fg)]">{techWatch.user?.name || '—'}</span>
                                <span className="text-xs text-muted-foreground">{techWatch.user?.email}</span>
                            </div>
                        </div>
                    </div>

                    {/* Description */}
                    <div className="space-y-3">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                            <FileText className="w-3 h-3" />
                            Description
                        </h4>
                        <p className="text-sm leading-relaxed text-[var(--page-fg)] opacity-70 bg-[var(--page-fg)]/[0.03] p-4 rounded-xl italic border border-[var(--glass-border)]">
                            {techWatch.description || "Aucune description fournie pour cette veille."}
                        </p>
                    </div>

                    {/* Statistiques */}
                    <div className="space-y-3">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                            <Tag className="w-3 h-3" />
                            Contenu & Statistiques
                        </h4>
                        <div className="grid grid-cols-3 gap-3">
                            <div className="bg-[var(--page-fg)]/[0.03] border border-[var(--glass-border)] rounded-xl p-3 flex flex-col items-center gap-1">
                                <FileText className="w-4 h-4 text-primary" />
                                <span className="text-lg font-bold text-[var(--page-fg)]">{techWatch._count.articles}</span>
                                <span className="text-[10px] uppercase text-muted-foreground">Articles</span>
                            </div>
                            <div className="bg-[var(--page-fg)]/[0.03] border border-[var(--glass-border)] rounded-xl p-3 flex flex-col items-center gap-1">
                                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                <span className="text-lg font-bold text-[var(--page-fg)]">{techWatch._count.tasks}</span>
                                <span className="text-[10px] uppercase text-muted-foreground">Tâches</span>
                            </div>
                            <div className="bg-[var(--page-fg)]/[0.03] border border-[var(--glass-border)] rounded-xl p-3 flex flex-col items-center gap-1">
                                <Folder className="w-4 h-4 text-amber-400" />
                                <span className="text-lg font-bold text-[var(--page-fg)]">{techWatch._count.resources}</span>
                                <span className="text-[10px] uppercase text-muted-foreground">Ressources</span>
                            </div>
                        </div>
                    </div>

                    {/* Métadonnées */}
                    <div className="space-y-3 pt-4">
                        <div className="flex items-center justify-between text-xs py-2 border-b border-[var(--glass-border)]">
                            <span className="text-muted-foreground flex items-center gap-2">
                                <Calendar className="w-3 h-3" /> Créé le
                            </span>
                            <span className="text-[var(--page-fg)] font-medium opacity-80">{new Date(techWatch.createdAt).toLocaleString()}</span>
                        </div>
                        <div className="flex items-center justify-between text-xs py-2 border-b border-[var(--glass-border)]">
                            <span className="text-muted-foreground flex items-center gap-2">
                                <Globe className="w-3 h-3" /> Dernière mise à jour
                            </span>
                            <span className="text-[var(--page-fg)] font-medium opacity-80">{new Date(techWatch.updatedAt).toLocaleString()}</span>
                        </div>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    )
}
