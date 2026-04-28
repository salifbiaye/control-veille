import { Redis } from '@upstash/redis'

let _redis: Redis | null = null

function getRedis(): Redis | null {
    if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
        return null
    }
    if (!_redis) {
        _redis = new Redis({
            url: process.env.UPSTASH_REDIS_REST_URL,
            token: process.env.UPSTASH_REDIS_REST_TOKEN,
        })
    }
    return _redis
}

/**
 * Invalide le cache du plan utilisateur côté app-client.
 * Utilise la même clé que app-client/src/lib/redis.ts → CacheKeys.userPlan()
 */
export async function invalidateUserPlanCache(userId: string): Promise<void> {
    try {
        const r = getRedis()
        if (!r) return
        await r.del(`user:plan:${userId}`)
    } catch (e) {
        console.error('[ADMIN_REDIS] Failed to invalidate user plan cache:', e)
    }
}
