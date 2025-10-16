import { ArticlePreview } from '@/lib/database';
import Link from 'next/link';
import { useState, useEffect } from 'react';

interface ArticleCardProps {
    article: ArticlePreview;
}

export default function ArticleCard({ article }: ArticleCardProps) {
    const [imgLoaded, setImgLoaded] = useState(false);
    const [textLoaded, setTextLoaded] = useState(false);

    // Automatically mark text as loaded once image has loaded
    useEffect(() => {
        if (imgLoaded && !textLoaded) {
            const timeout = setTimeout(() => setTextLoaded(true), 100);
            return () => clearTimeout(timeout);
        }
    }, [imgLoaded, textLoaded]);

    return (
        <Link href={`/article/${article.slug}`}>
            <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 cursor-pointer h-full flex flex-col">
                {/* Image */}
                <div className="w-full h-48 relative overflow-hidden bg-gray-200">
                    {!imgLoaded && (
                        <div className="absolute inset-0 animate-pulse bg-gray-300"></div>
                    )}
                    {article.image_url && (
                        <img
                            src={article.image_url}
                            alt={article.title}
                            className={`w-full h-full object-cover transition-transform duration-300 hover:scale-105 ${imgLoaded ? 'block' : 'hidden'}`}
                            onLoad={() => setImgLoaded(true)}
                        />
                    )}
                </div>

                {/* Content */}
                <div className="p-6 flex-1 flex flex-col">
                    {/* Skeleton for text */}
                    {!textLoaded && (
                        <div className="space-y-2">
                            {article.category && (
                                <div className="h-4 w-20 bg-gray-300 rounded animate-pulse"></div>
                            )}
                            <div className="h-6 bg-gray-300 rounded w-3/4 animate-pulse"></div>
                            {article.subtitle && (
                                <div className="h-4 bg-gray-300 rounded w-full animate-pulse"></div>
                            )}
                            <div className="h-4 bg-gray-300 rounded w-1/2 animate-pulse mt-4"></div>
                        </div>
                    )}

                    {/* Actual text */}
                    <div className={textLoaded ? 'block' : 'hidden'}>
                        {/* Category */}
                        {article.category && (
                            <span className="inline-block bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-1 rounded-full mb-3 w-fit">
                                {article.category}
                            </span>
                        )}

                        {/* Title */}
                        <h2 className="text-xl font-bold text-gray-900 mb-2 hover:text-blue-600 transition-colors">
                            {article.title}
                        </h2>

                        {/* Subtitle */}
                        {article.subtitle && (
                            <p className="text-gray-600 mb-4 line-clamp-2 flex-1">
                                {article.subtitle}
                            </p>
                        )}

                        {/* Footer */}
                        <div className="flex items-center justify-between text-sm text-gray-500 mt-auto pt-4 border-t border-gray-100">
                            {article.author && <span className="font-medium">{article.author}</span>}
                            {article.published_date && (
                                <span>
                                    {new Date(article.published_date).toLocaleDateString('en-US', {
                                        month: 'short',
                                        day: 'numeric',
                                        year: 'numeric'
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
