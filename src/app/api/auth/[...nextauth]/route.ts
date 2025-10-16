// app/api/auth/[...nextauth]/route.ts
import NextAuth from 'next-auth'
import Discord from 'next-auth/providers/discord'
import { PrismaAdapter } from "@auth/prisma-adapter"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export const { handlers, auth, signIn, signOut } = NextAuth({
    adapter: PrismaAdapter(prisma),
    providers: [
        Discord({
            clientId: process.env.AUTH_DISCORD_ID!,
            clientSecret: process.env.AUTH_DISCORD_SECRET!,
        }),
    ],
    pages: {
        signIn: '/auth/signin',
    },
    session: {
        strategy: "database",
        maxAge: 30 * 24 * 60 * 60, // 30 days
    },
})

export const GET = handlers.GET
export const POST = handlers.POST