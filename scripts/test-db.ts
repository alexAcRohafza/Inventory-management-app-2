import { prisma } from '@/lib/prisma'

async function main() {
  try {
    await prisma.$connect()
    console.log('Connected to PostgreSQL via Prisma!')
    process.exit(0)
  } catch (error) {
    console.error('Database connection failed:', error)
    process.exit(1)
  }
}

main() 