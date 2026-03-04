import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"

const PRISMA_KEY = "__prisma_admin_v1__"

declare global {
  // eslint-disable-next-line no-var
  var __prisma_admin_v1__: PrismaClient | undefined
}

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL!
  const adapter = new PrismaPg({ connectionString })
  return new PrismaClient({ adapter })
}

export const prisma: PrismaClient =
  globalThis.__prisma_admin_v1__ ?? createPrismaClient()

if (process.env.NODE_ENV !== "production") {
  globalThis.__prisma_admin_v1__ = prisma
}
