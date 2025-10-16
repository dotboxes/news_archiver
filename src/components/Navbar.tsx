'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import AuthModal from '@/components/AuthModal';
import ProfileMenu from '@/components/ProfileMenu';
import { Inter } from 'next/font/google';

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
            <nav className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        {/* Logo */}
                        <div className="flex items-center">
                            <Link href="/" className="flex items-center">
                                <span className="text-xl font-bold text-gray-900">
                                    Article Hub
                                </span>
                            </Link>
                        </div>

                        {/* Right Side */}
                        <div className="flex items-center space-x-4">
                            {!isMounted || status === 'loading' ? (
                                <div className="animate-pulse h-9 w-20 bg-gray-200 rounded-full"></div>
                            ) : session?.user ? (
                                <ProfileMenu user={session.user} />
                            ) : (
                                <button
                                    onClick={() => setIsAuthModalOpen(true)}
                                    className={`${inter.className} px-4 py-2 text-sm font-medium 
                                               text-blue-700 bg-blue-100 rounded-full
                                               hover:bg-blue-200 hover:text-blue-800
                                               focus:outline-none focus:ring-2 focus:ring-blue-300
                                               transition-all duration-200`}
                                >
                                    Sign In
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            {/* Auth Modal */}
            <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
        </>
    );
}
