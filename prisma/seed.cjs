const { PrismaClient } = require('@prisma/client')
const { PrismaPg } = require('@prisma/adapter-pg')
const pg = require('pg')
require('dotenv').config()

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'

async function main() {
    const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL
    const pool = new pg.Pool({
        connectionString,
        ssl: { rejectUnauthorized: false }
    })
    const adapter = new PrismaPg(pool)
    const prisma = new PrismaClient({ adapter })

    console.log('🌱 Starting Admin Seeding...')

    // Aggressive Cleanup (Same as app-client)
    console.log('🧹 Cleaning up database...')
    await prisma.quickLink.deleteMany()
    await prisma.resource.deleteMany()
    await prisma.timelineEntry.deleteMany()
    await prisma.task.deleteMany()
    await prisma.article.deleteMany()
    await prisma.techWatch.deleteMany()
    await prisma.verification.deleteMany()
    await prisma.session.deleteMany()
    await prisma.account.deleteMany()
    await prisma.subscription.deleteMany()
    await prisma.plan.deleteMany()
    await prisma.user.deleteMany()

    // 1. Create Super Admin
    const superAdminEmail = 'goldlif94@gmail.com'
    const superAdmin = await prisma.user.create({
        data: {
            id: 'super-admin-001',
            email: superAdminEmail,
            name: 'Super Admin',
            role: 'SUPER_ADMIN',
            createdAt: new Date(),
            updatedAt: new Date(),
        },
    })
    console.log(`✅ Super Admin created: ${superAdmin.email}`)

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

    for (const planData of plans) {
        await prisma.plan.create({
            data: planData
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
