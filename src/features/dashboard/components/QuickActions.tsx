import Link from 'next/link'
import { Users, Database, BarChart3, Settings } from 'lucide-react'

export function QuickActions() {
    return (
        <div className="rounded-2xl border bg-[var(--card-bg)] shadow-sm p-6" style={{ borderColor: 'var(--glass-border)' }}>
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-[15px] font-semibold">Raccourcis</h2>
                <span className="text-[10px] font-mono tracking-widest text-muted-foreground bg-[rgba(255,255,255,0.05)] px-2 py-0.5 rounded border border-[rgba(255,255,255,0.1)]">
                    Ctrl+K
                </span>
            </div>
            <div className="grid grid-cols-2 gap-3">
                <Link href="/dashboard/users" className="group flex flex-col items-center gap-2 p-4 rounded-xl border transition-all hover:-translate-y-1 hover:border-primary/50 hover:bg-primary/5" style={{ borderColor: 'var(--chrome-border)', background: 'rgba(255,255,255,0.01)' }}>
                    <div className="p-2 rounded-lg bg-primary/10 text-primary transition-transform group-hover:scale-110"><Users className="w-5 h-5" /></div>
                    <span className="text-xs font-medium">Utilisateurs</span>
                </Link>
                <Link href="/dashboard/techwatches" className="group flex flex-col items-center gap-2 p-4 rounded-xl border transition-all hover:-translate-y-1 hover:border-emerald-500/50 hover:bg-emerald-500/5" style={{ borderColor: 'var(--chrome-border)', background: 'rgba(255,255,255,0.01)' }}>
                    <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500 transition-transform group-hover:scale-110"><Database className="w-5 h-5" /></div>
                    <span className="text-xs font-medium">TechWatches</span>
                </Link>
                <Link href="/dashboard/analytics" className="group flex flex-col items-center gap-2 p-4 rounded-xl border transition-all hover:-translate-y-1 hover:border-primary/50 hover:bg-primary/5" style={{ borderColor: 'var(--chrome-border)', background: 'rgba(255,255,255,0.01)' }}>
                    <div className="p-2 rounded-lg bg-primary/10 text-primary transition-transform group-hover:scale-110"><BarChart3 className="w-5 h-5" /></div>
                    <span className="text-xs font-medium">Analytics</span>
                </Link>
                <Link href="/dashboard/settings" className="group flex flex-col items-center gap-2 p-4 rounded-xl border transition-all hover:-translate-y-1 hover:border-slate-500/50 hover:bg-slate-500/5" style={{ borderColor: 'var(--chrome-border)', background: 'rgba(255,255,255,0.01)' }}>
                    <div className="p-2 rounded-lg bg-slate-500/10 text-slate-400 transition-transform group-hover:scale-110"><Settings className="w-5 h-5" /></div>
                    <span className="text-xs font-medium">Paramètres</span>
                </Link>
            </div>
        </div>
    )
}
