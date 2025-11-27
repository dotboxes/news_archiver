import { config } from 'dotenv';
import { resolve } from 'path';

// Load .env.local first (priority), then .env as fallback
config({ path: resolve(process.cwd(), '.env.local') });
config({ path: resolve(process.cwd(), '.env') });

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Deleting all articles...');
    const deleted = await prisma.articles.deleteMany({});
    console.log(`Deleted ${deleted.count} articles.`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });