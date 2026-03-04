'use client'

import { createContext, useContext, useEffect, useState } from 'react'

type Locale = 'fr' | 'en'

interface LocaleContextValue {
    locale: Locale
    toggleLocale: () => void
    setLocale: (l: Locale) => void
}

const LocaleContext = createContext<LocaleContextValue>({
    locale: 'fr',
    toggleLocale: () => { },
    setLocale: () => { },
})

export function LocaleProvider({ children }: { children: React.ReactNode }) {
    const [locale, setLocaleState] = useState<Locale>('fr')

    useEffect(() => {
        const stored = localStorage.getItem('admin-locale') as Locale | null
        if (stored === 'fr' || stored === 'en') setLocaleState(stored)
    }, [])

    const setLocale = (l: Locale) => {
        setLocaleState(l)
        localStorage.setItem('admin-locale', l)
    }

    const toggleLocale = () => setLocale(locale === 'fr' ? 'en' : 'fr')

    return (
        <LocaleContext.Provider value={{ locale, toggleLocale, setLocale }}>
            {children}
        </LocaleContext.Provider>
    )
}

export function useLocale() {
    return useContext(LocaleContext)
}
