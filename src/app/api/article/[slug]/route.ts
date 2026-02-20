import { NextResponse } from 'next/server';
import {prisma} from "@/lib/prisma";

export async function GET(request: Request) {
    const url = new URL(request.url);
    const slug = url.pathname.split('/').pop();

    if (!slug) {
        return NextResponse.json({ error: 'Missing slug' }, { status: 400 });
    }

    try {
        const article = await prisma.articles.findUnique({
            where: { slug },
            select: {
                id: true,
                title: true,
                subtitle: true,
                slug: true,
                content: true,
                image_url: true,
                media_type: true,
                author: true,
                category: true,
                published_date: true,
                created_at: true,
                updated_at: true,
            },
        });

        if (!article) {
            return NextResponse.json({ error: 'Article not found' }, { status: 404 });
        }

        console.log('Article author field:', article.author);

        // Fetch user image if author has discord_id
        let userImage = null;
        let userId = null;

        if (article.author) {
            try {
                const authorData = JSON.parse(article.author);
                console.log('Parsed author data:', authorData);

                if (authorData.discord_id) {
                    const account = await prisma.account.findFirst({
                        where: {
                            provider: 'discord',
                            providerAccountId: authorData.discord_id
                        },
                        include: {
                            user: {
                                select: { image: true, name: true, id: true }
                            }
                        }
                    });

                    userImage = account?.user?.image ?? null;
                    userId = account?.user?.id ?? null;

                    if (account?.access_token && account?.user?.id) {
                        let accessToken = account.access_token;

                        // Try the token, refresh if 401
                        let discordRes = await fetch("https://discord.com/api/users/@me", {
                            headers: { Authorization: `Bearer ${accessToken}` },
                        });

                        console.log('Discord API status:', discordRes.status);

                        if (discordRes.status === 401 && account.refresh_token) {
                            console.log('Token invalid, refreshing...');
                            const refreshRes = await fetch("https://discord.com/api/oauth2/token", {
                                method: "POST",
                                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                                body: new URLSearchParams({
                                    client_id: process.env.DISCORD_CLIENT_ID!,
                                    client_secret: process.env.DISCORD_CLIENT_SECRET!,
                                    grant_type: "refresh_token",
                                    refresh_token: account.refresh_token,
                                }),
                            });

                            console.log('Refresh status:', refreshRes.status);

                            if (refreshRes.ok) {
                                const refreshed = await refreshRes.json();
                                accessToken = refreshed.access_token;

                                await prisma.account.update({
                                    where: {
                                        provider_providerAccountId: {
                                            provider: 'discord',
                                            providerAccountId: authorData.discord_id,
                                        },
                                    },
                                    data: {
                                        access_token: refreshed.access_token,
                                        refresh_token: refreshed.refresh_token ?? account.refresh_token,
                                        expires_at: Math.floor(Date.now() / 1000) + refreshed.expires_in,
                                    },
                                });

                                // Retry with new token
                                discordRes = await fetch("https://discord.com/api/users/@me", {
                                    headers: { Authorization: `Bearer ${accessToken}` },
                                });
                                console.log('Retry status:', discordRes.status);
                            }
                        }

                        if (discordRes.ok) {
                            const discordUser = await discordRes.json();
                            const freshAvatar = discordUser.avatar
                                ? `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.png`
                                : null;

                            console.log('Fresh avatar:', freshAvatar);
                            console.log('Stored avatar:', userImage);

                            if (freshAvatar !== userImage) {
                                console.log('Updating avatar in DB...');
                                await prisma.user.update({
                                    where: { id: account.user.id },
                                    data: {
                                        image: freshAvatar,
                                        name: discordUser.global_name ?? discordUser.username,
                                    },
                                });
                                userImage = freshAvatar;
                            }
                        }
                    }
                }
            } catch (e) {
                // Not JSON - it's an old-style plain string author name
                console.log('Author is plain string (old format)');
            }
        }

        console.log('Final userImage:', userImage);

        return NextResponse.json({
            article: {
                ...article,
                userImage,
                userId,
            }
        });
    } catch (err: unknown) {
        console.error('Database query failed:', err);
        const message = err instanceof Error ? err.message : 'Database error';
        return NextResponse.json({ error: 'Database error', details: message }, { status: 500 });
    }
}