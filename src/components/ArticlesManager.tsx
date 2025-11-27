"use client";

import { useState, useMemo, useEffect } from "react";
import {
    Search,
    FileText,
    Trash2,
    ExternalLink,
    Edit,
    ChevronDown,
    ChevronUp,
} from "lucide-react";
import ConfirmModal from "@/components/ConfirmModal";
import AlertToast from "@/components/AlertToast";
import EditArticleModal from '@/components/EditArticleModal';
import updateArticle, { deleteArticle, bulkDeleteArticles } from "@/app/settings/actions";
import { parseAuthorField, Author } from "@/lib/parseAuthor";

interface Article {
    id: number;
    title: string;
    slug: string;
    published_date: Date | string | null;
    author?: string | null;
    subtitle?: string | null;
    content: string;
    image_url?: string | null;
    category?: string | null;
}

interface ArticlesManagerProps {
    allArticles: Article[];
    showAuthorColumn?: boolean;
    title?: string;
    emptyMessage?: string;
}

type SortField = "title" | "published_date" | "author";
type SortOrder = "asc" | "desc";

const authorCache = new Map<string, Author | null>();

export default function ArticlesManager({
                                            allArticles,
                                            showAuthorColumn = false,
                                            title = "My Articles",
                                            emptyMessage = "No articles found."
                                        }: ArticlesManagerProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [sortField, setSortField] = useState<SortField>("published_date");
    const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(20);
    const [editingArticle, setEditingArticle] = useState<Article | null>(null);
    const [isLoadingArticle, setIsLoadingArticle] = useState(false);
    const [selectedArticles, setSelectedArticles] = useState<Set<number>>(new Set());
    const [articleAuthors, setArticleAuthors] = useState<Record<string, Author | null>>({});

    const [confirmModal, setConfirmModal] = useState({
        isOpen: false,
        title: "",
        message: "",
        type: "danger" as "danger" | "warning",
        onConfirm: () => {},
    });

    const [alertToast, setAlertToast] = useState({
        isOpen: false,
        title: "",
        message: "",
        type: "success" as "success" | "error",
    });

    // Fetch and parse authors when showAuthorColumn is enabled
    useEffect(() => {
        if (!showAuthorColumn) return;

        const fetchAuthors = async () => {
            const newAuthors: Record<string, Author | null> = { ...articleAuthors };

            for (const art of allArticles) {
                if (!art.slug) continue;
                if (authorCache.has(art.slug)) {
                    newAuthors[art.slug] = authorCache.get(art.slug)!;
                    continue;
                }

                try {
                    const res = await fetch(`/api/article/${art.slug}`);
                    if (!res.ok) throw new Error('Failed to fetch');

                    const data = await res.json();
                    const parsed = parseAuthorField(data.article.author, data.article.userImage);
                    authorCache.set(art.slug, parsed);
                    newAuthors[art.slug] = parsed;
                } catch {
                    const fallback = parseAuthorField(art.author ?? '', null);
                    authorCache.set(art.slug, fallback);
                    newAuthors[art.slug] = fallback;
                }
            }

            setArticleAuthors(newAuthors);
        };

        fetchAuthors();
    }, [allArticles, showAuthorColumn]);

    // 🔍 Filtering + sorting
    const filteredAndSortedArticles = useMemo(() => {
        const filtered = allArticles.filter((article) => {
            const titleMatch = article.title.toLowerCase().includes(searchQuery.toLowerCase());
            const slugMatch = article.slug.toLowerCase().includes(searchQuery.toLowerCase());

            if (!showAuthorColumn) {
                return titleMatch || slugMatch;
            }

            // When showing author column, also search by author name
            const authorName = articleAuthors[article.slug]?.name || '';
            const authorMatch = authorName.toLowerCase().includes(searchQuery.toLowerCase());

            return titleMatch || slugMatch || authorMatch;
        });

        filtered.sort((a, b) => {
            let comparison = 0;
            if (sortField === "title") {
                comparison = a.title.localeCompare(b.title);
            } else if (sortField === "published_date") {
                const dateA = a.published_date ? new Date(a.published_date).getTime() : 0;
                const dateB = b.published_date ? new Date(b.published_date).getTime() : 0;
                comparison = dateA - dateB;
            } else if (sortField === "author") {
                const authorA = articleAuthors[a.slug]?.name || '';
                const authorB = articleAuthors[b.slug]?.name || '';
                comparison = authorA.localeCompare(authorB);
            }
            return sortOrder === "asc" ? comparison : -comparison;
        });

        return filtered;
    }, [allArticles, searchQuery, sortField, sortOrder, showAuthorColumn, articleAuthors]);

    const totalPages = Math.ceil(filteredAndSortedArticles.length / itemsPerPage);
    const paginatedArticles = filteredAndSortedArticles.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    // 🗑️ Bulk delete handler
    const handleBulkDelete = async () => {
        if (selectedArticles.size === 0) return;

        setConfirmModal({
            isOpen: true,
            title: "Delete Articles",
            message: `Are you sure you want to delete ${selectedArticles.size} article(s)?`,
            type: "danger",
            onConfirm: async () => {
                try {
                    const data = await bulkDeleteArticles(Array.from(selectedArticles));
                    setSelectedArticles(new Set());
                    setAlertToast({
                        isOpen: true,
                        title: "Success",
                        message: `Deleted ${data.deletedCount} article(s) successfully.`,
                        type: "success",
                    });
                } catch {
                    setAlertToast({
                        isOpen: true,
                        title: "Error",
                        message: "Failed to delete articles.",
                        type: "error",
                    });
                }
            },
        });
    };

    // 🗑️ Single delete
    const handleSingleDelete = async (articleId: number, articleTitle: string) => {
        setConfirmModal({
            isOpen: true,
            title: "Delete Article",
            message: `Are you sure you want to delete "${articleTitle}"?`,
            type: "danger",
            onConfirm: async () => {
                try {
                    await deleteArticle(articleId);
                    setAlertToast({
                        isOpen: true,
                        title: "Success",
                        message: "Article deleted successfully.",
                        type: "success",
                    });
                } catch {
                    setAlertToast({
                        isOpen: true,
                        title: "Error",
                        message: "Failed to delete article.",
                        type: "error",
                    });
                }
            },
        });
    };

    const handleEditArticle = async (article: Article) => {
        setIsLoadingArticle(true);
        setEditingArticle(article);

        try {
            const res = await fetch(`/api/article/${article.slug}`);
            if (!res.ok) throw new Error('Failed to fetch');
            const data = await res.json();

            setEditingArticle({
                ...article,
                ...data.article,
            });
        } catch (error) {
            console.error("Failed:", error);
        } finally {
            setIsLoadingArticle(false);
        }
    };

    const formatDate = (date: Date | string | null) => {
        if (!date) return "—";
        const d = new Date(date);
        if (isNaN(d.getTime())) return "—";
        return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
    };

    const SortIcon = ({ field }: { field: SortField }) => {
        if (sortField !== field) return <ChevronDown className="w-3 h-3 text-gray-400" />;
        return sortOrder === "asc"
            ? <ChevronUp className="w-3 h-3 text-blue-600" />
            : <ChevronDown className="w-3 h-3 text-blue-600" />;
    };

    const handleSort = (field: SortField) => {
        if (sortField === field) {
            setSortOrder(sortOrder === "asc" ? "desc" : "asc");
        } else {
            setSortField(field);
            setSortOrder("asc");
        }
        setCurrentPage(1);
    };

    // Calculate column spans based on whether author column is shown
    const checkboxSpan = 1;
    const titleSpan = showAuthorColumn ? 5 : 6;
    const authorSpan = 2;
    const dateSpan = showAuthorColumn ? 2 : 3;
    const actionsSpan = 2;

    return (
        <div className="bg-secondary rounded-xl shadow-md border border-border">
            <div className="p-6">
                {/* Header + Search */}
                <div className="mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <FileText className="w-5 h-5 text-green-600" />
                            <h2 className="text-lg font-semibold text-primary">{title}</h2>
                            <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded">
                                {filteredAndSortedArticles.length} of {allArticles.length}
                            </span>
                        </div>

                        {selectedArticles.size > 0 && (
                            <button
                                onClick={handleBulkDelete}
                                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                            >
                                <Trash2 className="w-4 h-4" />
                                Delete ({selectedArticles.size})
                            </button>
                        )}
                    </div>

                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder={showAuthorColumn ? "Search by title, slug, or author..." : "Search articles..."}
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                </div>

                {filteredAndSortedArticles.length === 0 ? (
                    <div className="text-center py-12">
                        <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-secondary">
                            {searchQuery ? 'No articles match your search' : emptyMessage}
                        </p>
                    </div>
                ) : (
                    <>
                        {/* Table */}
                        <div className="border border-gray-200 rounded-lg overflow-hidden">
                            {/* Header */}
                            <div className="bg-tertiary border-b border-gray-200 px-4 py-3">
                                <div
                                    className={`grid gap-4 text-xs items-start font-medium text-primary ${
                                        showAuthorColumn
                                            ? "grid-cols-[auto_minmax(50px,2fr)_170px_300px_auto]" // checkbox, title, author, date, actions
                                            : "grid-cols-[auto_minmax(50px,2fr)_110px_100px]"     // checkbox, title, date, actions
                                    } items-center`}
                                >
                                    <div className="flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={
                                                selectedArticles.size === paginatedArticles.length &&
                                                paginatedArticles.length > 0
                                            }
                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    setSelectedArticles(new Set(paginatedArticles.map(a => a.id)));
                                                } else {
                                                    setSelectedArticles(new Set());
                                                }
                                            }}
                                        />
                                    </div>

                                    <button
                                        onClick={() => handleSort("title")}
                                        className="flex items-center gap-1 hover:text-primary"
                                    >
                                        Title <SortIcon field="title" />
                                    </button>

                                    {showAuthorColumn && (
                                        <button
                                            onClick={() => handleSort("author")}
                                            className="flex items-center gap-1 hover:text-primary"
                                        >
                                            Author <SortIcon field="author" />
                                        </button>
                                    )}

                                    <button
                                        onClick={() => handleSort("published_date")}
                                        className="flex items-center gap-1 hover:text-primary"
                                    >
                                        Published <SortIcon field="published_date" />
                                    </button>

                                    <div className="text-right">Actions</div>
                                </div>
                            </div>

                            {/* Body */}
                            <div className="divide-y divide-gray-200">
                                {paginatedArticles.map((article) => (
                                    <div
                                        key={article.id}
                                        className="px-4 py-3 hover:bg-gray-500 transition-colors"
                                    >
                                        <div
                                            className={`grid gap-4 items-center ${
                                                showAuthorColumn
                                                    ? "grid-cols-[auto_minmax(50px,2fr)_170px_240px_auto]"
                                                    : "grid-cols-[auto_1fr_110px_auto]"
                                            }`}
                                        >
                                            {/* Checkbox */}
                                            <div className="flex items-center">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedArticles.has(article.id)}
                                                    onChange={(e) => {
                                                        const newSet = new Set(selectedArticles);
                                                        if (e.target.checked) newSet.add(article.id);
                                                        else newSet.delete(article.id);
                                                        setSelectedArticles(newSet);
                                                    }}
                                                />
                                            </div>

                                            {/* Title */}
                                            <div className="flex flex-col pr-6">
                                                <h3 className="font-medium text-primary text-sm mb-1">{article.title}</h3>
                                                <p className="text-xs text-tertiary font-mono">{article.slug}</p>
                                            </div>

                                            {/* Author */}
                                            {showAuthorColumn && (
                                                <div>
                                                    <p className="text-sm text-secondary">
                                                        {articleAuthors[article.slug]?.name || '—'}
                                                    </p>
                                                </div>
                                            )}

                                            {/* Published Date */}
                                            <div>
                                                <p className="text-sm text-secondary">{formatDate(article.published_date)}</p>
                                            </div>

                                            {/* Actions */}
                                            <div className="flex items-center justify-end gap-2">
                                                <a
                                                    href={`/article/${article.slug}`}
                                                    target="_blank"
                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                                                >
                                                    <ExternalLink className="w-4 h-4" />
                                                </a>
                                                <button
                                                    onClick={() => handleEditArticle(article)}
                                                    className="p-2 text-gray-600 hover:bg-gray-100 rounded"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleSingleDelete(article.id, article.title)}
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>


                        {/* Pagination Controls */}
                        <div className="mt-6 flex flex-col md:flex-row items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <label className="text-sm text-primary flex items-center">
                                    Items per page:
                                    <select
                                        value={itemsPerPage}
                                        onChange={(e) => {
                                            const newVal = Number(e.target.value);
                                            setItemsPerPage(newVal);
                                            setCurrentPage(1);
                                        }}
                                        className="ml-2 border border-gray-300 rounded px-2 py-1 text-sm"
                                    >
                                        <option value={10}>10</option>
                                        <option value={20}>20</option>
                                        <option value={50}>50</option>
                                        <option value={100}>100</option>
                                    </select>
                                </label>

                                <p className="text-sm text-primary">
                                    {filteredAndSortedArticles.length === 0
                                        ? "No results"
                                        : `Showing ${(currentPage - 1) * itemsPerPage + 1}–${Math.min(
                                            currentPage * itemsPerPage,
                                            filteredAndSortedArticles.length
                                        )} of ${filteredAndSortedArticles.length}`}
                                </p>
                            </div>

                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setCurrentPage(1)}
                                    disabled={currentPage === 1}
                                    className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    First
                                </button>
                                <button
                                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Previous
                                </button>

                                <div className="flex items-center gap-1">
                                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                        let pageNum;
                                        if (totalPages <= 5) pageNum = i + 1;
                                        else if (currentPage <= 3) pageNum = i + 1;
                                        else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
                                        else pageNum = currentPage - 2 + i;

                                        return (
                                            <button
                                                key={pageNum}
                                                onClick={() => setCurrentPage(pageNum)}
                                                className={`px-3 py-1 text-sm border rounded ${
                                                    currentPage === pageNum
                                                        ? "bg-blue-600 text-white border-blue-600"
                                                        : "border-gray-300 hover:bg-gray-500"
                                                }`}
                                            >
                                                {pageNum}
                                            </button>
                                        );
                                    })}
                                </div>

                                <button
                                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages || totalPages === 0}
                                    className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Next
                                </button>
                                <button
                                    onClick={() => setCurrentPage(totalPages)}
                                    disabled={currentPage === totalPages || totalPages === 0}
                                    className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Last
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Modals & Toasts */}
            <ConfirmModal
                {...confirmModal}
                onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
            />
            <AlertToast
                {...alertToast}
                onClose={() => setAlertToast({ ...alertToast, isOpen: false })}
            />
            {editingArticle && !isLoadingArticle && (
                <EditArticleModal
                    article={editingArticle}
                    isOpen={!!editingArticle}
                    isLoading={isLoadingArticle}
                    onClose={() => setEditingArticle(null)}
                    onSave={async (updated) => {
                        try {
                            const cleanUpdated = Object.fromEntries(
                                Object.entries(updated).map(([key, value]) => [key, value === null ? undefined : value])
                            );

                            await updateArticle(editingArticle.id, cleanUpdated);
                            setEditingArticle(null);
                            setAlertToast({
                                isOpen: true,
                                title: 'Success',
                                message: 'Article updated successfully.',
                                type: 'success',
                            });
                        } catch {
                            setAlertToast({
                                isOpen: true,
                                title: 'Error',
                                message: 'Failed to update article.',
                                type: 'error',
                            });
                        }
                    }}
                />
            )}
        </div>
    );
}

