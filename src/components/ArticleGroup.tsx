import { ArticlePreview } from '@/lib/database';
import ArticleCard from './ArticleCard';
import MemberListModal from './MemberListModal';
import { useMemo, useState, useEffect, useCallback } from 'react';
import { Author } from '@/lib/parseAuthor'; // adjust the path to wherever Author is defined

export interface ArticleGroupProps {
    articles: ArticlePreview[];
    selectedYear?: string | null;
    selectedMonth?: string | null;
    onSelect?: (year: string | null, month: string | null) => void;
    sortBy?: 'date' | 'user';
    onSortChange?: (sort: 'date' | 'user') => void;
}

function groupByYearMonth(articles: ArticlePreview[]) {
    const grouped: Record<string, Record<string, ArticlePreview[]>> = {};
    articles.forEach((article) => {
        if (!article.published_date) return;
        const date = new Date(article.published_date);
        const year = date.getFullYear().toString();
        const month = date.toLocaleString('default', { month: 'long' });
        if (!grouped[year]) grouped[year] = {};
        if (!grouped[year][month]) grouped[year][month] = [];
        grouped[year][month].push(article);
    });
    return grouped;
}

function groupByUser(articles: ArticlePreview[]) {
    const grouped: Record<string, ArticlePreview[]> = {};
    articles.forEach((article) => {
        let authorName = 'Unknown Author';

        if (article.author) {
            try {
                const parsed = JSON.parse(article.author);
                if (parsed && typeof parsed === 'object' && 'name' in parsed) {
                    authorName = parsed.name;
                } else {
                    authorName = String(article.author);
                }
            } catch {
                authorName = String(article.author);
            }
        }

        if (!grouped[authorName]) grouped[authorName] = [];
        grouped[authorName].push(article);
    });
    return grouped;
}

