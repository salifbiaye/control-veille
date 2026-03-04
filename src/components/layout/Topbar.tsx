'use client'

import { useState, useCallback } from 'react'
import { usePathname } from 'next/navigation'
import { ChevronRight, Search, Shield } from 'lucide-react'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { CommandPalette } from '@/components/ui/CommandPalette'
import { HelpModal } from '@/components/ui/HelpModal'
import { useAdminShortcuts } from '@/hooks/useAdminShortcuts'
import { useLocale, useT } from '@/lib/i18n/locale-context'
import { UserMenu } from './UserMenu'
import { LanguageSwitcher } from './LanguageSwitcher'

interface TopbarProps {
  userName?: string | null
  userEmail?: string | null
}

export function Topbar({ userName, userEmail }: TopbarProps) {
  const pathname = usePathname()
  const { locale } = useLocale()
  const t = useT()

  const [cmdOpen, setCmdOpen] = useState(false)
  const [helpOpen, setHelpOpen] = useState(false)

  const openCmd = useCallback(() => setCmdOpen(true), [])
  const openHelp = useCallback(() => setHelpOpen(true), [])
  const closeAll = useCallback(() => { setCmdOpen(false); setHelpOpen(false) }, [])

  useAdminShortcuts({ onOpenCommandPalette: openCmd, onOpenHelp: openHelp, onCloseAll: closeAll })

  // Build breadcrumb
  const segments = pathname.split('/').filter(Boolean)
  const crumbs: { label: string; href: string }[] = []
  let accumulated = ''
  for (const seg of segments) {
    accumulated += `/${seg}`
    const entryKey = seg === 'dashboard' ? 'dashboard' : seg
    const label = (t.topbar.breadcrumb as any)[entryKey] || seg
    crumbs.push({ label, href: accumulated })
  }

  return (
    <>
      <header
        className="fixed top-0 left-0 lg:left-56 right-0 z-40 h-14 flex items-center justify-between px-4 sm:px-6 gap-4"
        style={{
          background: 'rgba(10,10,18,0.92)',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        {/* Left: breadcrumb */}
        <nav className="flex items-center gap-1.5 min-w-0 flex-1">
          <Shield className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--brand)' }} />
          <div className="hidden sm:flex items-center gap-1.5 min-w-0">
            {crumbs.map((crumb, i) => (
              <span key={crumb.href} className="flex items-center gap-1.5 min-w-0">
                {i > 0 && <ChevronRight className="w-3.5 h-3.5 flex-shrink-0" style={{ color: 'rgba(255,255,255,0.20)' }} />}
                <span
                  className="text-[13px] whitespace-nowrap overflow-hidden text-ellipsis"
                  style={{
                    fontWeight: i === crumbs.length - 1 ? 600 : 400,
                    color: i === crumbs.length - 1 ? 'rgba(248,250,252,0.95)' : 'rgba(248,250,252,0.50)',
                  }}
                >
                  {crumb.label}
                </span>
              </span>
            ))}
          </div>
        </nav>

        {/* Right: controls */}
        <div className="ml-auto flex items-center gap-3">
          {/* Search */}
          <button
            onClick={openCmd}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm border transition-colors hover:opacity-80"
            style={{
              borderColor: 'rgba(255,255,255,0.10)',
              color: 'rgba(248,250,252,0.60)',
              background: 'rgba(255,255,255,0.05)',
            }}
          >
            <Search className="w-3.5 h-3.5" />
            <span className="hidden sm:block text-xs">{t.topbar.search}</span>
            <kbd
              className="hidden sm:flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 rounded"
              style={{
                background: 'rgba(255,255,255,0.08)',
                color: 'rgba(248,250,252,0.60)',
                border: '1px solid rgba(255,255,255,0.10)',
              }}
            >
              ⌃K
            </kbd>
          </button>

          <LanguageSwitcher />
          <ThemeToggle />
          <UserMenu user={{ name: userName, email: userEmail || 'admin@techwatch.fr' }} />
        </div>
      </header>

      <CommandPalette open={cmdOpen} onClose={() => setCmdOpen(false)} onOpenHelp={openHelp} />
      <HelpModal open={helpOpen} onClose={() => setHelpOpen(false)} />
    </>
  )
}
