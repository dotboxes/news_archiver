// components/UnauthorizedModal.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { XMarkIcon, ShieldExclamationIcon } from '@heroicons/react/24/outline';

interface UnauthorizedModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function UnauthorizedModal({ isOpen, onClose }: UnauthorizedModalProps) {
    const [isVisible, setIsVisible] = useState(false);
    const router = useRouter();

    useEffect(() => {
        if (isOpen) {
            setIsVisible(true);
        }
    }, [isOpen]);

    const handleClose = () => {
        setIsVisible(false);
        setTimeout(onClose, 300); // Wait for animation
    };

    const handleReturnHome = () => {
        setIsVisible(false);
        setTimeout(() => {
            onClose();
            router.push('/');
        }, 300);
    };

    if (!isOpen) return null;

    return (
        <div
            className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity duration-300 ${
                isVisible ? 'opacity-100' : 'opacity-0'
            }`}
        >
            {/* Backdrop with blur */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={handleClose}
            />

            {/* Modal */}
            <div
                className={`relative bg-primary rounded-lg shadow-xl max-w-md w-full p-6 transform transition-all duration-300 ${
                    isVisible ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'
                }`}
            >
                {/* Close button */}
                <button
                    onClick={handleClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                >
                    <XMarkIcon className="h-6 w-6" />
                </button>

                {/* Icon */}
                <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full">
                    <ShieldExclamationIcon className="h-10 w-10 text-red-600" />
                </div>

                {/* Content */}
                <div className="text-center">
                    <h3 className="text-2xl font-bold text-primary mb-2">
                        Access Denied
                    </h3>
                    <p className="text-secondary mb-6">
                        You don&#39;t have permission to access this page. This area is restricted to administrators only.
                    </p>

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row gap-3">
                        <button
                            onClick={handleClose}
                            className="flex-1 btn-secondary text-primary px-4 py-2 rounded-lg transition-colors font-medium"
                        >
                            Go Back
                        </button>
                        <button
                            onClick={handleReturnHome}
                            className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                        >
                            Return Home
                        </button>
                    </div>

                    {/* Additional info */}
                    <p className="text-sm text-gray-500 mt-4">
                        If you believe this is an error, please contact an administrator.
                    </p>
                </div>
            </div>
        </div>
    );
}

// Alternative version without Heroicons (if you don't have it installed)
export function UnauthorizedModalSimple({ isOpen, onClose }: UnauthorizedModalProps) {
    const [isVisible, setIsVisible] = useState(false);
    const router = useRouter();

    useEffect(() => {
        if (isOpen) {
            setIsVisible(true);
        }
    }, [isOpen]);

    const handleClose = () => {
        setIsVisible(false);
        setTimeout(onClose, 300);
    };

    const handleReturnHome = () => {
        setIsVisible(false);
        setTimeout(() => {
            onClose();
            router.push('/');
        }, 300);
    };

    if (!isOpen) return null;

    return (
        <div
            className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity duration-300 ${
                isVisible ? 'opacity-100' : 'opacity-0'
            }`}
        >
            {/* Backdrop with blur */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={handleClose}
            />

            {/* Modal */}
            <div
                className={`relative bg-white rounded-lg shadow-xl max-w-md w-full p-6 transform transition-all duration-300 ${
                    isVisible ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'
                }`}
            >
                {/* Close button */}
                <button
                    onClick={handleClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors text-2xl"
                >
                    ×
                </button>

                {/* Icon */}
                <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full">
                    <span className="text-4xl">🚫</span>
                </div>

                {/* Content */}
                <div className="text-center">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                        Access Denied
                    </h3>
                    <p className="text-gray-600 mb-6">
                        You don&#39;t have permission to access this page. This area is restricted to administrators only.
                    </p>

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row gap-3">
                        <button
                            onClick={handleClose}
                            className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                        >
                            Go Back
                        </button>
                        <button
                            onClick={handleReturnHome}
                            className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                        >
                            Return Home
                        </button>
                    </div>

                    {/* Additional info */}
                    <p className="text-sm text-gray-500 mt-4">
                        If you believe this is an error, please contact an administrator.
                    </p>
                </div>
            </div>
        </div>
    );
}