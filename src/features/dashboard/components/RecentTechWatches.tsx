import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Database } from 'lucide-react'
import { LottieEmpty } from '@/components/ui/LottieEmpty'

interface RecentTechWatchesProps {
    techWatches: Array<{
        id: string
        name: string
        createdAt: Date
        user: { name: string | null }
        _count: { articles: number; tasks: number }
    }>
}

export function RecentTechWatches({ techWatches }: RecentTechWatchesProps) {
    return (
        <div className="rounded-2xl border bg-[var(--card-bg)] shadow-sm overflow-hidden"
            style={{ borderColor: 'var(--glass-border)' }}>
            <div className="flex items-center gap-2 p-5 border-b" style={{ borderColor: 'var(--glass-border)' }}>
                <div className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                    <Database className="w-4 h-4 text-emerald-500" />
                </div>
                <h2 className="text-[15px] font-semibold">Dernières TechWatches</h2>
            </div>
            <div className="overflow-x-auto">
                {techWatches.length === 0 ? (
                    <LottieEmpty message="Aucune veille récente." size={150} />
                ) : (
                    <table className="premium-table">
                        <thead>
                            <tr>
                                <th className="w-[40%]">Sujet</th>
                                <th>Créateur</th>
                                <th className="text-center">Articles</th>
                                <th className="text-center">Tâches</th>
                                <th className="text-right">Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {techWatches.map((tw) => (
                                <tr key={tw.id}>
                                    <td className="font-medium text-[var(--page-fg)] truncate max-w-[200px]">
                                        {tw.name}
                                    </td>
                                    <td>
                                        <div className="text-xs">{tw.user.name || 'Inconnu'}</div>
                                    </td>
                                    <td className="text-center font-mono text-xs">{tw._count.articles}</td>
                                    <td className="text-center font-mono text-xs">{tw._count.tasks}</td>
                                    <td className="text-right text-xs text-muted-foreground whitespace-nowrap">
                                        {formatDistanceToNow(new Date(tw.createdAt), { addSuffix: true, locale: fr })}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    )
}
