// app/layout.tsx
import { Inter } from 'next/font/google';
import './globals.css';
import { Metadata } from 'next';
import Navbar from "@/components/Navbar";
import { Providers } from './providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
    title: 'Article Hub',
    description: 'Discover the latest articles and insights',
};

export default function RootLayout({
                                       children,
                                   }: {
    children: React.ReactNode
}) {
    return (
        <html lang="en">
        <body className={inter.className}>
        <Providers>
            <Navbar />
            {children}
        </Providers>
        </body>
        </html>
    )
}