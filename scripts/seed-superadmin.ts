// Usage: npx tsx scripts/seed-superadmin.ts your@email.com
import { PrismaClient } from '@prisma/client'
import { v4 as uuidv4 } from 'uuid'

const prisma = new PrismaClient()

async function main() {
    const email = process.argv[2]

    if (!email) {
        console.error('❌ Error: Please provide an email address.')
        console.log('Usage: npx tsx scripts/seed-superadmin.ts <email>')
        process.exit(1)
    }

    console.log(`\n🚀 Seeding SUPER_ADMIN for: ${email}...`)

    try {
        const user = await prisma.user.upsert({
            where: { email },
            update: {
                role: 'SUPER_ADMIN',
            },
            create: {
                id: uuidv4(),
                email,
                name: email.split('@')[0],
                role: 'SUPER_ADMIN',
                emailVerified: true,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
        })

        console.log(`✅ Success! ${user.email} is now a SUPER_ADMIN.`)
        console.log(`🔗 You can now log in at: http://localhost:3001/login\n`)
    } catch (error) {
        console.error('❌ Error seeding user:', error)
        process.exit(1)
    } finally {
        await prisma.$disconnect()
    }
}

main()
