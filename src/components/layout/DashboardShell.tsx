'use client'

import { useSidebar } from './SidebarLayout'

export function DashboardShell({ children }: { children: React.ReactNode }) {
    const { isMinimized } = useSidebar()
    return (
        <div
            className="flex-1 flex flex-col min-h-screen transition-[margin-left] duration-300 ease-in-out"
            style={{ marginLeft: isMinimized ? '72px' : '224px' }}
        >
            {children}
        </div>
    )
}
