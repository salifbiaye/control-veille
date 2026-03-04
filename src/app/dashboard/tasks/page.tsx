import { TaskManager } from '@/components/tasks/TaskManager'
import { cookies } from 'next/headers'
import { getT, type Locale } from '@/lib/i18n'

export default async function TasksPage() {
  const cookieStore = await cookies()
  const lang = (cookieStore.get('NEXT_LOCALE')?.value as Locale) || 'fr'
  const t = getT(lang)

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">{t.hero.tasks.title}</h1>
        <p className="text-muted-foreground mt-2">
          {t.hero.tasks.description}
        </p>
      </div>

      <TaskManager />
    </div>
  )
}
