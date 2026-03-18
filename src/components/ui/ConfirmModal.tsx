'use client'

import { useEffect, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { AlertTriangle, X, Trash2, ShieldAlert } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ConfirmModalProps {
    isOpen: boolean
    title: string
    description: string
    confirmLabel?: string
    cancelLabel?: string
    variant?: 'danger' | 'warning'
    isPending?: boolean
    children?: React.ReactNode
    onConfirm: () => void
    onCancel: () => void
}

export function ConfirmModal({
    isOpen,
    title,
    description,
    confirmLabel = 'Confirmer',
    cancelLabel = 'Annuler',
    variant = 'danger',
    isPending = false,
    children,
    onConfirm,
    onCancel,
}: ConfirmModalProps) {
    // Close on Escape
    useEffect(() => {
        if (!isOpen) return
        function handleKey(e: KeyboardEvent) {
            if (e.key === 'Escape') onCancel()
        }
        document.addEventListener('keydown', handleKey)
        return () => document.removeEventListener('keydown', handleKey)
    }, [isOpen, onCancel])

    if (!isOpen) return null

    const isDanger = variant === 'danger'
    const Icon = isDanger ? Trash2 : ShieldAlert

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={() => !isPending && onCancel()}
            />

            {/* Modal */}
            <div
                className="relative w-full max-w-md rounded-2xl shadow-2xl overflow-hidden"
                style={{
                    background: 'var(--card-bg)',
                    border: '1px solid var(--glass-border)',
                    animation: 'scaleIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                }}
            >
                {/* Header */}
                <div className="flex items-start justify-between p-6 pb-4">
                    <div className="flex items-center gap-3">
                        <div
                            className="p-2.5 rounded-xl"
                            style={{
                                background: isDanger ? 'rgba(239,68,68,0.12)' : 'rgba(245,158,11,0.12)',
                                border: `1px solid ${isDanger ? 'rgba(239,68,68,0.25)' : 'rgba(245,158,11,0.25)'}`,
                            }}
                        >
                            <Icon
                                className="w-5 h-5"
                                style={{ color: isDanger ? '#ef4444' : '#f59e0b' }}
                            />
                        </div>
                        <h2 className="text-lg font-bold" style={{ color: 'var(--page-fg)' }}>
                            {title}
                        </h2>
                    </div>
                    <button
                        onClick={() => !isPending && onCancel()}
                        className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors"
                        disabled={isPending}
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Body */}
                <div className="px-6 pb-6">
                    <p className="text-sm leading-relaxed" style={{ color: 'var(--txt-sub)' }}>
                        {description}
                    </p>
                    {children && <div className="mt-4">{children}</div>}
                </div>

                {/* Actions */}
                <div
                    className="flex items-center justify-end gap-3 px-6 py-4"
                    style={{ borderTop: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.02)' }}
                >
                    <Button
                        variant="ghost"
                        className="rounded-xl"
                        onClick={onCancel}
                        disabled={isPending}
                    >
                        {cancelLabel}
                    </Button>
                    <Button
                        onClick={onConfirm}
                        disabled={isPending}
                        className="rounded-xl px-6 transition-all hover:scale-[1.02] active:scale-[0.98]"
                        style={{
                            background: isDanger ? '#ef4444' : '#f59e0b',
                            color: '#fff',
                            boxShadow: isDanger ? '0 4px 16px rgba(239,68,68,0.35)' : '0 4px 16px rgba(245,158,11,0.35)',
                        }}
                    >
                        {isPending ? 'En cours...' : confirmLabel}
                    </Button>
                </div>
            </div>

            <style>{`
                @keyframes scaleIn {
                    from { opacity: 0; transform: scale(0.95); }
                    to { opacity: 1; transform: scale(1); }
                }
            `}</style>
        </div>,
        document.body
    )
}
