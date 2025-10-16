// auth/actions.ts
'use server';

import { signIn as authSignIn, signOut as authSignOut } from 'next-auth/react';

export async function signIn(provider: string) {
    return await authSignIn(provider);
}

export async function signOut() {
    return await authSignOut();
}