// app/api/user_settings/articles/route.ts
import { NextResponse } from "next/server";
import {prisma} from "@/lib/prisma";
import { auth } from "@/app/api/auth/config";

export async function GET() {
    try {
        const session = await auth();

        if (!session?.user?.email) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        // Return all articles - frontend will filter by author
        const articles = await prisma.articles.findMany({
            orderBy: { published_date: "desc" },
        });

        return NextResponse.json({ articles });
    } catch (err) {
        console.error(err);
        return NextResponse.json(
            { error: "Failed to fetch articles" },
            { status: 500 }
        );
    }
}