import { Suspense } from 'react';
import { auth } from "@/app/api/auth/config";
import { isAdmin } from "@/lib/admins";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import AdminDashboardClient from '@/components/AdminDashboard';

interface UserSummary {
    id: string;
    name: string | null;
    email: string | null;
    image: string | null;
    role?: string;
}

interface ArticleSummary {
    id: number;
    title: string;
    slug: string;
    published_date: Date | null;
    author?: string | null;
    preview_text?: string | null;
}

export const metadata = {
    title: 'Admin Dashboard',
}

// Loading skeleton
function DashboardLoading() {
    return (
        <main className="min-h-screen bg-primary p-8">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8 flex flex-col items-center text-center">
                    <div className="h-10 w-64 bg-gray-300 rounded animate-pulse mb-2"></div>
                    <div className="h-4 w-48 bg-gray-200 rounded animate-pulse"></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="bg-secondary rounded-xl shadow-md p-6 animate-pulse">
                            <div className="h-4 bg-gray-300 rounded w-24 mb-2"></div>
                            <div className="h-8 bg-gray-300 rounded w-16"></div>
                        </div>
                    ))}
                </div>
            </div>
        </main>
    );
}

async function DashboardContent({ currentUser }: { currentUser: UserSummary }) {
    const [users, articles] = await Promise.all([
        prisma.user.findMany({
            select: {
                id: true,
                name: true,
                email: true,
                image: true,
            },
            orderBy: { name: 'asc' }
        }),
        prisma.articles.findMany({
            select: {
                id: true,
                title: true,
                slug: true,
                content: true,
                published_date: true,
                author: true,
            },
            orderBy: { published_date: 'desc' }
        })
    ]);

    return (
        <AdminDashboardClient
            currentUser={currentUser}
            allUsers={users}
            allArticles={articles}
        />
    );
}

export default async function AdminPage() {
    const session = await auth();

    if (!session?.user || !isAdmin(session.user)) {
        redirect("/?error=unauthorized");
    }

    const currentUser = {
        id: session.user.id!,
        name: session.user.name ?? null,
        email: session.user.email ?? null,
        image: session.user.image ?? null,
    };

    return (
        <Suspense fallback={<DashboardLoading />}>
            <DashboardContent currentUser={currentUser} />
        </Suspense>
    );
}