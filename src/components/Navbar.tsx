'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import AuthModal from '@/components/AuthModal';
import ProfileMenu from '@/components/ProfileMenu';
import { Inter } from 'next/font/google';
import DarkModeButton from "@/components/DarkModeButton";

const inter = Inter({ subsets: ['latin'] });

export default function Navbar() {
    const { data: session, status } = useSession();
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    return (
        <>
            <nav className="navbar sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        {/* Logo */}
                        <div className="flex items-center">
                            <Link href="/" className="flex items-center">
                                <span className="text-xl font-bold">
                                    Article Hub
                                </span>
                            </Link>
                        </div>

                        {/* Right Side */}
                        <div className="flex items-center space-x-4">
                            <DarkModeButton />
                            {!isMounted || status === 'loading' ? (
                                <div className="animate-pulse h-9 w-20 bg-secondary rounded-full"></div>
                            ) : session?.user ? (
                                <ProfileMenu user={session.user} />
                            ) : (
                                <button
                                    onClick={() => setIsAuthModalOpen(true)}
                                    className={`${inter.className} btn-primary`}
                                >
                                    Sign In
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
        </>
    );
}