// lib/contentProcessor.ts
export interface ProcessedContent {
    content: string;
    sources: Array<{ url: string; title: string }>;
}

export function processArticleContent(rawContent: string): ProcessedContent {
    console.log('Raw content length:', rawContent.length);

    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const sources: Array<{ url: string; title: string }> = [];
    const urlMatches = rawContent.match(urlRegex) || [];

    urlMatches.forEach((url) => {
        const cleanUrl = url.replace(/[.,;:!?'")\]]+$/, '');

        // Skip obviously invalid URLs
        if (cleanUrl.length <= 8) return;
        if (!cleanUrl.startsWith("http://") && !cleanUrl.startsWith("https://")) return;

        try {
            const urlObj = new URL(cleanUrl);
            if (!urlObj.hostname) return;

            const title = urlObj.hostname.replace('www.', '');
            if (!sources.some(s => s.url === cleanUrl)) {
                sources.push({ url: cleanUrl, title });
            }
        } catch {
            return;
        }
    });

    // Remove URLs from content but KEEP all markdown syntax
    let cleanContent = rawContent.replace(urlRegex, '').trim();

    // Clean up excessive whitespace but preserve markdown structure
    cleanContent = cleanContent.replace(/\n{3,}/g, '\n\n');

    console.log('Clean content length:', cleanContent.length);

    return { content: cleanContent, sources };
}
