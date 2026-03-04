import { Shield } from 'lucide-react'

export function SystemStatus() {
    return (
        <div className="rounded-2xl border bg-[var(--card-bg)] shadow-sm p-6" style={{ borderColor: 'var(--glass-border)' }}>
            <div className="flex items-center gap-2 mb-6">
                <Shield className="w-4 h-4 text-primary" />
                <h2 className="text-[15px] font-semibold">État du Système</h2>
            </div>
            <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-xl border" style={{ borderColor: 'var(--glass-border)', background: 'rgba(255,255,255,0.02)' }}>
                    <div className="flex items-center gap-3">
                        <span className="relative flex h-2.5 w-2.5"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span></span>
                        <span className="text-sm font-medium">PostgreSQL Database</span>
                    </div>
                    <span className="text-xs font-semibold text-emerald-500 tracking-wider">OK</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl border" style={{ borderColor: 'var(--glass-border)', background: 'rgba(255,255,255,0.02)' }}>
                    <div className="flex items-center gap-3">
                        <span className="relative flex h-2.5 w-2.5"><span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" style={{ boxShadow: '0 0 10px #10B981' }}></span></span>
                        <span className="text-sm font-medium">Better-Auth Session</span>
                    </div>
                    <span className="text-xs font-semibold text-emerald-500 tracking-wider">SECURE</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl border" style={{ borderColor: 'var(--glass-border)', background: 'rgba(255,255,255,0.02)' }}>
                    <div className="flex items-center gap-3">
                        <span className="relative flex h-2.5 w-2.5"><span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" style={{ boxShadow: '0 0 10px #10B981' }}></span></span>
                        <span className="text-sm font-medium">Stripe Webhooks</span>
                    </div>
                    <span className="text-xs font-semibold text-emerald-500 tracking-wider">OK</span>
                </div>
            </div>
        </div>
    )
}
