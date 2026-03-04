'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Search, LayoutDashboard, Users, BarChart3, Settings, Database, CreditCard, Sun, Moon, Languages, LogOut, HelpCircle, X } from 'lucide-react'
import { useLocale } from '@/lib/i18n/locale-provider'
import { useTheme } from '@/lib/theme-provider'
import { getT } from '@/lib/i18n'
import { authClient } from '@/lib/auth-client'

const NAV_ITEMS = [
    { label_fr: 'Dashboard', label_en: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label_fr: 'Utilisateurs', label_en: 'Users', href: '/dashboard/users', icon: Users },
    { label_fr: 'Analytics', label_en: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
    { label_fr: 'Plans & Promos', label_en: 'Plans & Promos', href: '/dashboard/pricing', icon: CreditCard },
    { label_fr: 'TechWatch', label_en: 'TechWatch', href: '/dashboard/techwatches', icon: Database },
    { label_fr: 'Paramètres', label_en: 'Settings', href: '/dashboard/settings', icon: Settings },
]

interface CommandPaletteProps {
    open: boolean
    onClose: () => void
    onOpenHelp: () => void
}

export function CommandPalette({ open, onClose, onOpenHelp }: CommandPaletteProps) {
    const router = useRouter()
    const { locale, toggleLocale } = useLocale()
    const { theme, toggleTheme } = useTheme()
    const t = getT(locale)
    const [query, setQuery] = useState('')
    const [selected, setSelected] = useState(0)
    const inputRef = useRef<HTMLInputElement>(null)
    const overlayRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (open) {
            setQuery('')
            setSelected(0)
            setTimeout(() => inputRef.current?.focus(), 50)
        }
    }, [open])

    const navItems = NAV_ITEMS.map(item => ({
        label: locale === 'fr' ? item.label_fr : item.label_en,
        href: item.href,
        icon: item.icon,
        type: 'nav' as const,
    }))

    const actionItems = [
        {
            label: t.command.items.toggleTheme,
            icon: theme === 'dark' ? Sun : Moon,
            type: 'action' as const,
            action: () => { toggleTheme(); onClose() },
            kbd: 'Ctrl+D',
        },
        {
            label: t.command.items.toggleLocale,
            icon: Languages,
            type: 'action' as const,
            action: () => { toggleLocale(); onClose() },
            kbd: 'Ctrl+L',
        },
        {
            label: t.command.items.help,
            icon: HelpCircle,
            type: 'action' as const,
            action: () => { onClose(); onOpenHelp() },
            kbd: 'Ctrl+H',
        },
        {
            label: t.command.items.logout,
            icon: LogOut,
            type: 'action' as const,
            action: async () => {
                await authClient.signOut()
                router.push('/login')
                onClose()
            },
        },
    ]

    const q = query.toLowerCase()
    const filteredNav = navItems.filter(item => item.label.toLowerCase().includes(q))
    const filteredActions = actionItems.filter(item => item.label.toLowerCase().includes(q))

    type Item =
        | { label: string; href: string; icon: React.ElementType; type: 'nav'; action?: never; kbd?: never }
        | { label: string; icon: React.ElementType; type: 'action'; action: () => void; href?: never; kbd?: string }

    const allItems: Item[] = [...filteredNav, ...filteredActions]
    const total = allItems.length

    const execute = useCallback((item: Item) => {
        if (item.type === 'nav') {
            router.push(item.href!)
            onClose()
        } else {
            item.action!()
        }
    }, [router, onClose])

    useEffect(() => {
        if (!open) return
        const handler = (e: KeyboardEvent) => {
            if (e.key === 'ArrowDown') { e.preventDefault(); setSelected(s => (s + 1) % total) }
            if (e.key === 'ArrowUp') { e.preventDefault(); setSelected(s => (s - 1 + total) % total) }
            if (e.key === 'Enter') { e.preventDefault(); if (allItems[selected]) execute(allItems[selected]) }
        }
        window.addEventListener('keydown', handler)
        return () => window.removeEventListener('keydown', handler)
    }, [open, selected, total, allItems, execute])

    if (!open) return null

    return (
        <div
            ref={overlayRef}
            className="modal-backdrop"
            style={{
                position: 'fixed', inset: 0, zIndex: 9998,
                display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
                paddingTop: '10vh', backdropFilter: 'blur(8px)',
            }}
            onClick={(e) => { if (e.target === overlayRef.current) onClose() }}
        >
            <div
                className="modal-container animate-zoom-in"
                style={{
                    borderRadius: '16px', width: '100%', maxWidth: '560px',
                    margin: '0 16px', overflow: 'hidden', padding: 0,
                }}
            >
                {/* Search input */}
                <div style={{
                    display: 'flex', alignItems: 'center', gap: '12px',
                    padding: '16px 20px',
                    borderBottom: '1px solid rgba(255,255,255,0.07)',
                }}>
                    <Search className="w-4 h-4 flex-shrink-0" style={{ color: 'rgba(248,250,252,0.40)' }} />
                    <input
                        ref={inputRef}
                        value={query}
                        onChange={e => { setQuery(e.target.value); setSelected(0) }}
                        placeholder={t.command.placeholder}
                        className="command-input"
                        style={{
                            flex: 1, border: 'none', outline: 'none',
                            background: 'transparent', fontSize: '0.9375rem',
                        }}
                    />
                    <button
                        onClick={onClose}
                        className="command-kbd"
                        style={{
                            padding: '3px 8px', borderRadius: '5px', fontSize: '0.7rem',
                            fontFamily: 'var(--font-geist-mono, monospace)',
                            border: '1px solid rgba(255,255,255,0.10)',
                            cursor: 'pointer', background: 'transparent',
                            display: 'flex', alignItems: 'center', gap: '4px',
                        }}
                    >
                        <X className="w-2.5 h-2.5" /> Esc
                    </button>
                </div>

                {/* Results */}
                <div style={{ maxHeight: '380px', overflowY: 'auto', padding: '8px' }}>
                    {total === 0 && (
                        <p className="command-empty" style={{ textAlign: 'center', padding: '24px 0', fontSize: '0.875rem' }}>
                            {t.command.noResults}
                        </p>
                    )}

                    {/* Navigation section */}
                    {filteredNav.length > 0 && (
                        <div>
                            <p className="command-heading" style={{ fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', padding: '6px 10px 4px' }}>
                                {t.command.sections.navigation}
                            </p>
                            {filteredNav.map((item, i) => {
                                const globalIdx = i
                                const isSelected = selected === globalIdx
                                return (
                                    <button
                                        key={item.href}
                                        aria-selected={isSelected}
                                        onClick={() => execute(item)}
                                        onMouseEnter={() => setSelected(globalIdx)}
                                        className="command-item"
                                        style={{
                                            width: '100%', display: 'flex', alignItems: 'center', gap: '10px',
                                            padding: '9px 10px', borderRadius: '8px', border: 'none',
                                            background: 'transparent', cursor: 'pointer',
                                            fontSize: '0.875rem', textAlign: 'left',
                                            transition: 'all 0.1s ease',
                                        }}
                                    >
                                        <span style={{
                                            width: '28px', height: '28px', borderRadius: '7px', flexShrink: 0,
                                            background: 'rgba(255,255,255,0.06)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        }}>
                                            <item.icon className="w-3.5 h-3.5" style={{ color: isSelected ? 'var(--brand-light)' : undefined }} />
                                        </span>
                                        {item.label}
                                    </button>
                                )
                            })}
                        </div>
                    )}

                    {/* Actions section */}
                    {filteredActions.length > 0 && (
                        <div style={{ marginTop: filteredNav.length > 0 ? '6px' : 0 }}>
                            <p className="command-heading" style={{ fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', padding: '6px 10px 4px' }}>
                                {t.command.sections.actions}
                            </p>
                            {filteredActions.map((item, i) => {
                                const globalIdx = filteredNav.length + i
                                const isSelected = selected === globalIdx
                                return (
                                    <button
                                        key={item.label}
                                        aria-selected={isSelected}
                                        onClick={() => execute(item)}
                                        onMouseEnter={() => setSelected(globalIdx)}
                                        className="command-item"
                                        style={{
                                            width: '100%', display: 'flex', alignItems: 'center', gap: '10px',
                                            padding: '9px 10px', borderRadius: '8px', border: 'none',
                                            background: 'transparent', cursor: 'pointer',
                                            fontSize: '0.875rem', textAlign: 'left',
                                            transition: 'all 0.1s ease',
                                        }}
                                    >
                                        <span style={{
                                            width: '28px', height: '28px', borderRadius: '7px', flexShrink: 0,
                                            background: 'rgba(255,255,255,0.06)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        }}>
                                            <item.icon className="w-3.5 h-3.5" style={{ color: isSelected ? 'var(--brand-light)' : undefined }} />
                                        </span>
                                        <span style={{ flex: 1 }}>{item.label}</span>
                                        {item.kbd && (
                                            <kbd
                                                className="command-kbd"
                                                style={{
                                                    padding: '2px 7px', borderRadius: '4px', fontSize: '0.7rem',
                                                    fontFamily: 'var(--font-geist-mono, monospace)',
                                                    border: '1px solid rgba(255,255,255,0.10)', background: 'transparent',
                                                }}
                                            >
                                                {item.kbd}
                                            </kbd>
                                        )}
                                    </button>
                                )
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
