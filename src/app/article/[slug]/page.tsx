'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { articles as ArticleType } from '@prisma/client';
import { parseAuthorField } from '@/lib/parseAuthor';
import { processArticleContent, ProcessedContent } from '@/lib/contentProcessor';
import MarkdownContent from '@/components/MarkdownContent';
import Link from 'next/link';

export interface Author {
    name: string;
    discord_id?: string;
    image?: string | null;
}

export interface ArticleWithAuthor extends ArticleType {
    parsedAuthor?: Author;
    userImage?: string | null;
}

export default function ArticlePage() {
    const params = useParams();
    const router = useRouter();
    const slug = params.slug as string;

    const [article, setArticle] = useState<ArticleWithAuthor | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [processedContent, setProcessedContent] = useState<ProcessedContent | null>(null);
    const [imgLoaded, setImgLoaded] = useState(false);

    useEffect(() => {
        const fetchArticle = async () => {
            try {
                setLoading(true);
                const response = await fetch(`/api/article/${slug}`);
                if (!response.ok) throw new Error('Article not found');

                const data = await response.json();
                console.log('API response:', data);

                const articleData: ArticleWithAuthor = {
                    ...data.article,
                    parsedAuthor: parseAuthorField(data.article.author, data.article.userImage)
                };

                setArticle(articleData);
                setProcessedContent(processArticleContent(data.article.content));
                setError(null);
            } catch (err) {
                setError('Failed to load article');
                console.error('Fetch error:', err);
            } finally {
                setLoading(false);
            }
        };

        if (slug) fetchArticle();
    }, [slug]);

    if (loading) {
        return (
            <div className="min-h-screen bg-[rgb(var(--bg-primary))] flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[rgb(var(--primary))]"></div>
            </div>
        );
    }

    if (error || !article) {
        return (
            <div className="min-h-screen bg-primary flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Article Not Found</h2>
                    <p className="text-gray-600 mb-6">{error || 'The article you are looking for does not exist.'}</p>
                    <button
                        onClick={() => router.push('/')}
                        className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-600"
                    >
                        Back to Home
                    </button>
                </div>
            </div>
        );
    }

    const hasSubtitle = Boolean(article?.subtitle && article.subtitle.trim().length > 0);
    const hasContent = Boolean(processedContent?.content && processedContent.content.trim().length > 0);

    return (
        <div className="min-h-screen bg-primary py-8">
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
                <article className="bg-secondary rounded-lg shadow-md overflow-hidden">
                    {/* Featured Image/Video */}
                    {article.image_url && (
                        <div className="w-full h-96 relative bg-gray-200 flex items-center justify-center">
                            {article.media_type === 'video' &&
                            (article.image_url.toLowerCase().indexOf('youtube.com/embed') !== -1 ||
                                article.image_url.toLowerCase().indexOf('youtu.be') !== -1) ? (
                                <iframe
                                    src={article.image_url}
                                    title="YouTube video player"
                                    className="w-full h-full"
                                    frameBorder="0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                    allowFullScreen
                                />
                            ) : article.media_type === 'video' ? (
                                <video
                                    src={article.image_url}
                                    controls
                                    preload="metadata"
                                    className="w-full h-full object-contain"
                                />
                            ) : (
                                <img
                                    src={article.image_url}
                                    alt={article.title}
                                    className="w-full h-full object-cover"
                                />
                            )}
                        </div>
                    )}

                    {/* Article Content */}
                    <div className="p-8">
                        {/* Category Badge */}
                        {article.category && (
                            <span className="inline-block bg-blue-200 text-blue-800 text-xs font-semibold px-3 py-1 rounded-full mb-4">
                                {article.category}
                            </span>
                        )}

                        {/* Title */}
                        <h1 className="text-4xl font-bold text-primary mb-4">{article.title}</h1>

                        {/* Subtitle */}
                        {article.subtitle && (
                            <p className="text-xl text-secondary mb-6">{article.subtitle}</p>
                        )}

                        {/* Meta Information */}
                        <div className={`flex items-center gap-4 text-sm text-secondary mb-8 pb-8 ${(hasSubtitle || hasContent) ? 'border-b-2 border-gray-300' : ''}`}>
                            {article.parsedAuthor && (
                                <div className="flex items-center gap-2">
                                    {article.parsedAuthor.image ? (
                                        <div className="relative w-8 h-8 rounded-full overflow-hidden bg-gray-200">
                                            {!imgLoaded && (
                                                <div className="absolute inset-0 animate-pulse bg-gray-300"></div>
                                            )}
                                            <img
                                                src={article.parsedAuthor.image}
                                                alt={article.parsedAuthor.name}
                                                className={`w-8 h-8 rounded-full object-cover ${imgLoaded ? 'block' : 'hidden'}`}
                                                onLoad={() => setImgLoaded(true)}
                                            />
                                        </div>
                                    ) : (
                                        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                    )}
                                    <span className="font-medium">{article.parsedAuthor.name}</span>
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

                        {/* Main Content - NOW WITH MARKDOWN */}
                        {processedContent && hasContent && (
                            <div className="mb-12">
                                <MarkdownContent content={processedContent.content} />
                            </div>
                        )}

                        {/* Sources Section */}
                        {processedContent && processedContent.sources.length > 0 && (
                            <section className={`pt-8 ${hasContent ? 'border-t-2 border-gray-300' : ''}`}>
                                <h2 className="text-2xl font-bold text-primary mb-6">Sources</h2>
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