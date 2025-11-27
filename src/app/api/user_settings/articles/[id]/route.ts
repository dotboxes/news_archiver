import { NextResponse } from 'next/server';
import {prisma} from "@/lib/prisma";

export async function PUT(request: Request) {
    try {
        const { title, subtitle, content, image_url, category } = await request.json();

        // Extract article ID from URL
        const url = new URL(request.url);
        const articleId = parseInt(url.pathname.split('/').pop() || '');

        const article = await prisma.articles.findUnique({
            where: { id: articleId },
        });

        if (!article) {
            return NextResponse.json({ error: 'Article not found' }, { status: 404 });
        }

        const updated = await prisma.articles.update({
            where: { id: articleId },
            data: {
                title,
                subtitle,
                content,
                image_url,
                category,
                updated_at: new Date(),
            },
        });

        return NextResponse.json(updated);
    } catch (error) {
        console.error('Error updating article:', error);
        return NextResponse.json(
            { error: 'Failed to update article' },
            { status: 500 }
        );
    }
}

export async function DELETE(request: Request) {
    try {
        // Extract article ID from URL
        const url = new URL(request.url);
        const articleId = parseInt(url.pathname.split('/').pop() || '');

        const article = await prisma.articles.findUnique({
            where: { id: articleId },
        });

        if (!article) {
            return NextResponse.json({ error: 'Article not found' }, { status: 404 });
        }

        await prisma.articles.delete({
            where: { id: articleId },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting article:', error);
        return NextResponse.json(
            { error: 'Failed to delete article' },
            { status: 500 }
        );
    }
}

