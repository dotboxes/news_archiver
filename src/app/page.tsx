// app/page.tsx (updated with consistent theming)
'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import SearchBar from '@/components/SearchBar';
import ArticleGroup from '@/components/ArticleGroup';
import AuthModal from '@/components/AuthModal';
import UnauthorizedModal from '@/components/UnauthorizedModal';
import { ArticlePreview } from '@/lib/database';
import {FileText} from "lucide-react";

type SortBy = 'date' | 'user';

export default function Home() {
    const searchParams = useSearchParams();
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [articles, setArticles] = useState<ArticlePreview[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [isUnauthorizedModalOpen, setIsUnauthorizedModalOpen] = useState(false);
    const [selectedYear, setSelectedYear] = useState<string | null>(null);
    const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
    const [sortBy, setSortBy] = useState<SortBy>('date');

    // Check for auth or unauthorized redirects
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const authParam = params.get('auth');
        const errorParam = params.get('error');

        console.log("URL params:", { auth: authParam, error: errorParam });

        if (authParam === 'true') {
            console.log("Opening auth modal");
            setIsAuthModalOpen(true);
        }

        if (errorParam === 'unauthorized') {
            console.log("Opening unauthorized modal");
            setIsUnauthorizedModalOpen(true);
        }
    }, []);

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
        } finally {
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

    const handleAuthModalClose = () => {
        setIsAuthModalOpen(false);
        // Remove the query parameter
        const url = new URL(window.location.href);
        url.searchParams.delete('auth');
        window.history.replaceState({}, '', url.pathname);
    };

    const handleUnauthorizedModalClose = () => {
        setIsUnauthorizedModalOpen(false);
        // Remove the query parameter
        const url = new URL(window.location.href);
        url.searchParams.delete('error');
        window.history.replaceState({}, '', url.pathname);
    };

    if (error) {
        return (
            <div className="min-h-screen bg-primary flex items-center justify-center">
                <div className="text-center">
                    <p className="text-red-600 text-lg mb-4">{error}</p>
                    <button
                        onClick={() => fetchArticles()}
                        className="btn-primary"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-primary py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-primary mb-2">
                        Article Hub
                    </h1>
                    <p className="text-secondary">Discover the latest articles and insights</p>
                </div>

                {/* Search Bar */}
                <SearchBar onSearch={handleSearch} searchTerm={searchTerm} />

                {/* Loading */}
                {loading && (
                    <div className="flex justify-center mb-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[rgb(var(--primary))]"></div>
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
                        sortBy={sortBy}
                        onSortChange={setSortBy}
                    />
                )}

                {/* No results */}
                {!loading && articles.length === 0 && (
                    <div className="text-center py-12">
                        <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <h3 className="mt-2 text-sm font-medium text-primary">No articles found</h3>
                        <p className="mt-1 text-sm text-secondary">
                            {searchTerm ? `No results for "${searchTerm}"` : ''}
                        </p>
                    </div>
                )}
            </div>

            {/* Modals */}
            <AuthModal isOpen={isAuthModalOpen} onClose={handleAuthModalClose} />
            <UnauthorizedModal isOpen={isUnauthorizedModalOpen} onClose={handleUnauthorizedModalClose} />
        </div>
    );
}