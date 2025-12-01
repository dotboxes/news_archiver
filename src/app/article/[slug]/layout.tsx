import { Metadata } from 'next';

interface Props {
    params: { slug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/article/${params.slug}`, {
            cache: 'no-store'
        });

        if (!response.ok) {
            return {
                title: 'Article Not Found',
            };
        }

        const data = await response.json();

        return {
            title: `${data.article.title} - Potato Archive`,
            description: data.article.subtitle || data.article.content?.substring(0, 160),
        };
    } catch (error) {
        return {
            title: 'Article Not Found',
        };
    }
}

export default function ArticleLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}