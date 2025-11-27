// auth.config.ts
import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
    pages: {
        signIn: '/auth/signin',
    },
    providers: [], // This will be populated in the main auth file
} satisfies NextAuthConfig;