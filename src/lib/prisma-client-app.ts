// Re-export the admin prisma client for raw queries on shared tables
// Raw SQL accesses app-client tables (user, TechWatch, etc.) directly
export { prisma as appPrisma } from '@/lib/prisma'
