import { NextResponse } from 'next/server';
import {prisma} from "@/lib/prisma";

export async function GET(request: Request) {
    const url = new URL(request.url);
    const slug = url.pathname.split('/').pop();

    if (!slug) {
        return NextResponse.json({ error: 'Missing slug' }, { status: 400 });
    }

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
                media_type: true,
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

        console.log('Article author field:', article.author);

        // Fetch user image if author has discord_id
        let userImage = null;
        if (article.author) {
            try {
                const authorData = JSON.parse(article.author);
                console.log('Parsed author data:', authorData);

                if (authorData.discord_id) {
                    // Look up user by Discord provider account
                    const account = await prisma.account.findFirst({
                        where: {
                            provider: 'discord',
                            providerAccountId: authorData.discord_id
                        },
                        include: {
                            user: {
                                select: { image: true, name: true }
                            }
                        }
                    });
                    console.log('Found account:', account);
                    userImage = account?.user?.image;
                }
            } catch (e) {
                // Not JSON - it's an old-style plain string author name
                console.log('Author is plain string (old format)');
            }
        }

        console.log('Final userImage:', userImage);

        return NextResponse.json({
            article: {
                ...article,
                userImage
            }
        });
    } catch (err: unknown) {
        console.error('Database query failed:', err);
        const message = err instanceof Error ? err.message : 'Database error';
        return NextResponse.json({ error: 'Database error', details: message }, { status: 500 });
    }
}