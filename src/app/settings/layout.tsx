// app/settings/layout.tsx
import { Metadata } from 'next';
import { auth } from "@/app/api/auth/config";

export async function generateMetadata(): Promise<Metadata> {
    const session = await auth();

    if (!session?.user) {
        return {
            title: 'Settings - Potato Archive',
            description: 'Manage your account settings and preferences',
        };
    }

    const userName = session.user.name || 'User';

    return {
        title: `${userName}'s Settings`,
        description: 'Manage your account settings and preferences',
    };
}

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}