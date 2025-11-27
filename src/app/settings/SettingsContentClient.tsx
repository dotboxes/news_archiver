'use client';

import { useEffect, useState } from 'react';
import ArticlesManager from '@/components/ArticlesManager';
import { parseAuthorField, Author } from '@/lib/parseAuthor';

interface SettingsContentProps {
    allArticles: {
        id: number;
        title: string;
        slug: string;
        published_date: Date | string | null;
        author?: string | null;
    }[];
    currentUserId: string;
}

export default function SettingsContentClient({ allArticles, currentUserId }: SettingsContentProps) {
    const [articles, setArticles] = useState<typeof allArticles>([]);

    useEffect(() => {
        const filtered = allArticles.filter(art => {
            // ✅ Fix TS2345
            const parsed = parseAuthorField(art.author ?? '');
            return parsed?.discord_id === currentUserId || parsed?.name === currentUserId;
        });
        setArticles(filtered);
    }, [allArticles, currentUserId]);

    return (
        <main className="min-h-screen bg-primary p-8">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-4xl font-bold text-primary mb-8">My Articles</h1>
                {articles.length === 0 ? (
                    <div className="text-center py-12 bg-secondary rounded-xl">
                        <p className="text-secondary mb-4">You haven&#39;t published any articles yet.</p>
                        <p className="text-sm text-tertiary">Debug: User ID = {currentUserId}</p>
                    </div>
                ) : (
                    // ✅ Fix TS2322: Add dummy content
                    <ArticlesManager allArticles={articles.map(a => ({ ...a, content: '' }))} />
                )}
            </div>
        </main>
    );
}
