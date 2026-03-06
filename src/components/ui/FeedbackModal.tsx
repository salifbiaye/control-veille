'use client'

import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface FeedbackModalProps {
    isOpen: boolean
    type: 'success' | 'error' | 'info'
    title: string
    message: string
    onClose: () => void
}

export function FeedbackModal({
    isOpen,
    type,
    title,
    message,
    onClose,
}: FeedbackModalProps) {
    // Close on Escape
    useEffect(() => {
        if (!isOpen) return
        function handleKey(e: KeyboardEvent) {
            if (e.key === 'Escape') onClose()
        }
        document.addEventListener('keydown', handleKey)
        return () => document.removeEventListener('keydown', handleKey)
    }, [isOpen, onClose])

    if (!isOpen) return null

    const config = {
        success: {
            icon: CheckCircle2,
            color: '#10b981',
            bg: 'rgba(16,185,129,0.12)',
            border: 'rgba(16,185,129,0.25)',
            sha: '0 4px 16px rgba(16,185,129,0.25)'
        },
        error: {
            icon: AlertCircle,
            color: '#ef4444',
            bg: 'rgba(239,68,68,0.12)',
            border: 'rgba(239,68,68,0.25)',
            sha: '0 4px 16px rgba(239,68,68,0.25)'
        },
        info: {
            icon: Info,
            color: '#3b82f6',
            bg: 'rgba(59,130,246,0.12)',
            border: 'rgba(59,130,246,0.25)',
            sha: '0 4px 16px rgba(59,130,246,0.25)'
        }
    }

    const { icon: Icon, color, bg, border, sha } = config[type]

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
                onClick={onClose}
            />

            {/* Modal */}
            <div
                className="relative w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
                style={{
                    background: 'var(--card-bg)',
                    border: '1px solid var(--glass-border)',
                }}
            >
                <div className="p-6 text-center">
                    {/* Icon */}
                    <div
                        className="mx-auto w-12 h-12 rounded-2xl flex items-center justify-center mb-4"
                        style={{ background: bg, border: `1px solid ${border}` }}
                    >
                        <Icon className="w-6 h-6" style={{ color }} />
                    </div>

                    {/* Title */}
                    <h3 className="text-lg font-bold mb-2" style={{ color: 'var(--page-fg)' }}>
                        {title}
                    </h3>

                    {/* Message */}
                    <p className="text-sm leading-relaxed mb-6" style={{ color: 'var(--txt-sub)' }}>
                        {message}
                    </p>

                    {/* Action */}
                    <Button
                        onClick={onClose}
                        className="w-full rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98]"
                        style={{
                            background: color,
                            color: '#fff',
                            boxShadow: sha
                        }}
                    >
                        Continuer
                    </Button>
                </div>

                {/* Close X */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>
        </div>,
        document.body
    )
}
