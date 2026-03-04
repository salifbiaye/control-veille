'use client'

import {
    createContext,
    useContext,
    useState,
    useEffect,
    type ReactNode,
} from 'react'
import { type Locale as Language, translations, type Translations } from './index'

const DEFAULT_LANGUAGE: Language = 'fr'
export { DEFAULT_LANGUAGE, type Language }

// ─────────────────────────────────────────────────────────────
// Context
// ─────────────────────────────────────────────────────────────

interface LocaleContextValue {
    locale: Language
    setLocale: (lang: Language) => void
    t: Translations
}

const LocaleContext = createContext<LocaleContextValue>({
    locale: DEFAULT_LANGUAGE,
    setLocale: () => { },
    t: translations[DEFAULT_LANGUAGE],
})

const LOCALE_STORAGE_KEY = 'techwatch-locale'

// ─────────────────────────────────────────────────────────────
// Provider
// ─────────────────────────────────────────────────────────────

export function LocaleProvider({ children }: { children: ReactNode }) {
    const [locale, setLocaleState] = useState<Language>(DEFAULT_LANGUAGE)

    // Hydrate from localStorage on mount
    useEffect(() => {
        const stored = localStorage.getItem(LOCALE_STORAGE_KEY) as Language | null
        if (stored && (stored === 'fr' || stored === 'en')) {
            setLocaleState(stored)
        }
    }, [])

    function setLocale(lang: Language) {
        setLocaleState(lang)
        localStorage.setItem(LOCALE_STORAGE_KEY, lang)
        // Update <html lang> attribute
        document.documentElement.lang = lang
        // Synchroniser avec le cookie pour les Server Components
        document.cookie = `NEXT_LOCALE=${lang}; path=/; max-age=31536000; SameSite=Lax`
    }

    // Global shortcut for language toggle (Alt + L)
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.altKey && e.key.toLowerCase() === 'l') {
                e.preventDefault()
                const nextLang: Language = locale === 'fr' ? 'en' : 'fr'
                setLocale(nextLang)
            }
        }
        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [locale])

    return (
        <LocaleContext.Provider
            value={{
                locale,
                setLocale,
                t: translations[locale],
            }}
        >
            {children}
        </LocaleContext.Provider>
    )
}

// ─────────────────────────────────────────────────────────────
// Hooks
// ─────────────────────────────────────────────────────────────

/** Returns current locale and setter */
export function useLocale() {
    const ctx = useContext(LocaleContext)
    return { locale: ctx.locale, setLocale: ctx.setLocale }
}

/** Returns the translations object for current locale */
export function useT(): Translations {
    return useContext(LocaleContext).t
}
