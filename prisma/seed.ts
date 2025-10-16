import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

async function main() {
    const years = [2023, 2024, 2025];
    const months = Array.from({ length: 12 }, (_, i) => i); // 0-11

    for (let i = 0; i < 50; i++) {
        const year = years[Math.floor(Math.random() * years.length)];
        const month = months[Math.floor(Math.random() * months.length)];
        const day = Math.floor(Math.random() * 28) + 1;

        const publishedDate = new Date(year, month, day);

        await prisma.articles.create({
            data: {
                title: faker.lorem.sentence(),
                subtitle: faker.lorem.sentences(2),
                slug: faker.helpers.slugify(faker.lorem.words(3)) + '-' + i,
                content: faker.lorem.paragraphs(3),
                image_url: `https://picsum.photos/400/300?random=${i}`,
                author: faker.person.fullName(),       // ✅ updated
                category: faker.helpers.arrayElement(['Tech', 'Programming', 'Design', 'Science']),
                published_date: publishedDate,
            },
        });
    }

    console.log('Seeded 50 articles across multiple months/years!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
