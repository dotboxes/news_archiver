import { Inter } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';
import { Providers } from './providers';
import { DarkModeProvider } from '@/context/DarkModeContext';
import { ThemedScript } from '@/context/ThemedScript';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
    title: 'Potato Archive',
    description: 'We archive potatoes',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en" suppressHydrationWarning>
        <head>
            <ThemedScript />
        </head>
        <body className={`${inter.className} bg-primary transition-colors duration-300`}>
        <DarkModeProvider>
            <Providers>
                <Navbar />
                {children}
            </Providers>
        </DarkModeProvider>
        </body>
        </html>
    );
}