'use client';

import { AlertTriangle, CheckCircle, XCircle, Info, X } from 'lucide-react';
import { useEffect } from 'react';

interface ConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    type?: 'danger' | 'warning' | 'success' | 'info';
    confirmText?: string;
    cancelText?: string;
}

export default function ConfirmModal({
                                         isOpen,
                                         onClose,
                                         onConfirm,
                                         title,
                                         message,
                                         type = 'warning',
                                         confirmText = 'Confirm',
                                         cancelText = 'Cancel',
                                     }: ConfirmModalProps) {
    // Disable background scroll when modal is open
    useEffect(() => {
        document.body.style.overflow = isOpen ? 'hidden' : '';
        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    const typeStyles = {
        danger: {
            icon: <XCircle className="w-8 h-8 text-red-500" />,
            button: 'bg-red-600 hover:bg-red-700 text-white',
        },
        warning: {
            icon: <AlertTriangle className="w-8 h-8 text-amber-500" />,
            button: 'bg-amber-600 hover:bg-amber-700 text-white',
        },
        success: {
            icon: <CheckCircle className="w-8 h-8 text-green-500" />,
            button: 'bg-green-600 hover:bg-green-700 text-white',
        },
        info: {
            icon: <Info className="w-8 h-8 text-blue-500" />,
            button: 'bg-blue-600 hover:bg-blue-700 text-white',
        },
    };

    const styles = typeStyles[type];

    return (
        <>
            {/* Backdrop */}
            <div
                onClick={onClose}
                className={`fixed inset-0 backdrop-blur-sm bg-black/40 z-40 transition-opacity duration-300 ${
                    isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
                }`}
            />

            {/* Modal container */}
            <div
                className={`fixed inset-0 flex items-center justify-center z-50 transition-all duration-300 ${
                    isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
                }`}
            >
                <div
                    onClick={(e) => e.stopPropagation()}
                    className={`bg-secondary rounded-xl shadow-xl max-w-md w-full mx-4 flex flex-col transform transition-all duration-500 ease-out ${
                        isOpen
                            ? 'scale-100 translate-y-0 opacity-100'
                            : 'scale-95 -translate-y-2 opacity-0'
                    }`}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-5 border-b border-gray-700">
                        <div className="flex items-center gap-3">
                            {styles.icon}
                            <h3 className="text-lg font-semibold text-primary">{title}</h3>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-1 text-primary hover:text-gray-400 transition-transform hover:scale-110"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Message */}
                    <div className="px-6 py-5 text-sm text-secondary leading-relaxed">
                        {message}
                    </div>

                    {/* Footer */}
                    <div className="flex justify-end gap-3 p-5 border-t border-gray-700">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 rounded-lg bg-tertiary text-secondary hover:bg-gray-500 hover:text-white transition-colors text-sm font-medium"
                        >
                            {cancelText}
                        </button>
                        <button
                            onClick={() => {
                                onConfirm();
                                onClose();
                            }}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${styles.button}`}
                        >
                            {confirmText}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}
