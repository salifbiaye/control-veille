const { PrismaClient } = require('@prisma/client')
const { PrismaPg } = require('@prisma/adapter-pg')
const pg = require('pg')
require('dotenv').config()

async function main() {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'
    const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL
    const pool = new pg.Pool({
        connectionString,
        ssl: { rejectUnauthorized: false }
    })
    const adapter = new PrismaPg(pool)
    const prisma = new PrismaClient({ adapter })

    const users = await prisma.user.findMany()
    console.log('--- Users ---')
    console.log(JSON.stringify(users, null, 2))

    await prisma.$disconnect()
    await pool.end()
}
main()
