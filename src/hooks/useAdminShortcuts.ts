'use client'

import { useEffect } from 'react'
import { useTheme } from '@/lib/theme-provider'
import { useLocale } from '@/lib/i18n/locale-provider'

interface UseAdminShortcutsOptions {
    onOpenCommandPalette: () => void
    onOpenHelp: () => void
    onCloseAll: () => void
}

export function useAdminShortcuts({
    onOpenCommandPalette,
    onOpenHelp,
    onCloseAll,
}: UseAdminShortcutsOptions) {
    const { toggleTheme } = useTheme()
    const { toggleLocale } = useLocale()

    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            const ctrl = e.ctrlKey || e.metaKey
            const alt = e.altKey
            const shift = e.shiftKey
            const tag = (e.target as HTMLElement)?.tagName?.toLowerCase()

            // Don't intercept shortcuts when typing in inputs/textareas
            const inInput = tag === 'input' || tag === 'textarea' || tag === 'select'

            if (e.key === 'Escape') {
                onCloseAll()
                return
            }

            // Command Palette (Ctrl+K)
            if (ctrl && !shift && !alt && e.key.toLowerCase() === 'k') {
                e.preventDefault()
                onOpenCommandPalette()
                return
            }

            // Theme Toggle (Ctrl+Shift+L)
            if (ctrl && shift && e.key.toLowerCase() === 'l') {
                e.preventDefault()
                toggleTheme()
                return
            }

            // Language Toggle (Alt+L)
            if (alt && !ctrl && !shift && e.key.toLowerCase() === 'l') {
                if (!inInput) {
                    e.preventDefault()
                    toggleLocale()
                }
                return
            }

            // Help Modal (Ctrl+H)
            if (ctrl && !shift && !alt && e.key.toLowerCase() === 'h') {
                e.preventDefault()
                onOpenHelp()
                return
            }
        }

        window.addEventListener('keydown', handler)
        return () => window.removeEventListener('keydown', handler)
    }, [toggleTheme, toggleLocale, onOpenCommandPalette, onOpenHelp, onCloseAll])
}
