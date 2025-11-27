// utils/admin.ts

// Get Discord IDs from env
const rawDiscordIds =
    typeof window === "undefined"
        ? process.env.ADMIN_DISCORD_IDS
        : process.env.NEXT_PUBLIC_ADMIN_DISCORD_IDS;

export const ADMIN_DISCORD_IDS = (rawDiscordIds || "")
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);

// Hardcoded emails (can move to env later if desired)
export const ADMIN_EMAILS = [
    "you@example.com",
    // Add more emails here
];

export function isAdmin(user: { id?: string | null; email?: string | null } | null | undefined): boolean {
    if (!user) return false;
    if (user.id && ADMIN_DISCORD_IDS.includes(user.id)) return true;
    if (user.email && ADMIN_EMAILS.includes(user.email)) return true;
    return false;
}
