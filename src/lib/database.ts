// lib/database.ts

export interface Article {
    id: number;
    title: string;
    subtitle: string;
    slug: string;
    content: string;
    image_url: string;
    author: string;
    category: string;
    published_date: string;
}

export interface ArticlePreview {
    id: number;
    title: string;
    subtitle?: string | null;
    slug: string;
    image_url?: string | null;
    media_type?: 'image' | 'video' | null;
    author?: string | null;
    published_date?: string | null;
    category?: string | null;
}

