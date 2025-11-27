import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/app/api/auth/config';
import { isAdmin } from '@/lib/admins';
import { prisma } from '@/lib/prisma';

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> } // <-- note the Promise here
) {
    const { id } = await params; // must await
    const session = await auth();

    if (!session?.user || !isAdmin(session.user)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const articleId = parseInt(id);

    if (isNaN(articleId)) {
        return NextResponse.json({ error: 'Invalid article ID' }, { status: 400 });
    }

    try {
        await prisma.articles.delete({
            where: { id: articleId },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting article:', error);
        return NextResponse.json({ error: 'Failed to delete article' }, { status: 500 });
    }
}
