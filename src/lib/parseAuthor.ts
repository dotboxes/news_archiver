// lib/parseAuthor.ts
export interface Author {
    name: string;
    discord_id?: string;
    image?: string | null;
}

/**
 * Safely parses an author field, which can be:
 * - a stringified JSON (legacy)
 * - a plain string
 * - an object with { name, discord_id?, image? }
 */
// lib/parseAuthor.ts
export function parseAuthorField(
    authorField: string | Author | undefined | null,
    userImage?: string | null
): Author | null {
    if (!authorField) return null;

    if (typeof authorField === 'string') {
        try {
            const parsed = JSON.parse(authorField);
            return {
                name: parsed.name || authorField,
                discord_id: parsed.discord_id,
                image: userImage || parsed.image,
            };
        } catch {
            return { name: authorField, image: userImage || undefined };
        }
    }

    // It's already an object
    return {
        name: authorField.name || 'Unknown Author',
        discord_id: authorField.discord_id,
        image: userImage || authorField.image,
    };
}

