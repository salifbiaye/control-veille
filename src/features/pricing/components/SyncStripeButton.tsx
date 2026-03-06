'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react'
import { syncAllPlansFromStripe } from '../actions/sync.actions'
import { useRouter } from 'next/navigation'
import { FeedbackModal } from '@/components/ui/FeedbackModal'

export function SyncStripeButton() {
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

    const handleSync = async () => {
        setIsLoading(true)
        try {
            const res = await syncAllPlansFromStripe()
            if (res.success) {
                setFeedback({
                    isOpen: true,
                    type: 'success',
                    title: 'Synchronisation réussie',
                    message: 'Tous les plans Stripe ont été mis à jour avec succès.'
                })
                router.refresh()
            } else {
                setFeedback({
                    isOpen: true,
                    type: 'error',
                    title: 'Échec de synchronisation',
                    message: res.error || 'Une erreur est survenue lors de la synchronisation avec Stripe.'
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
                {isLoading ? 'Synchronisation...' : 'Synchroniser avec Stripe'}
            </Button>

            <FeedbackModal
                {...feedback}
                onClose={() => setFeedback(prev => ({ ...prev, isOpen: false }))}
            />
        </>
    )
}
