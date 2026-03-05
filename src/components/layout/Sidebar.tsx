'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Users,
  Settings,
  Database,
  BarChart3,
  Shield,
  CreditCard,
  Receipt,
} from 'lucide-react'
import { ADMIN_PERMISSIONS, AdminRole, hasPermission } from '@/lib/permissions'
import { AdminLogoutButton } from '@/components/auth/AdminLogoutButton'
import { ThemeToggle } from '@/components/ui/ThemeToggle'

const BRAND_COLOR = 'var(--brand)'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, exact: true, permission: 'VIEW_DASHBOARD' as const },
  { name: 'Utilisateurs', href: '/dashboard/users', icon: Users, permission: 'VIEW_USERS' as const },
  { name: 'Plans & Tarifs', href: '/dashboard/pricing', icon: CreditCard, permission: 'VIEW_PLANS' as const },
  { name: 'Souscriptions', href: '/dashboard/subscriptions', icon: Receipt, permission: 'VIEW_ANALYTICS' as const },
  { name: 'TechWatch', href: '/dashboard/techwatches', icon: Database, permission: 'VIEW_TECHWATCHES' as const },
  { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3, permission: 'VIEW_ANALYTICS' as const },
  { name: 'Paramètres', href: '/dashboard/settings', icon: Settings, permission: 'VIEW_SETTINGS' as const },
]

interface SidebarProps {
  user?: {
    name: string
    email: string
    image?: string | null
    role?: string
  }
}

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname()

  const userName = user?.name || 'Admin'
  const userRole = (user?.role || 'SUPER_ADMIN').replace(/_/g, ' ')
  const userInitial = userName.charAt(0).toUpperCase()

  return (
    <aside
      className="fixed left-0 top-0 bottom-0 w-56 flex flex-col z-50 hidden lg:flex"
      style={{
        background: 'var(--chrome-bg, rgba(8,8,15,0.97))',
        borderRight: '1px solid rgba(255,255,255,0.07)',
      }}
    >
      {/* Logo / Brand */}
      <div
        className="h-14 flex items-center px-4 gap-2.5 flex-shrink-0"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}
      >
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{
            background: `color-mix(in srgb, ${BRAND_COLOR} 13%, transparent)`,
            border: `1px solid color-mix(in srgb, ${BRAND_COLOR} 27%, transparent)`,
          }}
        >
          <Shield className="w-4 h-4" style={{ color: BRAND_COLOR }} />
        </div>
        <div className="min-w-0">
          <p className="font-bold text-sm truncate" style={{ color: '#F8FAFC' }}>
            TechWatch
          </p>
          <span
            className="text-[10px] px-1.5 py-0.5 rounded font-semibold uppercase tracking-wider"
            style={{
              background: `color-mix(in srgb, ${BRAND_COLOR} 13%, transparent)`,
              color: 'var(--brand-light)',
              border: `1px solid color-mix(in srgb, ${BRAND_COLOR} 20%, transparent)`,
            }}
          >
            Admin
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
        <p
          className="px-2 mb-2 text-[10px] font-semibold uppercase tracking-widest"
          style={{ color: 'rgba(248,250,252,0.30)' }}
        >
          Navigation
        </p>

        {navigation.filter(item => hasPermission(user?.role as AdminRole || 'READ_ONLY', item.permission)).map(({ href, name, icon: Icon, exact }) => {
          const isActive = exact
            ? pathname === href
            : pathname.startsWith(href)

          return (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all"
              style={
                isActive
                  ? {
                    background: `color-mix(in srgb, ${BRAND_COLOR} 18%, transparent)`,
                    border: `1px solid color-mix(in srgb, ${BRAND_COLOR} 30%, transparent)`,
                    color: '#fff',
                  }
                  : {
                    color: 'rgba(248,250,252,0.60)',
                    border: '1px solid transparent',
                  }
              }
              onMouseEnter={e => {
                if (!isActive) {
                  const el = e.currentTarget as HTMLElement
                  el.style.color = '#F8FAFC'
                  el.style.background = 'rgba(255,255,255,0.05)'
                }
              }}
              onMouseLeave={e => {
                if (!isActive) {
                  const el = e.currentTarget as HTMLElement
                  el.style.color = 'rgba(248,250,252,0.60)'
                  el.style.background = 'transparent'
                }
              }}
            >
              <span
                className="flex-shrink-0 p-1.5 rounded-md"
                style={{ background: 'rgba(255,255,255,0.05)' }}
              >
                <Icon
                  className="w-3.5 h-3.5"
                  style={{ color: isActive ? 'var(--brand-light)' : 'rgba(248,250,252,0.65)' }}
                />
              </span>
              <span className="flex-1">{name}</span>
            </Link>
          )
        })}
      </nav>

      {/* Footer: user info + ThemeToggle + logout */}
      <div
        className="px-4 py-3 flex-shrink-0"
        style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}
      >
        <div className="flex items-center gap-2.5">
          <Link href="/dashboard/settings" className="flex items-center gap-2.5 min-w-0 flex-1 hover:bg-[rgba(255,255,255,0.05)] p-1 rounded-md transition-colors cursor-pointer group">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 overflow-hidden"
              style={{
                background: `color-mix(in srgb, ${BRAND_COLOR} 20%, transparent)`,
                color: 'var(--brand-light)',
              }}
            >
              {user?.image && !user.image.includes('googleusercontent.com') ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={user.image} alt={userName} className="w-7 h-7 object-cover" />
              ) : (
                userInitial
              )}
            </div>
            <div className="min-w-0 flex-1 group-hover:opacity-80 transition-opacity">
              <p className="text-xs font-medium truncate" style={{ color: '#F8FAFC' }}>
                {userName}
              </p>
              <p className="text-[10px] truncate" style={{ color: 'rgba(248,250,252,0.40)' }}>
                {userRole}
              </p>
            </div>
            <Settings className="w-4 h-4 text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity" />
          </Link>
          <div className="flex items-center gap-1 flex-shrink-0">
            <ThemeToggle />
            <AdminLogoutButton />
          </div>
        </div>
      </div>
    </aside>
  )
}

