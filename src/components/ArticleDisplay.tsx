// components/ArticleDisplay.tsx
'use client';

import { processArticleContent } from '@/lib/contentProcessor';
import Link from 'next/link';

interface ArticleDisplayProps {
    title: string;
    subtitle?: string | null;
    content: string;
    author?: string | null;
    published_date?: string | null;
    image_url?: string | null;
}

export default function ArticleDisplay({
                                           title,
                                           subtitle,
                                           content,
                                           author,
                                           published_date,
                                           image_url
                                       }: ArticleDisplayProps) {
    const { content: cleanContent, sources } = processArticleContent(content);

    return (
        <article className="max-w-4xl mx-auto px-4 py-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-4xl font-bold text-gray-900 mb-2">{title}</h1>
                {subtitle && <p className="text-xl text-gray-600 mb-4">{subtitle}</p>}

                <div className="flex items-center gap-4 text-sm text-gray-500 border-t border-b border-gray-200 py-4">
                    {author && <span className="font-medium">{author}</span>}
                    {published_date && (
                        <span>
                            {new Date(published_date).toLocaleDateString('en-US', {
                                month: 'long',
                                day: 'numeric',
                                year: 'numeric'
                            })}
                        </span>
                    )}
                </div>
            </div>

            {/* Featured Image */}
            {image_url && (
                <div className="mb-8">
                    <img
                        src={image_url}
                        alt={title}
                        className="w-full h-96 object-cover rounded-lg"
                    />
                </div>
            )}

            {/* Main Content */}
            <div className="prose prose-lg max-w-none mb-12">
                {cleanContent.split('\n\n').map((paragraph, idx) => (
                    <p key={idx} className="text-gray-700 leading-relaxed mb-4">
                        {paragraph}
                    </p>
                ))}
            </div>

            {/* Sources Section */}
            {sources.length > 0 && (
                <section className="border-t-2 border-gray-300 pt-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Sources</h2>
                    <ul className="space-y-3">
                        {sources.map((source, idx) => (
                            <li key={idx}>
                                <Link
                                    href={source.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:text-blue-800 hover:underline break-all"
                                >
                                    {source.title}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </section>
            )}
        </article>
    );
}