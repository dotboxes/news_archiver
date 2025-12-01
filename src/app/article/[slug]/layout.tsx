// app/article/[slug]/layout.tsx
import { Metadata } from 'next';

interface Props {
    params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;

    try {
        const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';

        const response = await fetch(`${baseUrl}/api/article/${slug}`, {
            cache: 'no-store'
        });

        if (!response.ok) {
            return {
                title: 'Article Not Found - Potato Archive',
            };
        }

        const data = await response.json();

        return {
            title: `${data.article.title} - Potato Archive`,
            description: data.article.subtitle || data.article.content?.substring(0, 160),
        };
    } catch (error) {
        console.error('Error fetching article metadata:', error);
        return {
            title: 'Article Not Found - Potato Archive',
        };
    }
}

export default function ArticleLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}