'use client';

import { useState, useRef, useEffect } from 'react';
import { signOut, useSession } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';

interface ProfileMenuProps {
    user: {
        name?: string | null;
        email?: string | null;
        image?: string | null;
    };
}

export default function ProfileMenu({ user }: ProfileMenuProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [imgLoaded, setImgLoaded] = useState(false); // Track image loading
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

    return (
        <div className="relative" ref={menuRef}>
            {/* Profile Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
                {/* Skeleton loader */}
                {user.image ? (
                    <div className="relative w-8 h-8 rounded-full overflow-hidden bg-gray-200">
                        {!imgLoaded && (
                            <div className="absolute inset-0 animate-pulse bg-gray-300"></div>
                        )}
                        <img
                            src={user.image}
                            alt="Profile"
                            className={`w-8 h-8 rounded-full object-cover ${imgLoaded ? 'block' : 'hidden'}`}
                            onLoad={() => setImgLoaded(true)}
                        />
                    </div>
                ) : (
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-400">
                        ?
                    </div>
                )}
                <span className="text-sm font-medium text-gray-700 hidden sm:inline">
                    {user.name || user.email}
                </span>
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
                        className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-40 origin-top"
                    >
                        {/* User Info */}
                        <div className="px-4 py-2 border-b border-gray-200">
                            <p className="text-sm font-medium text-gray-900">{user.name}</p>
                            <p className="text-xs text-gray-500">{user.email}</p>
                        </div>

                        {/* Sign Out Button */}
                        <button
                            onClick={handleSignOut}
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2 hover:text-red-600"
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
