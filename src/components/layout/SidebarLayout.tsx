'use client'

import { createContext, useContext, useState } from 'react'

interface SidebarContextValue {
    isMinimized: boolean
    toggleSidebar: () => void
}

const SidebarContext = createContext<SidebarContextValue>({
    isMinimized: false,
    toggleSidebar: () => {},
})

export function SidebarProvider({ children }: { children: React.ReactNode }) {
    const [isMinimized, setIsMinimized] = useState(false)
    return (
        <SidebarContext.Provider value={{ isMinimized, toggleSidebar: () => setIsMinimized(p => !p) }}>
            {children}
        </SidebarContext.Provider>
    )
}

export function useSidebar() {
    return useContext(SidebarContext)
}
