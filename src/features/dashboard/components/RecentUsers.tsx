import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Users } from 'lucide-react'
import { LottieEmpty } from '@/components/ui/LottieEmpty'

interface RecentUsersProps {
    users: Array<{
        id: string
        name: string | null
        email: string
        createdAt: Date
        subscription?: {
            plan?: {
                name: string
            } | null
        } | null
    }>
}

export function RecentUsers({ users }: RecentUsersProps) {
    return (
        <div className="rounded-2xl border bg-[var(--card-bg)] shadow-sm overflow-hidden"
            style={{ borderColor: 'var(--glass-border)' }}>
            <div className="flex items-center gap-2 p-5 border-b" style={{ borderColor: 'var(--glass-border)' }}>
                <div className="p-1.5 rounded-lg bg-primary/10 border border-primary/20">
                    <Users className="w-4 h-4 text-primary" />
                </div>
                <h2 className="text-[15px] font-semibold">Nouveaux Inscrits</h2>
            </div>
            <div className="overflow-x-auto">
                {users.length === 0 ? (
                    <LottieEmpty message="Aucune activité récente." size={150} />
                ) : (
                    <table className="premium-table">
                        <thead>
                            <tr>
                                <th className="w-1/2">Utilisateur</th>
                                <th>Plan</th>
                                <th className="text-right">Inscription</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((user) => (
                                <tr key={user.id}>
                                    <td>
                                        <div className="font-medium text-[var(--page-fg)]">{user.name || 'Sans nom'}</div>
                                        <div className="text-xs text-muted-foreground mt-0.5">{user.email}</div>
                                    </td>
                                    <td>
                                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border bg-[rgba(255,255,255,0.03)] border-[var(--chrome-border)] text-muted-foreground">
                                            {user.subscription?.plan?.name || 'Free'}
                                        </span>
                                    </td>
                                    <td className="text-right text-xs text-muted-foreground">
                                        {formatDistanceToNow(new Date(user.createdAt), { addSuffix: true, locale: fr })}
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
