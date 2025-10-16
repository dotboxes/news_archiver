'use client';

import { useState, useEffect } from 'react';
import SearchBar from '@/components/SearchBar';
import ArticleGroup from '@/components/ArticleGroup';
import { ArticlePreview } from '@/lib/database';

export default function Home() {
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [articles, setArticles] = useState<ArticlePreview[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const [selectedYear, setSelectedYear] = useState<string | null>(null);
    const [selectedMonth, setSelectedMonth] = useState<string | null>(null);

    const fetchArticles = async (term: string = '') => {
        try {
            setLoading(true);
            const response = await fetch(`/api/search?q=${encodeURIComponent(term)}`);

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Failed to fetch articles: ${response.status} - ${errorText}`);
            }

            const data = await response.json();
            setArticles(data.articles);
            setError(null);
        } catch (err: unknown) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('Failed to load articles');
            }
        }
        finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchArticles();
    }, []);

    const handleSearch = (term: string) => {
        setSearchTerm(term);
        fetchArticles(term);

        // Reset filters on new search
        setSelectedYear(null);
        setSelectedMonth(null);
    };

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-red-600 text-lg mb-4">{error}</p>
                    <button
                        onClick={() => fetchArticles()}
                        className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">
                        Article Hub
                    </h1>
                    <p className="text-gray-600">Discover the latest articles and insights</p>
                </div>

                {/* Search Bar */}
                <SearchBar onSearch={handleSearch} searchTerm={searchTerm} />

                {/* Loading */}
                {loading && (
                    <div className="flex justify-center mb-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                    </div>
                )}

                {/* Articles */}
                {!loading && articles.length > 0 && (
                    <ArticleGroup
                        articles={articles}
                        selectedYear={selectedYear}
                        selectedMonth={selectedMonth}
                        onSelect={(year, month) => {
                            setSelectedYear(year ?? null);
                            setSelectedMonth(month ?? null);
                        }}
                    />
                )}

                {/* No results */}
                {!loading && articles.length === 0 && (
                    <div className="text-center py-12">
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No articles found</h3>
                        <p className="mt-1 text-sm text-gray-500">
                            {searchTerm ? `No results for "${searchTerm}"` : 'No articles available'}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
