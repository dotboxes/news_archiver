import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
    request: Request,
    { params }: { params: { slug: string } }
) {
    const { slug } = params;

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
    } catch (err: any) {
        console.error('Prisma query failed:', err);
        return NextResponse.json({ error: 'Database error', details: err.message }, { status: 500 });
    }
}
