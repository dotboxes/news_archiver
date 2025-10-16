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
    subtitle: string;
    slug: string;
    image_url: string;
    author: string;
    category: string;
    published_date: string;
}

// Create the SQL connection
// const sql = neon(process.env.DATABASE_URL!);

// export default sql;