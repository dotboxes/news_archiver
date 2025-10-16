import { ArticlePreview } from '@/lib/database';
import ArticleCard from './ArticleCard';

interface ArticleGroupProps {
    articles: ArticlePreview[];
    selectedYear: string | null;
    selectedMonth: string | null;
    onSelect: (year: string, month?: string) => void;
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

export default function ArticleGroup({
                                         articles,
                                         selectedYear,
                                         selectedMonth,
                                         onSelect
                                     }: ArticleGroupProps) {
    const grouped = groupByYearMonth(articles);

    // Prepare filtered grouped articles
    const filteredGrouped: Record<string, Record<string, ArticlePreview[]>> = {};

    Object.entries(grouped).forEach(([year, months]) => {
        filteredGrouped[year] = {};
        Object.entries(months).forEach(([month, monthArticles]) => {
            filteredGrouped[year][month] = monthArticles.filter((article) => {
                const date = new Date(article.published_date);
                const articleYear = date.getFullYear().toString();
                const articleMonth = date.toLocaleString('default', { month: 'long' });

                if (selectedYear && articleYear !== selectedYear) return false;
                if (selectedMonth && articleMonth !== selectedMonth) return false;
                return true;
            });
        });
    });

    return (
        <div>
            {Object.entries(grouped)
                .sort((a, b) => parseInt(b[0]) - parseInt(a[0])) // sort years descending
                .map(([year, months]) => (
                    <div key={year} className="mb-12">
                        {/* Year heading */}
                        <h2
                            className={`text-2xl font-bold mb-4 cursor-pointer ${
                                selectedYear === year ? 'text-blue-600' : 'text-gray-800'
                            }`}
                            onClick={() => onSelect(year)}
                        >
                            {year}
                        </h2>

                        {/* Months */}
                        {Object.entries(months)
                            .sort(
                                (a, b) =>
                                    new Date(`${b[0]} 1, 2000`).getMonth() -
                                    new Date(`${a[0]} 1, 2000`).getMonth()
                            )
                            .map(([month]) => (
                                <div key={month} className="mb-8">
                                    <h3
                                        className={`text-xl font-semibold mb-4 cursor-pointer ${
                                            selectedMonth === month ? 'text-blue-500' : 'text-gray-700'
                                        }`}
                                        onClick={() => onSelect(year, month)}
                                    >
                                        {month}
                                    </h3>

                                    {/* Article cards for this month */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                        {filteredGrouped[year][month].map((article) => (
                                            <ArticleCard key={article.id} article={article} />
                                        ))}
                                    </div>
                                </div>
                            ))}
                    </div>
                ))}
        </div>
    );
}
