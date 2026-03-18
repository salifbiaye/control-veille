'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
    LayoutDashboard,
    Users,
    Settings,
    Database,
    BarChart3,
    CreditCard,
    Receipt,
    ChevronRight,
    PanelLeftClose,
} from 'lucide-react'
import Image from 'next/image'
import { ADMIN_PERMISSIONS, AdminRole, hasPermission } from '@/lib/permissions'
import { AdminLogoutButton } from '@/components/auth/AdminLogoutButton'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { useSidebar } from './SidebarLayout'
import { cn } from '@/lib/utils'
import { useT } from '@/lib/i18n/locale-context'

const BRAND_COLOR = 'var(--brand)'

const NAV_ITEMS = [
    { key: 'dashboard' as const, href: '/dashboard', icon: LayoutDashboard, exact: true, permission: 'VIEW_DASHBOARD' as const },
    { key: 'users' as const, href: '/dashboard/users', icon: Users, permission: 'VIEW_USERS' as const },
    { key: 'pricing' as const, href: '/dashboard/pricing', icon: CreditCard, permission: 'VIEW_PLANS' as const },
    { key: 'subscriptions' as const, href: '/dashboard/subscriptions', icon: Receipt, permission: 'VIEW_ANALYTICS' as const },
    { key: 'techwatches' as const, href: '/dashboard/techwatches', icon: Database, permission: 'VIEW_TECHWATCHES' as const },
    { key: 'analytics' as const, href: '/dashboard/analytics', icon: BarChart3, permission: 'VIEW_ANALYTICS' as const },
    { key: 'settings' as const, href: '/dashboard/settings', icon: Settings, permission: 'VIEW_SETTINGS' as const },
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
    const { isMinimized, toggleSidebar } = useSidebar()
    const t = useT()

    const userName = user?.name || 'Admin'
    const userRole = (user?.role || 'SUPER_ADMIN').replace(/_/g, ' ')
    const userInitial = userName.charAt(0).toUpperCase()

    const minGap = isMinimized ? '!gap-0 justify-center group-hover:!gap-2.5 group-hover:justify-start' : ''
    const minPad = isMinimized ? '!px-0 group-hover:!px-3' : ''
    const minText = isMinimized
        ? 'max-w-0 opacity-0 group-hover:max-w-[140px] group-hover:opacity-100 flex-none'
        : 'flex-1 opacity-100'

    return (
        <aside
            className={cn(
                'fixed left-0 top-0 bottom-0 z-50 flex flex-col hidden lg:flex group transition-[width] duration-300 ease-in-out',
                isMinimized
                    ? 'w-[72px] hover:w-56 shadow-[4px_0_24px_rgba(0,0,0,0.25)]'
                    : 'w-56'
            )}
            style={{
                background: 'var(--chrome-bg, rgba(8,8,15,0.97))',
                borderRight: '1px solid rgba(255,255,255,0.07)',
            }}
        >
            {/* Floating toggle button */}
            <button
                onClick={toggleSidebar}
                className="absolute right-0 translate-x-1/2 top-[26px] z-[60] w-6 h-6 rounded-full flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 hover:scale-110"
                style={{
                    background: 'rgba(30,30,35,1)',
                    border: '1px solid rgba(255,255,255,0.15)',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
                    color: 'rgba(255,255,255,0.5)',
                }}
                title={isMinimized ? t.sidebar.expandMenu : t.sidebar.collapseMenu}
            >
                {isMinimized
                    ? <ChevronRight className="w-3.5 h-3.5" />
                    : <PanelLeftClose className="w-3.5 h-3.5" />
                }
            </button>

            {/* Brand header */}
            <div
                className="h-14 flex items-center px-4 flex-shrink-0 transition-all duration-300"
                style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}
            >
                <div className={cn('flex items-center w-full', isMinimized ? 'justify-center gap-0 group-hover:justify-start group-hover:gap-2.5' : 'gap-2.5')}>
                    <div
                        className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden"
                        style={{
                            background: `color-mix(in srgb, ${BRAND_COLOR} 13%, transparent)`,
                            border: `1px solid color-mix(in srgb, ${BRAND_COLOR} 27%, transparent)`,
                        }}
                    >
                        <Image src="/apple-touch-icon.png" alt="TechWatches" width={20} height={20} className="w-5 h-5 object-contain" />
                    </div>
                    <div className={cn('min-w-0 transition-all duration-300 overflow-hidden', isMinimized ? 'max-w-0 opacity-0 group-hover:max-w-[140px] group-hover:opacity-100' : 'max-w-[140px] opacity-100')}>
                        <p className="font-bold text-sm truncate whitespace-nowrap" style={{ color: '#F8FAFC' }}>TechWatches</p>
                        <span
                            className="text-[9px] px-1.5 py-0.5 rounded font-semibold uppercase tracking-wider"
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
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto custom-scrollbar">
                <p className={cn(
                    'px-2 mb-2 text-[10px] font-semibold uppercase tracking-widest whitespace-nowrap transition-all duration-300 overflow-hidden',
                    isMinimized ? 'max-w-0 opacity-0 group-hover:max-w-[120px] group-hover:opacity-100' : 'max-w-[120px] opacity-100'
                )} style={{ color: 'rgba(248,250,252,0.30)' }}>
                    {t.nav.navigation}
                </p>

                {NAV_ITEMS
                    .filter(item => hasPermission(user?.role as AdminRole || 'READ_ONLY', item.permission))
                    .map(({ href, key, icon: Icon, exact }) => {
                        const name = t.nav[key]
                        const isActive = exact ? pathname === href : pathname.startsWith(href)
                        return (
                            <Link
                                key={href}
                                href={href}
                                className={cn(
                                    'flex items-center text-sm rounded-lg transition-all overflow-hidden py-1.5',
                                    minGap, minPad,
                                    !isMinimized && 'px-3 gap-2.5'
                                )}
                                style={isActive
                                    ? {
                                        background: `color-mix(in srgb, ${BRAND_COLOR} 18%, transparent)`,
                                        border: `1px solid color-mix(in srgb, ${BRAND_COLOR} 30%, transparent)`,
                                        color: '#fff',
                                    }
                                    : { color: 'rgba(248,250,252,0.60)', border: '1px solid transparent' }
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
                                {/* Icon wrapper */}
                                <span
                                    className="flex-shrink-0 p-1.5 rounded-md flex items-center justify-center w-7 h-7"
                                    style={{ background: 'rgba(255,255,255,0.05)' }}
                                >
                                    <Icon className="w-3.5 h-3.5" style={{ color: isActive ? 'var(--brand-light)' : 'rgba(248,250,252,0.65)' }} />
                                </span>

                                {/* Label */}
                                <span className={cn('text-sm whitespace-nowrap transition-all duration-300 overflow-hidden', minText)}>
                                    {name}
                                </span>
                            </Link>
                        )
                    })
                }
            </nav>

            {/* Footer: user + ThemeToggle + logout */}
            <div className="px-4 py-3 flex-shrink-0" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
                <div className={cn('flex items-center w-full', isMinimized ? 'justify-center gap-0 group-hover:justify-between group-hover:gap-2' : 'gap-2')}>
                    {/* Avatar */}
                    <Link href="/dashboard/settings"
                        className={cn('flex items-center min-w-0 hover:opacity-80 transition-opacity', isMinimized ? 'gap-0 group-hover:gap-2' : 'gap-2 flex-1')}>
                        <div
                            className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 overflow-hidden"
                            style={{ background: `color-mix(in srgb, ${BRAND_COLOR} 20%, transparent)`, color: 'var(--brand-light)' }}
                        >
                            {user?.image && !user.image.includes('googleusercontent.com') ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={user.image} alt={userName} className="w-7 h-7 object-cover" />
                            ) : userInitial}
                        </div>
                        <div className={cn('min-w-0 transition-all duration-300 overflow-hidden', isMinimized ? 'max-w-0 opacity-0 group-hover:max-w-[100px] group-hover:opacity-100 flex-none' : 'max-w-[100px] opacity-100 flex-1')}>
                            <p className="text-xs font-medium truncate whitespace-nowrap" style={{ color: '#F8FAFC' }}>{userName}</p>
                            <p className="text-[10px] truncate whitespace-nowrap" style={{ color: 'rgba(248,250,252,0.40)' }}>{userRole}</p>
                        </div>
                    </Link>

                    {/* Actions */}
                    <div className={cn('flex items-center gap-1 flex-shrink-0 transition-all duration-300 overflow-hidden', isMinimized ? 'max-w-0 opacity-0 group-hover:max-w-[64px] group-hover:opacity-100' : 'max-w-[64px] opacity-100')}>
                        <ThemeToggle />
                        <AdminLogoutButton />
                    </div>
                </div>
            </div>
        </aside>
    )
}
