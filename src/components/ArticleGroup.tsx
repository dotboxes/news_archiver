import { ArticlePreview } from '@/lib/database';
import ArticleCard from './ArticleCard';
import { useMemo, useState, useEffect } from 'react';

interface ArticleGroupProps {
    articles: ArticlePreview[];
}

// Helper: group articles by year -> month
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

export default function ArticleGroup({ articles }: ArticleGroupProps) {
    const grouped = useMemo(() => groupByYearMonth(articles), [articles]);

    // Get sorted years and months
    const sortedYears = useMemo(() =>
            Object.keys(grouped).sort((a, b) => parseInt(b) - parseInt(a)),
        [grouped]
    );

    const getMonthsForYear = (year: string) => {
        const monthOrder = ['January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'];
        return Object.keys(grouped[year])
            .sort((a, b) => monthOrder.indexOf(b) - monthOrder.indexOf(a));
    };

    // Default to latest year and latest month
    const latestYear = sortedYears[0];
    const latestMonth = latestYear ? getMonthsForYear(latestYear)[0] : null;

    const [selectedYear, setSelectedYear] = useState<string>(latestYear || '');
    const [selectedMonth, setSelectedMonth] = useState<string>(latestMonth || '');

    // Update when articles change (new month/year added)
    useEffect(() => {
        if (sortedYears.length > 0 && !selectedYear) {
            setSelectedYear(sortedYears[0]);
            const months = getMonthsForYear(sortedYears[0]);
            setSelectedMonth(months[0] || '');
        }
    }, [sortedYears, selectedYear]);

    const monthsForSelectedYear = selectedYear ? getMonthsForYear(selectedYear) : [];
    const articlesForDisplay = selectedYear && selectedMonth
        ? grouped[selectedYear][selectedMonth]
        : [];

    if (sortedYears.length === 0) {
        return <div className="text-center py-12 text-gray-500">No articles available</div>;
    }

    return (
        <div className="space-y-8">
            {/* Years Selector - Horizontal */}
            <div className="flex gap-2 overflow-x-auto pb-2">
                {sortedYears.map((year) => (
                    <button
                        key={year}
                        onClick={() => {
                            setSelectedYear(year);
                            const months = getMonthsForYear(year);
                            setSelectedMonth(months[0] || '');
                        }}
                        className={`px-4 py-2 rounded-lg font-semibold whitespace-nowrap transition-all duration-200 ${
                            selectedYear === year
                                ? 'bg-blue-600 text-white shadow-md'
                                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                        }`}
                    >
                        {year}
                    </button>
                ))}
            </div>

            {/* Months Selector - Horizontal */}
            {monthsForSelectedYear.length > 0 && (
                <div className="flex gap-2 overflow-x-auto pb-2">
                    {monthsForSelectedYear.map((month) => (
                        <button
                            key={month}
                            onClick={() => setSelectedMonth(month)}
                            className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all duration-200 ${
                                selectedMonth === month
                                    ? 'bg-blue-500 text-white shadow-md'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            {month}
                        </button>
                    ))}
                </div>
            )}

            {/* Articles Grid */}
            {articlesForDisplay.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {articlesForDisplay.map((article) => (
                        <ArticleCard key={article.id} article={article} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-12 text-gray-500">
                    No articles found for {selectedMonth} {selectedYear}
                </div>
            )}
        </div>
    );
}