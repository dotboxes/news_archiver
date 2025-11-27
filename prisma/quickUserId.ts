#!/usr/bin/env tsx
// scripts/quickUserId.ts
// Usage: npm run quick-user-id <search_term>
// Example: npm run quick-user-id "john@example.com"

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const searchTerm = process.argv[2];

    if (!searchTerm) {
        console.log('❌ Usage: npm run quick-user-id <name|email|id>');
        console.log('   Example: npm run quick-user-id "john@example.com"');
        process.exit(1);
    }

    try {
        const users = await prisma.user.findMany({
            where: {
                OR: [
                    { name: { contains: searchTerm, mode: 'insensitive' } },
                    { email: { contains: searchTerm, mode: 'insensitive' } },
                    { id: { contains: searchTerm } },
                ],
            },
            select: {
                id: true,
                name: true,
                email: true,
            },
            take: 5,
        });

        if (users.length === 0) {
            console.log(`\n❌ No users found matching "${searchTerm}"\n`);
            process.exit(1);
        }

        console.log(`\n🔍 Found ${users.length} user(s):\n`);
        users.forEach((user, i) => {
            console.log(`${i + 1}. ${user.name || '(No Name)'} <${user.email || 'No Email'}>`);
            console.log(`   User ID: ${user.id}`);
            console.log('');
        });

        if (users.length === 1) {
            console.log('💡 Tip: Add this ID to lib/admins.ts ADMIN_USER_IDS array\n');
        }

    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

main();