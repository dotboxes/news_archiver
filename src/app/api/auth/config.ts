import NextAuth from "next-auth";
import DiscordProvider from "next-auth/providers/discord";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";

export const { handlers, auth, signIn, signOut } = NextAuth({
    adapter: PrismaAdapter(prisma),
    providers: [
        DiscordProvider({
            clientId: process.env.DISCORD_CLIENT_ID!,
            clientSecret: process.env.DISCORD_CLIENT_SECRET!,
        }),
    ],
    session: {
        strategy: "jwt",
        maxAge: 30 * 24 * 60 * 60,
    },
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.email = user.email;
                token.name = user.name;
                token.picture = user.image;
                token.lastRefreshed = Date.now();
            }

            const shouldRefresh = !token.lastRefreshed ||
                Date.now() - (token.lastRefreshed as number) > 24 * 60 * 60 * 1000;

            if (shouldRefresh && token.id) {
                try {
                    // Pull the access token straight from your Account table
                    const account = await prisma.account.findFirst({
                        where: { userId: token.id as string, provider: "discord" },
                        select: { access_token: true, refresh_token: true, expires_at: true },
                    });

                    if (account?.access_token) {
                        // Refresh if expired
                        let accessToken = account.access_token;
                        if (account.expires_at && Date.now() / 1000 > account.expires_at - 60) {
                            const res = await fetch("https://discord.com/api/oauth2/token", {
                                method: "POST",
                                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                                body: new URLSearchParams({
                                    client_id: process.env.DISCORD_CLIENT_ID!,
                                    client_secret: process.env.DISCORD_CLIENT_SECRET!,
                                    grant_type: "refresh_token",
                                    refresh_token: account.refresh_token!,
                                }),
                            });

                            if (res.ok) {
                                const refreshed = await res.json();
                                accessToken = refreshed.access_token;

                                // Update the Account table with new tokens
                                await prisma.account.update({
                                    where: {
                                        provider_providerAccountId: {
                                            provider: "discord",
                                            providerAccountId: (await prisma.account.findFirst({
                                                where: { userId: token.id as string, provider: "discord" },
                                                select: { providerAccountId: true },
                                            }))!.providerAccountId,
                                        },
                                    },
                                    data: {
                                        access_token: refreshed.access_token,
                                        refresh_token: refreshed.refresh_token ?? account.refresh_token,
                                        expires_at: Math.floor(Date.now() / 1000) + refreshed.expires_in,
                                    },
                                });
                            }
                        }

                        const discordRes = await fetch("https://discord.com/api/users/@me", {
                            headers: { Authorization: `Bearer ${accessToken}` },
                        });

                        if (discordRes.ok) {
                            const discordUser = await discordRes.json();
                            const avatarUrl = discordUser.avatar
                                ? `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.png`
                                : null;

                            await prisma.user.update({
                                where: { id: token.id as string },
                                data: {
                                    image: avatarUrl,
                                    name: discordUser.global_name ?? discordUser.username,
                                },
                            });

                            token.picture = avatarUrl;
                            token.name = discordUser.global_name ?? discordUser.username;
                        }
                    }
                } catch (err) {
                    console.error("Failed to refresh Discord profile:", err);
                }

                token.lastRefreshed = Date.now();
            }

            return token;
        },
        async session({ session, token }) {
            if (token && session.user) {
                session.user.id = token.id as string;
                session.user.email = token.email as string;
                session.user.name = token.name as string;
                session.user.image = token.picture as string;
            }
            return session;
        },
    },
    pages: {
        signIn: '/auth/signin',
        error: '/auth/error',
    },
});