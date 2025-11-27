// lib/contentProcessor.ts
export interface ProcessedContent {
    content: string;
    sources: Array<{ url: string; title: string }>;
    hasValidContent: boolean;
}

export function processArticleContent(rawContent: string): ProcessedContent {
    // Extract all URLs
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const sources: Array<{ url: string; title: string }> = [];
    const urlMatches = rawContent.match(urlRegex) || [];

    urlMatches.forEach((url) => {
        // Remove trailing punctuation
        const cleanUrl = url.replace(/[.,;:!?'")\]]+$/, '');

        // Avoid duplicates
        if (!sources.some(s => s.url === cleanUrl)) {
            // Try to extract a title from the URL
            try {
                const urlObj = new URL(cleanUrl);
                const title = urlObj.hostname.replace('www.', '');
                sources.push({ url: cleanUrl, title });
            } catch {
                sources.push({ url: cleanUrl, title: cleanUrl });
            }
        }
    });

    // Remove bold markdown (**text** -> text)
    let cleanContent = rawContent.replace(/\*\*([^\*]+)\*\*/g, '$1');

    // Remove URLs from content
    cleanContent = cleanContent.replace(urlRegex, '').trim();

    // Clean up extra whitespace
    cleanContent = cleanContent.replace(/\n\s*\n/g, '\n\n');

    // Check if content is valid (has actual text)
    const hasValidContent = cleanContent.length > 0;

    return {
        content: cleanContent,
        sources,
        hasValidContent
    };
}