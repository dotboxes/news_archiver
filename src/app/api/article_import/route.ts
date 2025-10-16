// app/api/article_import/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
    try {
        const body = await request.json();

        const article_import = await prisma.articles.create({
            data: {
                title: body.title,
                subtitle: body.subtitle || null,
                slug: body.slug,
                content: body.content,
                image_url: body.image_url || null,
                author: body.author,
                category: body.category || null,
                published_date: new Date(body.published_date),
            },
        });

        return NextResponse.json(article_import, { status: 201 });
    } catch (err: unknown) {
        console.error('Failed to create article:', err);
        return NextResponse.json(
            { error: 'Failed to create article' },
            { status: 500 }
        );
    }
}