function getPaginationRange(currentPage: number, totalPages: number): (number | '...')[] {
    const delta = 2;
    const range: number[] = [];
    const rangeWithDots: (number | '...')[] = [];

    for (
        let i = Math.max(2, currentPage - delta);
        i <= Math.min(totalPages - 1, currentPage + delta);
        i++
    ) {
        range.push(i);
    }

    rangeWithDots.push(1);

    if (range[0] > 2) {
        rangeWithDots.push('...');
    }

    rangeWithDots.push(...range);

    if (range[range.length - 1] < totalPages - 1) {
        rangeWithDots.push('...');
    }

    if (totalPages > 1) {
        rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
}


export default function ArticleGroup({
                                         articles,
                                         selectedYear: propYear,
                                         selectedMonth: propMonth,
                                         onSelect,
                                         sortBy = 'date',
                                         onSortChange
                                     }: ArticleGroupProps) {
    const groupedByDate = useMemo(() => groupByYearMonth(articles), [articles]);
    const groupedByUser = useMemo(() => groupByUser(articles), [articles]);

    const isGroupingByDate = sortBy === 'date';
    const sortedYears = useMemo(() => Object.keys(groupedByDate).sort((a, b) => parseInt(b) - parseInt(a)), [groupedByDate]);

    const sortedUsersByCount = useMemo(() => {
        return Object.entries(groupedByUser)
            .sort((a, b) => b[1].length - a[1].length)
            .map(([user]) => user);
    }, [groupedByUser]);

    const uniqueAuthors = useMemo(() => Object.keys(groupedByUser).sort(), [groupedByUser]);

    const getMonthsForYear = useCallback((year: string) => {
        const monthOrder = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];
        return Object.keys(groupedByDate[year] || {})
            .sort((a, b) => monthOrder.indexOf(b) - monthOrder.indexOf(a));
    }, [groupedByDate]);

    const latestYear = sortedYears[0];
    const latestMonth = latestYear ? getMonthsForYear(latestYear)[0] : null;
    const firstUser = sortedUsersByCount[0];

    const [selectedYear, setSelectedYear] = useState<string>(propYear || latestYear || '');
    const [selectedMonth, setSelectedMonth] = useState<string>(propMonth || latestMonth || '');
    const [selectedUser, setSelectedUser] = useState<string>(firstUser || '');
    const [currentPage, setCurrentPage] = useState<number>(() => {
        const cached = sessionStorage.getItem('articleGroup_currentPage');
        return cached ? parseInt(cached, 10) : 1;
    });

    const ITEMS_PER_PAGE = 9;

    useEffect(() => {
        sessionStorage.setItem('articleGroup_currentPage', String(currentPage));
    }, [currentPage]);

    useEffect(() => {
        if (isGroupingByDate) {
            if (sortedYears.length > 0 && !selectedYear) {
                setSelectedYear(sortedYears[0]);
                const months = getMonthsForYear(sortedYears[0]);
                setSelectedMonth(months[0] || '');
            }
        } else {
            if (sortedUsersByCount.length > 0 && !selectedUser) {
                setSelectedUser(sortedUsersByCount[0]);
            }
        }
    }, [isGroupingByDate, sortedYears, sortedUsersByCount, selectedYear, selectedUser, getMonthsForYear]);

    const monthsForSelectedYear = selectedYear ? getMonthsForYear(selectedYear) : [];

    const allArticlesForDisplay = isGroupingByDate
        ? (selectedYear && selectedMonth ? groupedByDate[selectedYear]?.[selectedMonth] || [] : [])
        : (selectedUser ? groupedByUser[selectedUser] || [] : []);

    const totalPages = Math.ceil(allArticlesForDisplay.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const articlesForDisplay = allArticlesForDisplay.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    if ((isGroupingByDate && sortedYears.length === 0) || (!isGroupingByDate && sortedUsersByCount.length === 0)) {
        return <div className="text-center py-12 text-gray-500">No articles available</div>;
    }

    const handleSelectYear = (year: string) => {
        setSelectedYear(year);
        const months = getMonthsForYear(year);
        setSelectedMonth(months[0] || '');
        setCurrentPage(1);
        onSelect?.(year, months[0]);
    };

    const handleSelectMonth = (month: string) => {
        setSelectedMonth(month);
        setCurrentPage(1);
        onSelect?.(selectedYear, month);
    };

    const handleSelectUser = (user: string) => {
        setSelectedUser(user);
        setCurrentPage(1);
    };

    const handleSortChange = (newSort: 'date' | 'user') => {
        onSortChange?.(newSort);
        setCurrentPage(1);
    };

    const handleSelectMember = (member: string | Author) => {
        const name = typeof member === 'string' ? member : member.name;
        setSelectedUser(name);
        setCurrentPage(1);
        handleSortChange('user');
    };


    return (
        <div className="space-y-8">
            {/* Header controls */}
            <div className="flex justify-between items-center ">
                <MemberListModal members={uniqueAuthors} onSelectMember={handleSelectMember} />
                <div className="flex items-center gap-3 whitespace-nowrap ">
                    <label htmlFor="sortSelect" className="text-sm font-medium text-primary">Sort by:</label>
                    <select
                        id="sortSelect"
                        value={sortBy}
                        onChange={(e) => handleSortChange(e.target.value as 'date' | 'user')}
                        className="px-3 py-2 border border-gray-300 rounded-lg btn-tertiary text-sm font-medium hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="date">Date</option>
                        <option value="user">User</option>
                    </select>
                </div>
            </div>

            {/* Filter Buttons */}
            {isGroupingByDate ? (
                <>
                    {/* Year buttons */}
                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                        {sortedYears.map((year) => (
                            <button
                                key={year}
                                onClick={() => handleSelectYear(year)}
                                className={`px-4 py-2 rounded-lg font-semibold whitespace-nowrap transition-all duration-200 ${
                                    selectedYear === year
                                        ? 'bg-blue-600 text-white shadow-md'
                                        : 'bg-secondary hover:bg-gray-400'
                                }`}
                            >
                                {year}
                            </button>
                        ))}
                    </div>

                    {/* Month buttons */}
                    {monthsForSelectedYear.length > 0 && (
                        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                            {monthsForSelectedYear.map((month) => (
                                <button
                                    key={month}
                                    onClick={() => handleSelectMonth(month)}
                                    className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all duration-200 ${
                                        selectedMonth === month
                                            ? 'bg-blue-600 text-white shadow-md'
                                            : 'bg-secondary hover:bg-gray-400'
                                    }`}
                                >
                                    {month}
                                </button>
                            ))}
                        </div>
                    )}
                </>
            ) : (
                <>
                    {/* User buttons with gradient and hidden scrollbar */}
                    <div className="relative overflow-x-auto scrollbar-hide pb-2">
                        <div className="flex gap-2 relative">
                            {sortedUsersByCount.slice(0, 5).map((user) => (
                                <button
                                    key={user}
                                    onClick={() => handleSelectUser(user)}
                                    className={`px-4 py-2 rounded-lg font-semibold whitespace-nowrap transition-all duration-200 ${
                                        selectedUser === user
                                            ? 'bg-blue-600 text-white shadow-md'
                                            : 'bg-secondary hover:bg-gray-400'
                                    }`}
                                >
                                    {user}
                                </button>
                            ))}
                            {sortedUsersByCount.length > 5 && (
                                <button
                                    onClick={() => document.getElementById('memberListModalButton')?.click()}
                                    className="px-4 py-2 rounded-lg bg-secondary hover:bg-gray-400 font-semibold transition-all whitespace-nowrap"
                                >
                                    +{sortedUsersByCount.length - 5} more
                                </button>
                            )}
                        </div>
                    </div>
                </>
            )}

            {/* Articles */}
            {articlesForDisplay.length > 0 ? (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {articlesForDisplay.map((article) => (
                            <ArticleCard key={article.id} article={article} />
                        ))}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex justify-center items-center gap-2 mt-8">
                            <button
                                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                                disabled={currentPage === 1}
                                className="px-4 py-2 rounded-lg border border-gray-300 text-primary font-medium hover:bg-gray-400 disabled:opacity-50"
                            >
                                Previous
                            </button>

                            <div className="flex gap-1 items-center">
                                {getPaginationRange(currentPage, totalPages).map((page, index) =>
                                    page === '...' ? (
                                        <span
                                            key={`dots-${index}`}
                                            className="px-2 py-2 text-primary select-none"
                                        >
                                            &hellip;
                                        </span>
                                    ) : (
                                        <button
                                            key={page}
                                            onClick={() => setCurrentPage(page)}
                                            className={`px-3 py-2 rounded-lg font-medium transition-all ${
                                                currentPage === page
                                                    ? 'bg-blue-600 text-white shadow-md'
                                                    : 'border border-gray-300 text-primary hover:bg-gray-400'
                                            }`}
                                        >
                                            {page}
                                        </button>
                                    )
                                )}
                            </div>

                            <button
                                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                                disabled={currentPage === totalPages}
                                className="px-4 py-2 rounded-lg border border-gray-300 text-primary font-medium hover:bg-gray-400 disabled:opacity-50"
                            >
                                Next
                            </button>
                        </div>
                    )}
                </>
            ) : (
                <div className="text-center py-12 text-primary">
                    {isGroupingByDate
                        ? `No articles found for ${selectedMonth} ${selectedYear}`
                        : `No articles found for ${selectedUser}`}
                </div>
            )}
        </div>
    );
}