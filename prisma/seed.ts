import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'
import 'dotenv/config'

async function main() {
    const connectionString = process.env.DATABASE_URL!
    const pool = new pg.Pool({ connectionString })
    const adapter = new PrismaPg(pool)
    const prisma = new PrismaClient({ adapter })

    console.log('🌱 Starting Seeding...')

    // 1. Create Super Admin
    const superAdminEmail = 'goldlif94@gmail.com'
    const superAdmin = await prisma.user.upsert({
        where: { email: superAdminEmail },
        update: {
            role: 'SUPER_ADMIN',
            permissions: ['*'],
        },
        create: {
            id: 'cmxk123456789admin', // fallback mock ID for seed
            email: superAdminEmail,
            name: 'Super Admin',
            role: 'SUPER_ADMIN',
            permissions: ['*'],
            emailVerified: true,
            createdAt: new Date(),
            updatedAt: new Date(),
        },
    })
    console.log(`✅ Super Admin ready: ${superAdmin.email}`)

    // 2. Create Initial Plans
    const plans = [
        {
            name: 'Free',
            slug: 'free',
            monthlyPrice: 0,
            yearlyPrice: 0,
            features: {
                techLimit: 3,
                aiAssistant: false,
                analytics: false,
                exportData: false
            },
            sortOrder: 0
        },
        {
            name: 'Pro',
            slug: 'pro',
            monthlyPrice: 1900,
            yearlyPrice: 19000,
            features: {
                techLimit: 10,
                aiAssistant: true,
                analytics: true,
                exportData: true
            },
            sortOrder: 1
        },
        {
            name: 'Enterprise',
            slug: 'enterprise',
            monthlyPrice: 4900,
            yearlyPrice: 49000,
            features: {
                techLimit: 100,
                aiAssistant: true,
                analytics: true,
                exportData: true
            },
            sortOrder: 2
        }
    ]

    for (const plan of plans) {
        await prisma.plan.upsert({
            where: { slug: plan.slug },
            update: plan,
            create: plan,
        })
    }
    console.log('✅ Plans seeded successfully')

    console.log('✨ Seeding finished successfully')

    await prisma.$disconnect()
    await pool.end()
}

main()
    .catch((e) => {
        console.error('❌ Seeding failed:', e)
        process.exit(1)
    })
