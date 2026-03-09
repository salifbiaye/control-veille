'use client'

import { useState, useTransition } from 'react'
import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ConfirmModal } from '@/components/ui/ConfirmModal'
import { deletePromotion } from '@/features/pricing/actions/pricing.actions'

interface DeletePromoButtonProps {
    promoId: string
    promoCode: string
}

export function DeletePromoButton({ promoId, promoCode }: DeletePromoButtonProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [pending, startTransition] = useTransition()
    const [error, setError] = useState<string | null>(null)

    const handleDelete = () => {
        startTransition(async () => {
            const res = await deletePromotion(promoId)
            if (res.success) {
                setIsOpen(false)
            } else {
                setError(res.error || 'Erreur lors de la désactivation')
            }
        })
    }

    return (
        <>
            <Button
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                onClick={() => setIsOpen(true)}
                title="Désactiver ce code promo"
            >
                <Trash2 className="w-4 h-4" />
            </Button>

            <ConfirmModal
                isOpen={isOpen}
                onCancel={() => setIsOpen(false)}
                onConfirm={handleDelete}
                title={`Désactiver le code "${promoCode}" ?`}
                description="Ce code sera archivé côté provider et ne pourra plus être utilisé lors du checkout."
                confirmLabel={pending ? 'Désactivation...' : 'Désactiver'}
                variant="danger"
                isPending={pending}
            />

            {error && (
                <div className="fixed bottom-4 right-4 bg-destructive text-white p-3 rounded-lg shadow-lg z-50">
                    {error}
                </div>
            )}
        </>
    )
}
