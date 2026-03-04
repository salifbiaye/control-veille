'use client'

import { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'dark' | 'light'

interface ThemeContextValue {
    theme: Theme
    toggleTheme: () => void
    setTheme: (t: Theme) => void
}

const ThemeContext = createContext<ThemeContextValue>({
    theme: 'dark',
    toggleTheme: () => { },
    setTheme: () => { },
})

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [theme, setThemeState] = useState<Theme>('dark')

    // On mount: read from localStorage
    useEffect(() => {
        const stored = localStorage.getItem('admin-theme') as Theme | null
        const preferred = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
        const resolved = stored ?? preferred
        setThemeState(resolved)
        applyTheme(resolved)
    }, [])

    const applyTheme = (t: Theme) => {
        const root = document.documentElement
        root.classList.toggle('dark', t === 'dark')
        root.classList.toggle('light', t === 'light')
    }

    const setTheme = (t: Theme) => {
        setThemeState(t)
        applyTheme(t)
        localStorage.setItem('admin-theme', t)
    }

    const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark')

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
            {children}
        </ThemeContext.Provider>
    )
}

export function useTheme() {
    return useContext(ThemeContext)
}
