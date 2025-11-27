'use client';

import { useState, useRef, useEffect } from 'react';
import { signOut, useSession } from 'next-auth/react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { isAdmin } from '@/lib/admins'; // ✅ Add this import

interface ProfileMenuProps {
    user: {
        name?: string | null;
        email?: string | null;
        image?: string | null;
    };
}

export default function ProfileMenu({ user }: ProfileMenuProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [imgLoaded, setImgLoaded] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const { data: session } = useSession();

    // Close menu when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }
    }, [isOpen]);

    const handleSignOut = async () => {
        setIsOpen(false);
        await signOut({ redirect: false });
    };

    // ✅ Check admin privileges safely
    const userIsAdmin = user?.email ? isAdmin(user) : false;

    return (
        <div className="relative" ref={menuRef}>
            {/* Profile Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-1 py-1 rounded-full hover:bg-slate-400 transition-colors"
            >
                {user.image ? (
                    <div className="relative w-8 h-8 rounded-full overflow-hidden">
                        {!imgLoaded && (
                            <div className="absolute inset-0 animate-pulse"></div>
                        )}
                        <img
                            src={user.image}
                            alt="Profile"
                            className={`w-8 h-8 rounded-full object-cover ${
                                imgLoaded ? 'block' : 'hidden'
                            }`}
                            onLoad={() => setImgLoaded(true)}
                        />
                    </div>
                ) : (
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-400">
                        ?
                    </div>
                )}

            </button>

            {/* Dropdown Menu with Animation */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        key="dropdown"
                        initial={{ opacity: 0, scale: 0.95, y: -4 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -4 }}
                        transition={{ duration: 0.15, ease: 'easeOut' }}
                        className="absolute right-0 mt-2 w-48 bg-secondary rounded-lg shadow-lg border border-gray-200 py-1 z-40 origin-top"
                    >
                        {/* User Info */}
                        <div className="px-4 py-2 border-b border-gray-200">
                            <p className="text-sm font-medium text-secondary truncate">{user.name}</p>
                            <p className="text-xs text-gray-500 overflow-hidden text-ellipsis whitespace-nowrap max-w-[160px]">
                                {user.email}
                            </p>
                        </div>

                        {/* Settings Link */}
                        <Link
                            href="/settings"
                            onClick={() => setIsOpen(false)}
                            className="block w-full text-left px-4 py-2 text-sm text-primary hover:bg-gray-400 transition-colors flex items-center gap-2"
                        >
                            <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                                />
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                />
                            </svg>
                            My Articles
                        </Link>

                        {/* ✅ Admin Dashboard (only visible to admins) */}
                        {userIsAdmin && (
                            <Link
                                href="/admin"
                                onClick={() => setIsOpen(false)}
                                className="block w-full text-left px-4 py-2 text-sm text-primary hover:bg-gray-400 transition-colors flex items-center gap-2"
                            >
                                <svg
                                    className="w-4 h-4"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M3 7h18M3 12h18M3 17h18"
                                    />
                                </svg>
                                Admin Dashboard
                            </Link>
                        )}

                        {/* Sign Out Button */}
                        <button
                            onClick={handleSignOut}
                            className="w-full text-left px-4 py-2 text-sm text-primary hover:bg-gray-200 transition-colors flex items-center gap-2 hover:text-red-600 border-t border-gray-200"
                        >
                            <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                                />
                            </svg>
                            Sign out
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
