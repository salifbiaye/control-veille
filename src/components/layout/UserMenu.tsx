'use client'
import { useState, useRef, useEffect } from 'react'
import { LogOut, User } from 'lucide-react'
import { authClient } from '@/lib/auth-client'
import { useRouter } from 'next/navigation'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { useLocale } from '@/lib/i18n/locale-provider'
import { getT } from '@/lib/i18n'

interface UserMenuProps {
  user: {
    name?: string | null
    email: string
  }
}

function getInitials(name: string | null | undefined, email: string): string {
  if (name && name.trim()) {
    const parts = name.trim().split(' ')
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    }
    return name.substring(0, 2).toUpperCase()
  }
  return email.substring(0, 2).toUpperCase()
}

export function UserMenu({ user }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const { locale } = useLocale()
  const t = getT(locale)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  async function handleLogout() {
    await authClient.signOut()
    router.push('/login')
  }

  const initials = getInitials(user.name, user.email)

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="hover:opacity-80 transition-opacity"
      >
        <Avatar className="w-8 h-8">
          <AvatarFallback
            className="text-xs font-semibold text-white"
            style={{ background: '#64748B' }}
          >
            {initials}
          </AvatarFallback>
        </Avatar>
      </button>

      {isOpen && (
        <div
          className="absolute right-0 mt-2 w-56 rounded-xl border shadow-lg overflow-hidden"
          style={{ background: 'rgba(14,14,24,0.95)', borderColor: 'rgba(255,255,255,0.10)' }}
        >
          <div className="p-3 border-b" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
            <div className="flex items-center gap-3">
              <Avatar className="w-10 h-10">
                <AvatarFallback
                  className="text-sm font-semibold text-white"
                  style={{ background: '#64748B' }}
                >
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                {user.name && (
                  <p className="text-sm font-medium truncate" style={{ color: 'rgba(248,250,252,0.90)' }}>
                    {user.name}
                  </p>
                )}
                <p className="text-xs truncate" style={{ color: 'rgba(248,250,252,0.55)' }}>
                  {user.email}
                </p>
              </div>
            </div>
          </div>

          <div className="p-1">
            <button
              onClick={() => {
                setIsOpen(false)
                router.push('/settings')
              }}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors"
              style={{
                color: 'rgba(248,250,252,0.70)',
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <User className="w-4 h-4" />
              {t.nav.settings}
            </button>

            <div className="my-1 border-t" style={{ borderColor: 'rgba(255,255,255,0.08)' }} />

            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors hover:bg-red-500/10 text-red-500"
            >
              <LogOut className="w-4 h-4" />
              {t.actions.logout}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
