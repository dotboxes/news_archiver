'use client';

import { useEffect } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';

interface AlertToastProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    message: string;
    type?: 'success' | 'error' | 'warning' | 'info';
    duration?: number;
}

export default function AlertToast({
                                       isOpen,
                                       onClose,
                                       title,
                                       message,
                                       type = 'info',
                                       duration = 3000
                                   }: AlertToastProps) {
    useEffect(() => {
        if (isOpen && duration > 0) {
            const timer = setTimeout(onClose, duration);
            return () => clearTimeout(timer);
        }
    }, [isOpen, duration, onClose]);

    if (!isOpen) return null;

    const typeStyles = {
        success: {
            icon: <CheckCircle className="w-6 h-6 text-green-600" />,
            bg: 'bg-green-50 dark:bg-green-900/20',
            border: 'border-green-200 dark:border-green-800',
            text: 'text-green-900 dark:text-green-100'
        },
        error: {
            icon: <XCircle className="w-6 h-6 text-red-600" />,
            bg: 'bg-red-50 dark:bg-red-900/20',
            border: 'border-red-200 dark:border-red-800',
            text: 'text-red-900 dark:text-red-100'
        },
        warning: {
            icon: <AlertTriangle className="w-6 h-6 text-amber-600" />,
            bg: 'bg-amber-50 dark:bg-amber-900/20',
            border: 'border-amber-200 dark:border-amber-800',
            text: 'text-amber-900 dark:text-amber-100'
        },
        info: {
            icon: <Info className="w-6 h-6 text-blue-600" />,
            bg: 'bg-blue-50 dark:bg-blue-900/20',
            border: 'border-blue-200 dark:border-blue-800',
            text: 'text-blue-900 dark:text-blue-100'
        }
    };

    const styles = typeStyles[type];

    return (
        <div className="fixed bottom-4 right-4 z-50 animate-in slide-in-from-top duration-300">
            <div className={`${styles.bg} ${styles.border} border rounded-lg shadow-lg p-4 max-w-md min-w-[320px]`}>
                <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-0.5">
                        {styles.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                        <h4 className={`text-sm font-semibold ${styles.text} mb-1`}>
                            {title}
                        </h4>
                        <p className={`text-sm ${styles.text} opacity-90`}>
                            {message}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="flex-shrink-0 p-1 hover:bg-black hover:bg-opacity-10 rounded transition-colors"
                    >
                        <X className={`w-4 h-4 ${styles.text}`} />
                    </button>
                </div>
            </div>
        </div>
    );
}