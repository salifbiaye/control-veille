import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import pg from "pg"

const PRISMA_KEY = "__prisma_admin_v1__"
const POOL_KEY = "__prisma_admin_pool_v1__"

declare global {
  // eslint-disable-next-line no-var
  var __prisma_admin_v1__: PrismaClient | undefined
  // eslint-disable-next-line no-var
  var __prisma_admin_pool_v1__: pg.Pool | undefined
}

function getPool() {
  if (globalThis[POOL_KEY]) return globalThis[POOL_KEY]

  const connectionString = process.env.DATABASE_URL!
  const pool = new pg.Pool({
    connectionString,
    max: 5,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  })

  if (process.env.NODE_ENV !== "production") {
    globalThis[POOL_KEY] = pool
  }
  return pool
}

function createPrismaClient() {
  const pool = getPool()
  const adapter = new PrismaPg(pool)
  return new PrismaClient({ adapter })
}

export const prisma: PrismaClient =
  globalThis[PRISMA_KEY] ?? createPrismaClient()

if (process.env.NODE_ENV !== "production") {
  globalThis[PRISMA_KEY] = prisma
}
