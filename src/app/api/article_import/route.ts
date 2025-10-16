// app/api/article_import/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
    try {
        const body = await request.json();

        let slug = body.slug;
        let attempt = 0;

        // Keep trying slug variants until we find an unused one
        while (attempt < 100) {
            const existing = await prisma.articles.findUnique({
                where: { slug },
            });

            if (!existing) {
                // Slug is available, use it
                break;
            }

            // Slug exists, try next variant
            attempt++;
            slug = `${body.slug}-${attempt}`;
        }

        if (attempt >= 100) {
            return NextResponse.json(
                { error: 'Could not generate unique slug after 100 attempts' },
                { status: 400 }
            );
        }

        const article = await prisma.articles.create({
            data: {
                title: body.title,
                subtitle: body.subtitle || null,
                slug: slug,
                content: body.content,
                image_url: body.image_url || null,
                author: body.author,
                category: body.category || null,
                published_date: new Date(body.published_date),
            },
        });

        return NextResponse.json(article, { status: 201 });
    } catch (err: unknown) {
        console.error('Failed to create article:', err);
        return NextResponse.json(
            { error: 'Failed to create article' },
            { status: 500 }
        );
    }
}