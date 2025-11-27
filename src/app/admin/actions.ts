// src/app/admin/actions.ts
'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { auth } from '@/app/api/auth/config';
import { isAdmin } from '@/lib/admins';

export async function deleteArticle(articleId: number) {
    const session = await auth();
    if (!session?.user || !isAdmin(session.user)) {
        throw new Error('Unauthorized');
    }

    try {
        await prisma.articles.delete({
            where: { id: articleId }
        });
    } catch (error: unknown) {
        if (isPrismaNotFoundError(error)) {
            // Record not found - already deleted
            revalidatePath('/admin');
            return { success: true, alreadyDeleted: true };
        }
        throw error;
    }

    revalidatePath('/admin');
    return { success: true };
}

// Helper for Prisma-specific error checking
function isPrismaNotFoundError(error: unknown): error is { code: string } {
    return (
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        (error as { code?: unknown }).code === 'P2025'
    );
}



export async function bulkDeleteArticles(articleIds: number[]) {
    const session = await auth();
    if (!session?.user || !isAdmin(session.user)) {
        throw new Error('Unauthorized');
    }

    const result = await prisma.articles.deleteMany({
        where: { id: { in: articleIds } }
    });

    revalidatePath('/admin');
    return { deletedCount: result.count };
}

export async function updateArticle(id: number, data: Partial<{ title: string; subtitle?: string; content: string; image_url?: string; category?: string }>) {
    const session = await auth();
    if (!session?.user?.id || !isAdmin(session.user)) {
        throw new Error('Unauthorized');
    }

    await prisma.articles.update({
        where: { id },
        data: {
            ...data,
            updated_at: new Date(),
        }
    });

    revalidatePath('/admin');
    return { success: true };
}