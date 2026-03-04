'use client'

import { useEffect, useRef } from 'react'
import { X, Keyboard } from 'lucide-react'
import { useLocale } from '@/lib/i18n/locale-provider'
import { getT } from '@/lib/i18n'

interface HelpModalProps {
    open: boolean
    onClose: () => void
}

export function HelpModal({ open, onClose }: HelpModalProps) {
    const { locale } = useLocale()
    const t = getT(locale)
    const overlayRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (!open) return
        const handler = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose()
        }
        window.addEventListener('keydown', handler)
        return () => window.removeEventListener('keydown', handler)
    }, [open, onClose])

    if (!open) return null

    return (
        <div
            ref={overlayRef}
            className="modal-backdrop"
            style={{
                position: 'fixed', inset: 0, zIndex: 9999,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                backdropFilter: 'blur(8px)',
            }}
            onClick={(e) => { if (e.target === overlayRef.current) onClose() }}
        >
            <div
                className="modal-container animate-zoom-in"
                style={{
                    borderRadius: '16px',
                    padding: '24px',
                    width: '100%',
                    maxWidth: '480px',
                    margin: '0 16px',
                }}
            >
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{
                            width: '32px', height: '32px', borderRadius: '8px',
                            background: 'rgba(124,58,237,0.20)', border: '1px solid rgba(124,58,237,0.35)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                            <Keyboard className="w-4 h-4" style={{ color: 'var(--brand-light)' }} />
                        </div>
                        <h2 className="modal-title" style={{ fontSize: '1rem', fontWeight: 600 }}>
                            {t.help.title}
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="modal-close"
                        style={{
                            width: '28px', height: '28px', borderRadius: '6px',
                            border: 'none', background: 'rgba(255,255,255,0.05)',
                            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            transition: 'all 0.15s ease',
                        }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.10)' }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)' }}
                    >
                        <X className="w-3.5 h-3.5" />
                    </button>
                </div>

                {/* Shortcuts grid */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {t.help.shortcuts.map(({ key, label }) => (
                        <div
                            key={key}
                            style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                padding: '10px 12px', borderRadius: '8px',
                                background: 'rgba(255,255,255,0.03)',
                                border: '1px solid rgba(255,255,255,0.05)',
                            }}
                        >
                            <span className="command-item" style={{ fontSize: '0.875rem' }}>{label}</span>
                            <kbd
                                className="command-kbd"
                                style={{
                                    padding: '3px 8px', borderRadius: '5px',
                                    fontSize: '0.75rem', fontFamily: 'var(--font-geist-mono, monospace)',
                                    border: '1px solid rgba(255,255,255,0.12)',
                                    whiteSpace: 'nowrap',
                                }}
                            >
                                {key}
                            </kbd>
                        </div>
                    ))}
                </div>

                {/* Footer hint */}
                <p
                    className="command-empty"
                    style={{ textAlign: 'center', fontSize: '0.75rem', marginTop: '16px' }}
                >
                    Ctrl + H · Esc pour fermer
                </p>
            </div>
        </div>
    )
}
