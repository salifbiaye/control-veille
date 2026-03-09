'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { RefreshCw } from 'lucide-react'
import { syncAllPlansFromProvider } from '../actions/sync.actions'
import { useRouter } from 'next/navigation'
import { FeedbackModal } from '@/components/ui/FeedbackModal'

export function SyncProviderButton({ providerName = 'Stripe' }: { providerName?: string }) {
    const [isLoading, setIsLoading] = useState(false)
    const [feedback, setFeedback] = useState<{
        isOpen: boolean
        type: 'success' | 'error' | 'info'
        title: string
        message: string
    }>({
        isOpen: false,
        type: 'info',
        title: '',
        message: ''
    })
    const router = useRouter()

    // Detect provider from env if possible, or just use a generic term
    // Since we are in a client component, we can't directly access process.env.PAYMENT_PROVIDER
    // unless it's prefixed with NEXT_PUBLIC_. 
    // But we can assume it's "Provider" or pass it as a prop if we want to be precise.
    // For now, let's use "Stripe / Paddle" or similar if we can't detect it easily.

    const handleSync = async () => {
        setIsLoading(true)
        try {
            const res = await syncAllPlansFromProvider()
            if (res.success) {
                setFeedback({
                    isOpen: true,
                    type: 'success',
                    title: 'Synchronisation réussie',
                    message: `Tous les plans ont été mis à jour avec succès.`
                })
                router.refresh()
            } else {
                setFeedback({
                    isOpen: true,
                    type: 'error',
                    title: 'Échec de synchronisation',
                    message: res.error || 'Une erreur est survenue lors de la synchronisation.'
                })
            }
        } catch (error) {
            setFeedback({
                isOpen: true,
                type: 'error',
                title: 'Erreur inattendue',
                message: 'Une erreur imprévue est survenue lors de la communication avec le serveur.'
            })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <>
            <Button
                onClick={handleSync}
                disabled={isLoading}
                variant="outline"
                className="gap-2 border-primary/20 hover:border-primary/50"
            >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                {isLoading ? 'Synchronisation...' : `Synchroniser avec ${providerName}`}
            </Button>

            <FeedbackModal
                {...feedback}
                onClose={() => setFeedback(prev => ({ ...prev, isOpen: false }))}
            />
        </>
    )
}
