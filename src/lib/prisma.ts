import { PrismaClient } from '@prisma/client'
import { config } from 'dotenv'
import { resolve } from 'path'

// Force load environment variables if not present
if (!process.env.DATABASE_URL) {
    console.warn('DATABASE_URL not found, attempting to load from .env files');
    config({ path: resolve(process.cwd(), '.env.local') });
    config({ path: resolve(process.cwd(), '.env') });
}

const globalForPrisma = global as unknown as { prisma: PrismaClient }

export const prisma = globalForPrisma.prisma || new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma