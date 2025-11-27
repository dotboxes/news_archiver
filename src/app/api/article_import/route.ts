// app/api/article_import/route.ts
import { NextResponse } from 'next/server';
import {prisma} from "@/lib/prisma";
import {generateCategory} from "@/lib/categoryKewords";
import { auth } from '@/app/api/auth/config';

function cleanTwitterImageUrl(url: string): string {
    // Remove Twitter size suffixes like :large, :medium, :small, :thumb
    // From: https://pbs.twimg.com/media/G3GM-oKWkAAYopq.jpg:large
    // To: https://pbs.twimg.com/media/G3GM-oKWkAAYopq.jpg
    if (url.includes('pbs.twimg.com')) {
        return url.replace(/:(large|medium|small|thumb|orig)$/i, '');
    }
    return url;
}

function cleanMediaUrl(url: string): string {
    // Clean Twitter URLs
    if (url.includes('pbs.twimg.com') || url.includes('video.twimg.com')) {
        return url.replace(/:(large|medium|small|thumb|orig)$/i, '');
    }

    // TikTok URLs often have query parameters that can be removed
    if (url.includes('tiktok')) {
        try {
            const urlObj = new URL(url);
            // Keep the base URL without unnecessary query params
            return `${urlObj.origin}${urlObj.pathname}`;
        } catch {
            return url;
        }
    }

    return url;
}

export async function POST(request: Request) {
    try {
        const body = await request.json();

        // Get the logged-in user's session
        const session = await auth();
        console.log('Session when creating article:', session); // ADD THIS

        // Store user info as JSON string
        const authorData = session?.user ? JSON.stringify({
            name: session.user.name,
            email: session.user.email
        }) : body.author;

        console.log('Author data being saved:', authorData); // ADD THIS

        function normalizeTwitterUrl(url: string): string {
            return url
                .replace(/^https?:\/\/(www\.)?(fxtwitter|vxtwitter|x)\.com/, 'https://twitter.com');
        }

        async function extractTweetImage(url: string): Promise<string | null> {
            try {
                const normalized = normalizeTwitterUrl(url);
                const response = await fetch(normalized);
                const html = await response.text();

                // Match typical Twitter card image (e.g. <meta property="og:image" content="...">)
                const match = html.match(/<meta\s+property="og:image"\s+content="([^"]+)"/i);
                if (match && match[1]) return cleanTwitterImageUrl(match[1]);
            } catch (e) {
                console.warn("Could not extract tweet image:", e);
            }
            return null;
        }

        async function extractSocialMediaImage(url: string): Promise<string | null> {
            try {
                const response = await fetch(url, {
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                    }
                });
                const html = await response.text();

                // Try og:image first (works for most platforms)
                let match = html.match(/<meta\s+property="og:image"\s+content="([^"]+)"/i);
                if (match && match[1]) return cleanMediaUrl(match[1]);

                // Try twitter:image as fallback
                match = html.match(/<meta\s+name="twitter:image"\s+content="([^"]+)"/i);
                if (match && match[1]) return cleanMediaUrl(match[1]);

                // For TikTok, also try og:video:poster
                if (url.includes('tiktok')) {
                    match = html.match(/<meta\s+property="og:video:poster"\s+content="([^"]+)"/i);
                    if (match && match[1]) return cleanMediaUrl(match[1]);
                }
            } catch (e) {
                console.warn("Could not extract social media image:", e);
            }
            return null;
        }

        // Keep Discord CDN URLs for use as image_url
        let imageUrl = body.image_url || null;
        let mediaType = body.media_type || 'image';

        // Handle social media URLs and fetch image if missing
        if (!imageUrl && body.source_url) {
            const source = body.source_url.toLowerCase();

            // Twitter/X
            if (source.includes('twitter.com') || source.includes('x.com') ||
                source.includes('fxtwitter.com') || source.includes('vxtwitter.com')) {
                imageUrl = await extractTweetImage(body.source_url);
            }
            // TikTok, Instagram, YouTube, etc.
            else if (source.includes('tiktok') || source.includes('instagram') ||
                source.includes('youtube') || source.includes('youtu.be')) {
                imageUrl = await extractSocialMediaImage(body.source_url);

                // TikTok and YouTube are always videos
                if (source.includes('tiktok') || source.includes('youtube') || source.includes('youtu.be')) {
                    mediaType = 'video';
                }
            }
        }

        // Clean media URLs
        if (imageUrl) {
            imageUrl = cleanMediaUrl(imageUrl);
        }

        // Use placeholder if still no image
        if (!imageUrl) {
            imageUrl = "https://dummyimage.com/600x400/e0e0e0/555.png&text=No+Image";
        }

        console.log(`Article import - Image URL: ${imageUrl}, Media Type: ${mediaType}`);

        // Remove Discord/other CDN URLs from content
        let content = body.content || "";
        content = content.replace(imageUrl || "", "").trim();
        content = content.replace(/https?:\/\/cdn\.discordapp\.com\/[^\s]+/g, "").trim();
        content = content.replace(/https?:\/\/media\.discordapp\.net\/[^\s]+/g, "").trim();

        let slug = body.slug;
        let attempt = 0;

        // Keep trying slug variants until we find an unused one
        while (attempt < 100) {
            const existing = await prisma.articles.findUnique({
                where: { slug },
            });

            if (!existing) {
                // Slug is available, use it
                break;
            }

            // Slug exists, try next variant
            attempt++;
            slug = `${body.slug}-${attempt}`;
        }

        if (attempt >= 100) {
            return NextResponse.json(
                { error: 'Could not generate unique slug after 100 attempts. Too many duplicate articles.' },
                { status: 400 }
            );
        }

        const article = await prisma.articles.create({
            data: {
                title: body.title,
                subtitle: body.subtitle || null,
                slug: slug,
                content: content,
                image_url: imageUrl,
                media_type: mediaType,
                author: typeof body.author === 'string' ? body.author : JSON.stringify(body.author), // Convert object to JSON string
                category: body.category || generateCategory(body.title, content, body.subtitle),
                published_date: new Date(body.published_date),
            },
        });

        return NextResponse.json(article, { status: 201 });
    } catch (err: unknown) {
        console.error('Failed to create article:', err);
        return NextResponse.json(
            { error: 'Failed to create article' },
            { status: 500 }
        );
    }
}