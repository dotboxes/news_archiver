import { ArticlePreview } from '@/lib/database';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { parseAuthorField, Author } from '@/lib/parseAuthor';

type ArticlePreviewWithAuthor = ArticlePreview & {
    userImage?: string | null;
    thumbnail_url?: string | null;
};

interface ArticleCardProps {
    article: ArticlePreviewWithAuthor;
}

// Cache for author data
const authorCache = new Map<string, Author | null>();

export default function ArticleCard({ article }: ArticleCardProps) {
    const [mediaLoaded, setMediaLoaded] = useState(false);
    const [textLoaded, setTextLoaded] = useState(false);
    const [imgLoaded, setImgLoaded] = useState(false);
    const [author, setAuthor] = useState<Author | null>(null);
    const [thumbnail, setThumbnail] = useState<string | null>(null);

    const isVideo = article.media_type === 'video';

    // Automatically mark text as loaded once media has loaded
    useEffect(() => {
        if (mediaLoaded && !textLoaded) {
            const timeout = setTimeout(() => setTextLoaded(true), 100);
            return () => clearTimeout(timeout);
        }
    }, [mediaLoaded, textLoaded]);

    // Fetch author info with caching
    useEffect(() => {
        if (authorCache.has(article.slug)) {
            setAuthor(authorCache.get(article.slug)!);
            return;
        }

        const fetchAuthor = async () => {
            try {
                const response = await fetch(`/api/article/${article.slug}`);
                if (!response.ok) throw new Error('Failed to fetch author');
                const data = await response.json();
                const parsedAuthor = parseAuthorField(data.article.author, data.article.userImage);
                authorCache.set(article.slug, parsedAuthor);
                setAuthor(parsedAuthor);
            } catch (err) {
                console.error('Author fetch failed:', err);
                const fallbackAuthor = parseAuthorField(article.author, null);
                authorCache.set(article.slug, fallbackAuthor);
                setAuthor(fallbackAuthor);
            }
        };

        fetchAuthor();
    }, [article.slug, article.author]);

    // Generate thumbnail for videos
    useEffect(() => {
        if (isVideo && article.image_url) {
            // YouTube handling
            const youtubeMatch = article.image_url.match(/(?:youtube\.com\/embed\/|youtu\.be\/)([^\?&\/]+)/);
            if (youtubeMatch && youtubeMatch[1]) {
                setThumbnail(`https://img.youtube.com/vi/${youtubeMatch[1]}/hqdefault.jpg`);
            }
            // HTML5 video thumbnail generation
            else {
                const video = document.createElement('video');
                video.crossOrigin = 'anonymous';
                video.src = article.image_url;
                video.muted = true; // Muted to allow autoplay in some browsers

                const handleLoadedData = () => {
                    // Seek to 1 second (or 10% of duration for shorter videos)
                    video.currentTime = Math.min(3, video.duration * 0.1);
                };

                const handleSeeked = () => {
                    const canvas = document.createElement('canvas');
                    canvas.width = video.videoWidth;
                    canvas.height = video.videoHeight;

                    const ctx = canvas.getContext('2d');
                    if (ctx) {
                        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

                        const thumbnailUrl = canvas.toDataURL('image/jpeg', 0.8);
                        setThumbnail(thumbnailUrl);
                    }

                    // Clean up
                    cleanup();
                };

                const handleError = () => {
                    // Fallback to thumbnail_url or image_url on error, or null if neither exists
                    setThumbnail(article.thumbnail_url || article.image_url || null);
                    cleanup();
                };

                const cleanup = () => {
                    video.removeEventListener('loadeddata', handleLoadedData);
                    video.removeEventListener('seeked', handleSeeked);
                    video.removeEventListener('error', handleError);
                    video.remove();
                };

                video.addEventListener('loadeddata', handleLoadedData);
                video.addEventListener('seeked', handleSeeked);
                video.addEventListener('error', handleError);

                video.load();

                // Cleanup on unmount
                return cleanup;
            }
        }
    }, [article.image_url, article.thumbnail_url, isVideo]);

    const displayImage = isVideo ? thumbnail : article.image_url;

    return (
        <Link href={`/article/${article.slug}`}>
            <div className="bg-secondary rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 cursor-pointer h-full flex flex-col">
                {/* Media */}
                <div className="w-full h-48 relative overflow-hidden bg-tertiary">
                    {!mediaLoaded && (
                        <div className="absolute inset-0 animate-pulse bg-tertiary"></div>
                    )}
                    {displayImage && (
                        <img
                            src={displayImage}
                            alt={article.title}
                            className={`w-full h-full object-cover transition-transform duration-300 hover:scale-105 ${mediaLoaded ? 'block' : 'hidden'}`}
                            onLoad={() => setMediaLoaded(true)}
                        />
                    )}
                </div>

                {/* Content */}
                <div className="p-6 flex-1 flex flex-col">
                    {/* Skeleton for text */}
                    {!textLoaded && (
                        <div className="space-y-2">
                            {article.category && (
                                <div className="h-4 w-20 bg-tertiary rounded animate-pulse"></div>
                            )}
                            <div className="h-6 bg-tertiary rounded w-3/4 animate-pulse"></div>
                            {article.subtitle && (
                                <div className="h-4 bg-tertiary rounded w-full animate-pulse"></div>
                            )}
                            <div className="h-4 bg-tertiary rounded w-1/2 animate-pulse mt-4"></div>
                        </div>
                    )}

                    {/* Actual text */}
                    <div className={`${textLoaded ? 'flex flex-col flex-1' : 'hidden'}`}>
                        {article.category && (
                            <span className="inline-block bg-blue-200 text-blue-800 text-xs font-semibold px-2 py-1 rounded-full mb-3 w-fit">
                                {article.category}
                            </span>
                        )}

                        <h2 className="text-xl font-bold text-primary mb-2 hover:text-[rgb(var(--primary))] transition-colors">
                            {article.title}
                        </h2>

                        {article.subtitle ? (
                            <p className="text-secondary mb-4 line-clamp-2">{article.subtitle}</p>
                        ) : (
                            <div className="flex-1"></div>
                        )}

                        <div className="flex-1"></div>

                        <div className="flex items-center justify-between text-sm text-secondary pt-4 border-t border-default">
                            {author && (
                                <div className="flex items-center gap-2">
                                    {author.image ? (
                                        <div className="relative w-6 h-6 rounded-full overflow-hidden bg-tertiary">
                                            {!imgLoaded && (
                                                <div className="absolute inset-0 animate-pulse bg-tertiary"></div>
                                            )}
                                            <img
                                                src={author.image}
                                                alt={author.name}
                                                className={`w-6 h-6 rounded-full object-cover ${imgLoaded ? 'block' : 'hidden'}`}
                                                onLoad={() => setImgLoaded(true)}
                                            />
                                        </div>
                                    ) : (
                                        <svg
                                            className="w-6 h-6 text-tertiary"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                            />
                                        </svg>
                                    )}
                                    <span className="font-medium">{author.name}</span>
                                </div>
                            )}
                            {article.published_date && (
                                <span>
                                    {new Date(article.published_date).toLocaleDateString('en-US', {
                                        month: 'short',
                                        day: 'numeric',
                                        year: 'numeric',
                                    })}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    );
}
