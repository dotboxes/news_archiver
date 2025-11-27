#!/usr/bin/env tsx
/*
*
* # Create dummy user(s)
npx tsx prisma/seedDummy.ts users:create        # 1 user
npx tsx prisma/seedDummy.ts users:create 5      # 5 users

# Delete dummy user(s)
npx tsx prisma/seedDummy.ts users:delete        # deletes 1 user
npx tsx prisma/seedDummy.ts users:delete 3      # deletes 3 users
npx tsx prisma/seedDummy.ts users:delete all    # deletes all test users
*/
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ────────────────────────────────────────────────
// Dummy user creation helpers
// ────────────────────────────────────────────────

async function createDummyUsers(count: number) {
    for (let i = 1; i <= count; i++) {
        const email = `testuser${i}@example.com`;

        const existing = await prisma.user.findUnique({ where: { email } });
        if (existing) {
            console.log(`⚠️  ${email} already exists, skipping`);
            continue;
        }

        const user = await prisma.user.create({
            data: {
                email,
                name: `Test User ${i}`,
                emailVerified: new Date(),
            },
        });

        console.log(`✓ Created dummy user ${user.name} (${user.email})`);
    }
}

// ────────────────────────────────────────────────
// Dummy user deletion helpers
// ────────────────────────────────────────────────

async function deleteDummyUsers(count: number | 'all') {
    if (count === 'all') {
        const deleted = await prisma.user.deleteMany({
            where: { email: { startsWith: 'testuser' } },
        });
        console.log(`✓ Deleted ${deleted.count} dummy user(s)`);
        return;
    }

    const users = await prisma.user.findMany({
        where: { email: { startsWith: 'testuser' } },
        orderBy: { email: 'asc' },
        take: count,
    });

    if (users.length === 0) {
        console.log('✗ No dummy users found');
        return;
    }

    for (const user of users) {
        await prisma.session.deleteMany({ where: { userId: user.id } });
        await prisma.account.deleteMany({ where: { userId: user.id } });
        await prisma.user.delete({ where: { id: user.id } });
        console.log(`✓ Deleted dummy user ${user.email}`);
    }
}

// ────────────────────────────────────────────────
// Article functions
// ────────────────────────────────────────────────

async function createDummyArticle() {
    try {
        const timestamp = Date.now();
        const slug = `test-article-dummy-${timestamp}`;

        const article = await prisma.articles.create({
            data: {
                title: `Test Article ${timestamp}`,
                subtitle: 'This is a test article for development',
                slug,
                content:
                    'This is the main content of the test article. You can edit this later through your article management system.',
                author: 'Test User',
                category: 'Technology',
                image_url:
                    'https://dummyimage.com/600x400/e0e0e0/555.png&text=No+Image',
                published_date: new Date(),
            },
        });

        console.log('✓ Dummy article created successfully');
        console.log(`  Title: ${article.title}`);
    } catch (error) {
        console.error('Error creating dummy article:', error);
    }
}

async function deleteAllDummyArticles() {
    try {
        const deleted = await prisma.articles.deleteMany({
            where: { slug: { startsWith: 'test-article-dummy' } },
        });

        if (deleted.count === 0) {
            console.log('✗ No dummy articles found');
        } else {
            console.log(`✓ Deleted ${deleted.count} dummy article(s)`);
        }
    } catch (error) {
        console.error('Error deleting dummy articles:', error);
    }
}

// ────────────────────────────────────────────────
// Main command handler
// ────────────────────────────────────────────────

async function main() {
    const command = process.argv[2];
    const arg = process.argv[3];

    switch (command) {
        case 'users:create': {
            const count = arg ? Number(arg) : 1;
            if (isNaN(count) || count < 1) {
                console.error('❌ Invalid count. Use: users:create [count]');
                return;
            }
            await createDummyUsers(count);
            break;
        }

        case 'users:delete': {
            if (arg === 'all') {
                await deleteDummyUsers('all');
            } else {
                const count = arg ? Number(arg) : 1;
                if (isNaN(count) || count < 1) {
                    console.error('❌ Invalid count. Use: users:delete [count|all]');
                    return;
                }
                await deleteDummyUsers(count);
            }
            break;
        }

        case 'article:create':
            await createDummyArticle();
            break;

        case 'article:delete':
            await deleteAllDummyArticles();
            break;

        default:
            console.log('Usage:');
            console.log('  npx tsx prisma/seedDummy.ts users:create [count]');
            console.log('  npx tsx prisma/seedDummy.ts users:delete [count|all]');
            console.log('  npx tsx prisma/seedDummy.ts article:create');
            console.log('  npx tsx prisma/seedDummy.ts article:delete');
            return;
    }
}

main().finally(() => prisma.$disconnect());
