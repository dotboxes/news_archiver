import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q')?.trim() || '';

    try {
        // Fetch articles with optional search
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

        let message = 'Database error';
        if (err instanceof Error) {
            message = err.message;
        }

        return NextResponse.json(
            { error: 'Database error', details: message },
            { status: 500 }
        );
    }
}