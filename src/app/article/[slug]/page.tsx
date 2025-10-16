'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { articles as ArticleType } from '@prisma/client';
import Link from 'next/link';

interface ProcessedContent {
    content: string;
    sources: Array<{ url: string; title: string }>;
}

function processArticleContent(rawContent: string): ProcessedContent {
    // Extract all URLs
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const sources: Array<{ url: string; title: string }> = [];
    const urlMatches = rawContent.match(urlRegex) || [];

    urlMatches.forEach((url) => {
        const cleanUrl = url.replace(/[.,;:!?'")\]]+$/, '');
        if (!sources.some(s => s.url === cleanUrl)) {
            try {
                const urlObj = new URL(cleanUrl);
                const title = urlObj.hostname.replace('www.', '');
                sources.push({ url: cleanUrl, title });
            } catch {
                sources.push({ url: cleanUrl, title: cleanUrl });
            }
        }
    });

    // Remove URLs from content
    let cleanContent = rawContent.replace(urlRegex, '').trim();

    // Remove markdown formatting
    cleanContent = cleanContent.replace(/\*\*\*(.+?)\*\*\*/g, '$1'); // ***text*** -> text
    cleanContent = cleanContent.replace(/\*\*(.+?)\*\*/g, '$1');     // **text** -> text
    cleanContent = cleanContent.replace(/\*(.+?)\*/g, '$1');         // *text* -> text
    cleanContent = cleanContent.replace(/~~(.+?)~~/g, '$1');         // ~~text~~ -> text

    // Clean up extra whitespace
    cleanContent = cleanContent.replace(/\n\s*\n/g, '\n\n');

    return {
        content: cleanContent,
        sources
    };
}

export default function ArticlePage() {
    const params = useParams();
    const router = useRouter();
    const slug = params.slug as string;

    const [article, setArticle] = useState<ArticleType | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [processedContent, setProcessedContent] = useState<ProcessedContent | null>(null);

    useEffect(() => {
        const fetchArticle = async () => {
            try {
                setLoading(true);
                const response = await fetch(`/api/article/${slug}`);

                if (!response.ok) {
                    throw new Error('Article not found');
                }

                const data = await response.json();
                setArticle(data.article);
                setProcessedContent(processArticleContent(data.article.content));
                setError(null);
            } catch (err) {
                setError('Failed to load article');
                console.error('Fetch error:', err);
            } finally {
                setLoading(false);
            }
        };

        if (slug) {
            fetchArticle();
        }
    }, [slug]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (error || !article) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Article Not Found</h2>
                    <p className="text-gray-600 mb-6">{error || 'The article you are looking for does not exist.'}</p>
                    <button
                        onClick={() => router.push('/')}
                        className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600"
                    >
                        Back to Home
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Back Button */}
                <button
                    onClick={() => router.push('/')}
                    className="mb-6 text-blue-600 hover:text-blue-700 flex items-center gap-2"
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back to Articles
                </button>

                {/* Article Header */}
                <article className="bg-white rounded-lg shadow-md overflow-hidden">
                    {/* Featured Image */}
                    {article.image_url && (
                        <div className="w-full h-96 relative">
                            <img
                                src={article.image_url}
                                alt={article.title}
                                className="w-full h-full object-cover"
                            />
                        </div>
                    )}

                    {/* Article Content */}
                    <div className="p-8">
                        {/* Category Badge */}
                        {article.category && (
                            <span className="inline-block bg-blue-100 text-blue-800 text-xs font-semibold px-3 py-1 rounded-full mb-4">
                                {article.category}
                            </span>
                        )}

                        {/* Title */}
                        <h1 className="text-4xl font-bold text-gray-900 mb-4">
                            {article.title}
                        </h1>

                        {/* Subtitle */}
                        {article.subtitle && (
                            <p className="text-xl text-gray-600 mb-6">
                                {article.subtitle}
                            </p>
                        )}

                        {/* Meta Information */}
                        <div className="flex items-center gap-4 text-sm text-gray-500 mb-8 pb-8 border-b border-gray-200">
                            {article.author && (
                                <div className="flex items-center gap-2">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                    <span>{article.author}</span>
                                </div>
                            )}
                            {article.published_date && (
                                <div className="flex items-center gap-2">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    <span>{new Date(article.published_date).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}</span>
                                </div>
                            )}
                        </div>

                        {/* Article Content */}
                        <div className="prose prose-lg max-w-none mb-12">
                            <div className="text-gray-700 leading-relaxed">
                                {processedContent?.content.split('\n\n').map((paragraph, idx) => (
                                    <p key={idx} className="mb-4">
                                        {paragraph}
                                    </p>
                                ))}
                            </div>
                        </div>

                        {/* Sources Section */}
                        {processedContent && processedContent.sources.length > 0 && (
                            <section className="border-t-2 border-gray-300 pt-8">
                                <h2 className="text-2xl font-bold text-gray-900 mb-6">Sources</h2>
                                <ul className="space-y-3">
                                    {processedContent.sources.map((source, idx) => (
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
                    </div>
                </article>
            </div>
        </div>
    );
}