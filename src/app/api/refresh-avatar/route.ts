import { auth } from "@/app/api/auth/config"
import { prisma } from "@/lib/prisma";

async function getValidAccessToken(account: {
    access_token: string;
    refresh_token: string | null;
    expires_at: number | null;
    providerAccountId: string;
}): Promise<string> {
    const testRes = await fetch("https://discord.com/api/users/@me", {
        headers: { Authorization: `Bearer ${account.access_token}` },
    });

    if (testRes.ok) return account.access_token;

    if (!account.refresh_token) throw new Error("No refresh token available");

    console.log("Access token invalid, attempting refresh...");

    const res = await fetch("https://discord.com/api/oauth2/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
            client_id: process.env.DISCORD_CLIENT_ID!,
            client_secret: process.env.DISCORD_CLIENT_SECRET!,
            grant_type: "refresh_token",
            refresh_token: account.refresh_token,
        }),
    });

    console.log("Refresh response status:", res.status);

    if (!res.ok) throw new Error("Failed to refresh token");

    const refreshed = await res.json();

    await prisma.account.update({
        where: { provider_providerAccountId: { provider: "discord", providerAccountId: account.providerAccountId } },
        data: {
            access_token: refreshed.access_token,
            refresh_token: refreshed.refresh_token ?? account.refresh_token,
            expires_at: Math.floor(Date.now() / 1000) + refreshed.expires_in,
        },
    });

    return refreshed.access_token as string;
}

export async function POST() {
    const session = await auth();
    if (!session?.user?.id) return new Response("Unauthorized", { status: 401 });

    const account = await prisma.account.findFirst({
        where: { userId: session.user.id, provider: "discord" },
        select: { access_token: true, refresh_token: true, expires_at: true, providerAccountId: true },
    });

    if (!account?.access_token) return new Response("No account found", { status: 404 });

    let accessToken: string;
    try {
        accessToken = await getValidAccessToken(account as any);
    } catch (e) {
        console.error("Token error:", e);
        return new Response("Failed to get valid token", { status: 500 });
    }

    const discordRes = await fetch("https://discord.com/api/users/@me", {
        headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!discordRes.ok) return new Response("Failed to fetch Discord profile", { status: 500 });

    const discordUser = await discordRes.json();
    const avatarUrl = discordUser.avatar
        ? `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.png`
        : null;


    await prisma.user.update({
        where: { id: session.user.id },
        data: { image: avatarUrl, name: discordUser.global_name ?? discordUser.username },
    });

    return Response.json({ image: avatarUrl, name: discordUser.global_name ?? discordUser.username });
}

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    if (!userId) return new Response("Missing userId", { status: 400 });

    const account = await prisma.account.findFirst({
        where: { userId, provider: "discord" },
        select: { access_token: true, refresh_token: true, expires_at: true, providerAccountId: true },
    });

    if (!account?.access_token) return new Response("No account found", { status: 404 });

    let accessToken: string;
    try {
        accessToken = await getValidAccessToken(account as any);
    } catch (e) {
        console.error("Token error:", e);
        return new Response("Failed to get valid token", { status: 500 });
    }

    const discordRes = await fetch("https://discord.com/api/users/@me", {
        headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!discordRes.ok) return new Response("Failed to fetch Discord profile", { status: 500 });

    const discordUser = await discordRes.json();
    const avatarUrl = discordUser.avatar
        ? `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.png`
        : null;

    await prisma.user.update({
        where: { id: userId },
        data: { image: avatarUrl, name: discordUser.global_name ?? discordUser.username },
    });

    return Response.json({ image: avatarUrl, name: discordUser.global_name ?? discordUser.username });
}