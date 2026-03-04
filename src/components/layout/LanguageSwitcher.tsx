'use client'
import { useLocale } from '@/lib/i18n/locale-context'

/**
 * Compact language toggle for headers — displays current locale flag
 * and switches to the other language on click.
 */
export function LanguageSwitcher({ onDarkBackground = true }: { onDarkBackground?: boolean }) {
    const { locale, setLocale } = useLocale()
    const next = locale === 'fr' ? 'en' : 'fr'
    const flag = locale === 'fr' ? '🇫🇷' : '🇬🇧'
    const label = locale === 'fr' ? 'Switch to English' : 'Passer en Français'

    return (
        <button
            onClick={() => setLocale(next)}
            title={label}
            aria-label={label}
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:scale-110 active:scale-95 text-base select-none"
            style={{
                background: onDarkBackground ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)',
                border: onDarkBackground ? '1px solid rgba(255,255,255,0.09)' : '1px solid rgba(0,0,0,0.08)',
            }}
        >
            {flag}
        </button>
    )
}
