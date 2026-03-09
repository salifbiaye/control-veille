'use server'

import { requirePermission } from '@/lib/session'
import { revalidatePath } from 'next/cache'
import { getPaymentProvider } from '@/lib/payment'

export async function syncAllPlansFromProvider() {
    await requirePermission('EDIT_PLANS')
    const result = await getPaymentProvider().syncPlans()
    if (result.success) revalidatePath('/dashboard/pricing')
    return result
}
