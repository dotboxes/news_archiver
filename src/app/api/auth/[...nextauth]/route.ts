// app/api/auth/[...nextauth]/route.ts
import NextAuth from 'next-auth'
import Discord from 'next-auth/providers/discord'
import { PrismaAdapter } from "@auth/prisma-adapter"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

const { handlers, auth } = NextAuth({
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
        maxAge: 30 * 24 * 60 * 60,
    },
})

export const GET = handlers.GET
export const POST = handlers.POST
export { auth }