'use client';

import { useState, useEffect } from 'react';
import { X, Check, Loader2 } from 'lucide-react';

interface Article {
    id: number;
    title: string;
    subtitle?: string | null;
    content: string;
    image_url?: string | null;
    category?: string | null;
}

interface EditArticleModalProps {
    article: Article;
    isOpen: boolean;
    isLoading: boolean;
    onClose: () => void;
    onSave: (updated: Partial<Article>) => void;
}

export default function EditArticleModal({ article, isOpen, onClose, onSave }: EditArticleModalProps) {
    const [editTitle, setEditTitle] = useState(article.title);
    const [editSubtitle, setEditSubtitle] = useState(article.subtitle || '');
    const [editContent, setEditContent] = useState(article.content);
    const [editImageUrl, setEditImageUrl] = useState(article.image_url || '');
    const [editCategory, setEditCategory] = useState(article.category || '');
    const [isClosing, setIsClosing] = useState(false);
    const [isVisible, setIsVisible] = useState(false); // ✅ track fade/scale-in
    const [isLoading, setIsLoading] = useState(true);

    // Handle open/close lifecycle
    useEffect(() => {
        if (isOpen) {
            setEditTitle(article.title);
            setEditSubtitle(article.subtitle || '');
            setEditContent(article.content || '');
            setEditImageUrl(article.image_url || '');
            setEditCategory(article.category || '');
            setIsLoading(false);
            setTimeout(() => setIsVisible(true), 10); // ✅ fade/scale in
        } else {
            setIsVisible(false);
        }
    }, [isOpen, article]);

    if (!isOpen) return null;

    const handleClose = () => {
        setIsClosing(true);
        setIsVisible(false);
        setTimeout(() => {
            setIsClosing(false);
            onClose();
        }, 300);
    };

    const handleSave = () => {
        onSave({
            title: editTitle,
            subtitle: editSubtitle,
            content: editContent,
            image_url: editImageUrl,
            category: editCategory,
        });
    };

    return (
        <div
            className={`fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity duration-300 ${
                isVisible && !isClosing ? 'opacity-100' : 'opacity-0'
            }`}
        >
            <div
                className={`bg-secondary rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto transition-all duration-300 transform ${
                    isVisible && !isClosing ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-4'
                }`}
            >
                <div className="flex justify-between items-center p-6 border-b border-gray-200 sticky top-0 bg-primary z-10">
                    <h2 className="text-2xl font-bold text-primary">Edit Article</h2>
                    <button onClick={handleClose} className="text-gray-400 hover:text-gray-600 transition">
                        <X size={24} />
                    </button>
                </div>

                {isLoading ? (
                    <div className="p-12 flex flex-col items-center justify-center">
                        <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-4" />
                        <p className="text-gray-500">Loading article content...</p>
                    </div>
                ) : (
                    <div className="p-6 space-y-4">
                        <input
                            type="text"
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-primary text-primary focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Article title"
                        />
                        <input
                            type="text"
                            value={editSubtitle}
                            onChange={(e) => setEditSubtitle(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-primary text-primary focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Article subtitle"
                        />
                        <input
                            type="text"
                            value={editImageUrl}
                            onChange={(e) => setEditImageUrl(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-primary text-primary focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Image URL"
                        />
                        <input
                            type="text"
                            value={editCategory}
                            onChange={(e) => setEditCategory(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-primary text-primary focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Category / Source"
                        />
                        <textarea
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-primary text-primary focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-48"
                            placeholder="Article content"
                        />

                        <div className="flex gap-2 justify-end pt-4">
                            <button
                                onClick={handleClose}
                                className="px-4 py-2 rounded-lg border border-gray-300 text-primary font-medium hover:bg-gray-500 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                className="px-4 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
                            >
                                <Check size={18} /> Save Changes
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
