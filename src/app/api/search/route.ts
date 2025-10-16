import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
    const url = new URL(request.url);
    const query = url.searchParams.get('q')?.trim() || '';

    try {
        const articles = await prisma.articles.findMany({
            where: query
                ? {
                    OR: [
                        { title: { contains: query, mode: 'insensitive' } },
                        { subtitle: { contains: query, mode: 'insensitive' } },
                        { content: { contains: query, mode: 'insensitive' } },
                    ],
                }
                : {},
            orderBy: { published_date: 'desc' },
        });

        return NextResponse.json({ articles });
    } catch (err: unknown) {
        console.error('Database query failed:', err);
        const message = err instanceof Error ? err.message : 'Database error';
        return NextResponse.json({ error: 'Database error', details: message }, { status: 500 });
    }
}
