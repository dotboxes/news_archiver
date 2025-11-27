import { NextResponse } from "next/server"
import { auth } from "@/app/api/auth/config"
import { isAdmin } from "@/lib/admins"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function GET() {
    const session = await auth()

    if (!session?.user || !isAdmin(session.user)) {
        return NextResponse.json(
            { error: "Forbidden - Admin access required" },
            { status: 403 }
        )
    }

    try {
        const articles = await prisma.articles.findMany({
            orderBy: { created_at: "desc" },
        })

        return NextResponse.json(articles)
    } catch (error) {
        console.error("Error fetching articles:", error)
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        )
    } finally {
        await prisma.$disconnect()
    }
}

// Add other admin API methods
export async function DELETE(request: Request) {
    const session = await auth()

    if (!session?.user || !isAdmin(session.user)) {
        return NextResponse.json(
            { error: "Forbidden - Admin access required" },
            { status: 403 }
        )
    }

    // Add your delete logic here
    return NextResponse.json({ success: true })
}
