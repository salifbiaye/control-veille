'use client'

import { useState, useTransition } from 'react'
import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ConfirmModal } from '@/components/ui/ConfirmModal'
import { deletePlan } from '@/features/pricing/actions/pricing.actions'
import { useT } from '@/lib/i18n/locale-context'

interface DeletePlanButtonProps {
    planId: string
    planName: string
    hasSubscriptions: boolean
}

export function DeletePlanButton({ planId, planName, hasSubscriptions }: DeletePlanButtonProps) {
    const t = useT()
    const [isConfirmOpen, setIsConfirmOpen] = useState(false)
    const [pending, startTransition] = useTransition()
    const [error, setError] = useState<string | null>(null)

    const handleDelete = () => {
        startTransition(async () => {
            const res = await deletePlan(planId)
            if (res.success) {
                setIsConfirmOpen(false)
            } else {
                setError(res.error || 'Erreur lors de la suppression')
            }
        })
    }

    return (
        <>
            <Button
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                onClick={() => setIsConfirmOpen(true)}
                title="Supprimer ce plan"
            >
                <Trash2 className="w-4 h-4" />
            </Button>

            <ConfirmModal
                isOpen={isConfirmOpen}
                onCancel={() => setIsConfirmOpen(false)}
                onConfirm={handleDelete}
                title={`Supprimer le plan "${planName}" ?`}
                description={hasSubscriptions
                    ? "Impossible de supprimer ce plan car il contient des abonnés actifs."
                    : "Cette action est irréversible. Toutes les données locales liées à ce plan seront supprimées."
                }
                confirmLabel={pending ? "Suppression..." : "Supprimer"}
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
