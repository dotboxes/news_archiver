'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { auth } from '@/app/api/auth/config';
import { parseAuthorField } from '@/lib/parseAuthor';
import { isAdmin } from "@/lib/admins";
import { Article } from "@/lib/database";

// Delete a single article owned by the current user
export async function deleteArticle(articleId: number) {
    const session = await auth();
    if (!session?.user?.id) throw new Error('Unauthorized');

    // ✅ FIX: Extract the non-null user object to satisfy TypeScript's narrowing
    const currentUser = session.user;

    // Fetch the article
    const article = await prisma.articles.findUnique({
        where: { id: articleId },
        select: { author: true }
    });

    if (!article) {
        revalidatePath('/settings');
        return { success: true, alreadyDeleted: true };
    }

    const parsed = parseAuthorField(article.author ?? '');
    const isOwner =
        parsed?.discord_id === currentUser.id || // Use currentUser
        parsed?.name === currentUser.name ||     // Use currentUser
        article.author === currentUser.id ||     // Use currentUser
        article.author === currentUser.name;     // Use currentUser

    if (!isOwner && !isAdmin(currentUser)) {
        throw new Error("Unauthorized");
    }
    try {
        await prisma.articles.delete({ where: { id: articleId } });
    } catch (error: unknown) {
        // Handle P2025 (Record to delete was not found) error gracefully
        if (typeof error === 'object' && error && 'code' in error && (error as { code?: string }).code === 'P2025') {
            revalidatePath('/settings');
            return { success: true, alreadyDeleted: true };
        }
        throw error;
    }

    revalidatePath('/settings');
    return { success: true };
}

// Bulk delete all owned articles
export async function bulkDeleteArticles(articleIds: number[]) {
    const session = await auth();
    if (!session?.user?.id) throw new Error('Unauthorized');

    // ✅ FIX: Extract the non-null user object to satisfy TypeScript's narrowing
    const currentUser = session.user;

    if (!Array.isArray(articleIds) || articleIds.length === 0) {
        return { deletedCount: 0 };
    }

    // Fetch candidate articles
    const candidates = await prisma.articles.findMany({
        where: { id: { in: articleIds } },
        select: { id: true, author: true }
    });

    // Determine which articles are owned by the current user
    const ownedIds = candidates
        .filter(art => {
            if (isAdmin(currentUser)) return true;
            const parsed = parseAuthorField(art.author ?? '');
            return (
                parsed?.discord_id === currentUser.id || // Use currentUser
                parsed?.name === currentUser.name ||     // Use currentUser
                art.author === currentUser.id ||         // Use currentUser
                art.author === currentUser.name
            );
        })
        .map(art => art.id);

    if (ownedIds.length === 0) {
        return { deletedCount: 0 };
    }

    const result = await prisma.articles.deleteMany({
        where: { id: { in: ownedIds } }
    });

    revalidatePath('/settings');
    return { deletedCount: result.count };
}

async function updateArticle(id: number, data: Partial<Article>) {
    const session = await auth();
    if (!session?.user?.id) throw new Error('Unauthorized');

    // ✅ FIX: Extract the non-null user object to satisfy TypeScript's narrowing
    const currentUser = session.user;

    // Fetch the article
    const article = await prisma.articles.findUnique({
        where: { id },
        select: { author: true }
    });

    if (!article) throw new Error('Article not found');

    const parsed = parseAuthorField(article.author ?? '');
    const isOwner =
        parsed?.discord_id === currentUser.id || // Use currentUser
        parsed?.name === currentUser.name ||     // Use currentUser
        article.author === currentUser.id ||     // Use currentUser
        article.author === currentUser.name;     // Use currentUser

    if (!isOwner && !isAdmin(currentUser)) {
        throw new Error("Unauthorized");
    }

    // Update
    const updated = await prisma.articles.update({
        where: { id },
        data: {
            ...data,
            updated_at: new Date(),
        }
    });

    revalidatePath('/settings');
    return updated;
}

export default updateArticle;