import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/app/api/auth/config';
import { isAdmin } from '@/lib/admins';
import { prisma } from '@/lib/prisma';

export async function DELETE(req: NextRequest) {
    const session = await auth();

    if (!session?.user || !isAdmin(session.user)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { articleIds } = await req.json();

    if (!Array.isArray(articleIds) || articleIds.length === 0) {
        return NextResponse.json({ error: 'Invalid article IDs' }, { status: 400 });
    }

    try {
        await prisma.articles.deleteMany({
            where: {
                id: { in: articleIds }
            }
        });

        return NextResponse.json({
            success: true,
            deletedCount: articleIds.length
        });
    } catch (error) {
        console.error('Error deleting articles:', error);
        return NextResponse.json({ error: 'Failed to delete articles' }, { status: 500 });
    }
}