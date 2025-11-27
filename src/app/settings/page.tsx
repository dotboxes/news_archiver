import { auth } from "@/app/api/auth/config";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ArticlesManager from "@/components/ArticlesManager";
import { parseAuthorField } from "@/lib/parseAuthor";
import {FileText} from "lucide-react";

export default async function SettingsPage() {
    const session = await auth();

    if (!session?.user) {
        redirect("/?error=unauthorized");
    }

    const userId = session.user.id;
    const userName = session.user.name ?? null;

    // ✅ Fetch all published articles
    const allArticles = await prisma.articles.findMany({
        where: { published_date: { not: null } },
        select: {
            id: true,
            title: true,
            slug: true,
            published_date: true,
            author: true,
            content: true,
            subtitle: true,
            image_url: true,
            category: true,
        },
        orderBy: { published_date: "desc" },
    });


    // ✅ Filter by current user's ID or name
    const userArticles = allArticles.filter((article) => {
        if (!article.author) return false; // ✅ Add this line
        const parsed = parseAuthorField(article.author);
        return (
            parsed?.discord_id === userId ||
            parsed?.name === userName ||
            article.author === userId ||
            article.author === userName
        );
    });

    return (
        <main className="min-h-screen bg-primary p-8">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-4xl font-bold text-primary mb-8">
                    My Articles
                </h1>

                {userArticles.length === 0 ? (
                    <div className="text-center py-12 bg-secondary rounded-xl">
                        <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-secondary mb-4">
                            You haven&apos;t published any articles yet.
                        </p>
                    </div>
                ) : (
                    <ArticlesManager allArticles={userArticles} />
                )}
            </div>
        </main>
    );
}
