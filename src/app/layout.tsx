import { Inter } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';
import { Providers } from './providers';
import { DarkModeProvider } from '@/context/DarkModeContext';
import { ThemedScript } from '@/context/ThemedScript'; // <-- IMPORT THE NEW SCRIPT COMPONENT

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en" suppressHydrationWarning>
        <head>
            <ThemedScript />
        </head>
        <body className={`${inter.className} bg-primary transition-colors duration-300`}>
        {/* 2. Move the DarkModeProvider back inside the body */}
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