import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

interface Params {
    slug: string;
}

export async function GET(
    _request: Request,
    context: { params: Params }
) {
    const { slug } = context.params;

    try {
        const article = await prisma.articles.findUnique({
            where: { slug },
            select: {
                id: true,
                title: true,
                subtitle: true,
                slug: true,
                content: true,
                image_url: true,
                author: true,
                category: true,
                published_date: true,
                created_at: true,
                updated_at: true,
            },
        });

        if (!article) {
            return NextResponse.json({ error: 'Article not found' }, { status: 404 });
        }

        return NextResponse.json({ article });
    } catch (err: unknown) {
        console.error('Prisma query failed:', err);

        const message = err instanceof Error ? err.message : 'Database error';

        return NextResponse.json(
            { error: 'Database error', details: message },
            { status: 500 }
        );
    }
}
