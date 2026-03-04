import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import 'dotenv/config'
import { v4 as uuidv4 } from 'uuid'

async function createAdmin() {
    const connectionString = process.env.DATABASE_URL!
    const adapter = new PrismaPg({ connectionString })
    const prisma = new PrismaClient({ adapter })

    const email = 'admin@techwatch.com'
    const name = 'Super Admin'
    // Password: admin-password-2026
    // Better-auth default bcrypt hash for 'admin-password-2026'
    const passwordHash = '$2b$10$7C3AED.hash.placeholder.for.dev.purposes' // This is just a placeholder, better-auth will re-hash or we can use it as is if we skip better-auth for a moment.

    // NOTE: To be 100% sure it works with better-auth, 
    // the best way is to use the auth.api.signUpEmail which I tried.
    // The error ERR_MODULE_NOT_FOUND was because of ESM.
    // Let's try to run the PREVIOUS script with:
    // node --loader ts-node/esm scripts/create-admin.ts
}

console.log('Use: node --loader ts-node/esm scripts/create-admin.ts')
