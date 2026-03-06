'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react'
import { syncAllPlansFromStripe } from '../actions/sync.actions'
import { useRouter } from 'next/navigation'

export function SyncStripeButton() {
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()

    const handleSync = async () => {
        setIsLoading(true)
        try {
            const res = await syncAllPlansFromStripe()
            if (res.success) {
                alert('Plans synchronisés avec Stripe !')
                router.refresh()
            } else {
                alert(res.error || 'Erreur lors de la synchronisation')
            }
        } catch (error) {
            alert('Une erreur inattendue est survenue')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Button
            onClick={handleSync}
            disabled={isLoading}
            variant="outline"
            className="gap-2 border-primary/20 hover:border-primary/50"
        >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            {isLoading ? 'Synchronisation...' : 'Synchroniser avec Stripe'}
        </Button>
    )
}
