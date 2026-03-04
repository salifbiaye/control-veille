import { Database, Plus, Edit, Trash2, Eye, Activity, FileText, CheckCircle2, MessageSquare, Folder } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { PageHero } from '@/components/ui/PageHero'
import { getTechWatches } from '@/features/techwatches/actions/techwatches.actions'
import { cookies } from 'next/headers'
import { getT, type Locale } from '@/lib/i18n'
import { requirePermission } from '@/lib/session'

export default async function TechWatchesPage() {
  await requirePermission('VIEW_TECHWATCHES')
  const cookieStore = await cookies()
  const lang = (cookieStore.get('NEXT_LOCALE')?.value as Locale) || 'fr'
  const t = getT(lang)

  const { techWatches = [] } = await getTechWatches()

  const activeCount = techWatches?.filter((t: any) => t._count?.articles > 0 || t._count?.tasks > 0).length || 0

  return (
    <div className="animate-slide-up-fade">
      <PageHero
        title={t.hero.techwatches.title}
        description={t.hero.techwatches.description}
        label={t.nav.techwatches}
      />
      <div className="page-container" style={{ paddingTop: '0' }}>
        <div className="admin-card overflow-hidden">
          <div className="mb-6 flex items-center justify-between border-b border-[var(--glass-border)] pb-4">
            <div>
              <h2 className="text-xl font-bold text-[var(--page-fg)] flex items-center gap-2">
                <Database className="w-5 h-5 text-primary" />
                Liste des TechWatches
              </h2>
              <p className="text-sm text-muted-foreground mt-1">Gérez et consultez les détails des veilles des utilisateurs.</p>
            </div>
            {/* The Plus button would normally open a modal. For now, it's just visual in the admin panel. */}
          </div>

          <div className="overflow-x-auto rounded-xl border border-[var(--glass-border)] mt-4">
            <table className="premium-table">
              <thead>
                <tr>
                  <th className="w-[35%]">Projet TechWatch</th>
                  <th>Propriétaire</th>
                  <th className="text-center">Contenu</th>
                  <th>Activité</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {techWatches?.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-12 text-muted-foreground italic">
                      Aucune TechWatch n'a été trouvée dans la base de données.
                    </td>
                  </tr>
                ) : techWatches?.map((tw: any) => {
                  const hasActivity = tw._count.articles > 0 || tw._count.tasks > 0 || tw._count.resources > 0
                  const userInitial = (tw.user?.name || tw.user?.email || '?').charAt(0).toUpperCase()

                  return (
                    <tr key={tw.id} className="group">
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center shadow-inner border border-white/5" style={{ backgroundColor: tw.color || 'var(--brand)' }}>
                            <span className="text-lg">{tw.iconEmoji || '📦'}</span>
                          </div>
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
                            <span className="text-sm font-medium text-slate-200">{tw.user?.name || '—'}</span>
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
                              <span className="text-[10px] text-slate-600 font-mono">0 art.</span>
                            )}
                          </div>
                          <div className="flex flex-col items-center" title="Tâches">
                            {tw._count.tasks > 0 ? (
                              <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 gap-1 px-1.5 py-0">
                                <CheckCircle2 className="w-3 h-3" /> {tw._count.tasks}
                              </Badge>
                            ) : (
                              <span className="text-[10px] text-slate-600 font-mono">0 task</span>
                            )}
                          </div>
                          <div className="flex flex-col items-center" title="Ressources">
                            {tw._count.resources > 0 ? (
                              <Badge variant="outline" className="bg-amber-500/10 text-amber-400 border-amber-500/20 gap-1 px-1.5 py-0">
                                <Folder className="w-3 h-3" /> {tw._count.resources}
                              </Badge>
                            ) : (
                              <span className="text-[10px] text-slate-600 font-mono">0 res.</span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="flex flex-col gap-0.5">
                          <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                            <Activity className="w-3 h-3 text-slate-400" />
                            Créé le: <span className="text-slate-300 font-medium">{new Date(tw.createdAt).toLocaleDateString('fr-FR')}</span>
                          </span>
                          <span className="text-[10px] text-slate-500 pl-4.5">
                            Maj: {new Date(tw.updatedAt).toLocaleDateString('fr-FR')}
                          </span>
                        </div>
                      </td>
                      <td className="text-right">
                        <div className="flex justify-end gap-1.5">
                          <Button size="icon" variant="outline" title="Voir les détails" className="w-8 h-8 bg-[rgba(255,255,255,0.02)] border-[var(--glass-border)] hover:bg-primary/10 hover:text-primary hover:border-primary/30 transition-colors">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button size="icon" variant="outline" title="Supprimer la TechWatch" className="w-8 h-8 bg-transparent border-transparent text-muted-foreground hover:text-red-400 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
