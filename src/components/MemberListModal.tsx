'use client';

import { useState, useMemo, useRef } from 'react';
import { X, Search } from 'lucide-react';
import { Author, parseAuthorField } from '@/lib/parseAuthor';

interface MemberListModalProps {
    members: (string | Author)[];
    onSelectMember?: (member: string | Author) => void;
}

export default function MemberListModal({ members, onSelectMember }: MemberListModalProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [visibleRange, setVisibleRange] = useState({ start: 0, end: 50 });
    const containerRef = useRef<HTMLDivElement>(null);

    const ITEM_HEIGHT = 44;
    const VISIBLE_ITEMS = 10;

    const filteredMembers = useMemo(() => {
        if (!searchTerm) return members;
        return members.filter(member => {
            const name = typeof member === 'string' ? member : member.name;
            return name.toLowerCase().includes(searchTerm.toLowerCase());
        });
    }, [members, searchTerm]);

    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const container = e.currentTarget;
        const scrollTop = container.scrollTop;
        const start = Math.floor(scrollTop / ITEM_HEIGHT);
        const end = start + VISIBLE_ITEMS + 5;
        setVisibleRange({ start: Math.max(0, start), end });
    };

    const visibleItems = filteredMembers.slice(visibleRange.start, visibleRange.end);
    const totalHeight = filteredMembers.length * ITEM_HEIGHT;
    const offsetY = visibleRange.start * ITEM_HEIGHT;

    const closeModal = () => {
        setIsOpen(false);
        setSearchTerm('');
    };

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary  hover:bg-blue-100 text-blue-700 font-medium transition-colors"
            >
                👥 {members.length} members
            </button>

            <div
                className={`fixed inset-0 backdrop-blur-sm bg-black/20 z-40 transition-opacity duration-300 ${
                    isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
                }`}
                onClick={closeModal}
            />

            <div
                className={`fixed inset-0 flex items-center justify-center z-50 transition-all duration-300 ${
                    isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
                }`}
            >
                <div
                    className={`bg-secondary rounded-xl shadow-xl max-w-md w-full mx-4 flex flex-col h-96 transform transition-all duration-500 ease-out ${
                        isOpen
                            ? 'scale-100 translate-y-0 opacity-100'
                            : 'scale-95 -translate-y-2 opacity-0'
                    }`}
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-5 border-b border-gray-200">
                        <h2 className="text-lg font-bold text-primary">Members</h2>
                        <button
                            onClick={closeModal}
                            className="p-1 text-primary hover:text-gray-700 text-2xl leading-none rounded-lg transition-transform hover:scale-120"
                        >
                            ×
                        </button>
                    </div>

                    {/* Search */}
                    <div className="p-4 border-b border-gray-200">
                        <div className="relative">
                            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-primary" />
                            <input
                                type="text"
                                placeholder="Search members..."
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value);
                                    setVisibleRange({ start: 0, end: 50 });
                                }}
                                className="w-full pl-10 pr-4 py-2 border input border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                            />
                        </div>
                    </div>

                    {/* Virtualized list */}
                    <div
                        ref={containerRef}
                        onScroll={handleScroll}
                        className="flex-1 overflow-y-scroll scroll-smooth"
                        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                    >
                        <style>{`.scroll-container::-webkit-scrollbar { display: none; }`}</style>
                        <div style={{ height: totalHeight, position: 'relative' }}>
                            <div style={{ transform: `translateY(${offsetY}px)`, transition: 'none' }}>
                                {visibleItems.length === 0 ? (
                                    <div className="p-6 text-center text-gray-500">No members found</div>
                                ) : (
                                    visibleItems.map((member, idx) => {
                                        const author = parseAuthorField(typeof member === 'string' ? member : member);

                                        return (
                                            <div
                                                key={`${visibleRange.start + idx}-${author?.name}`}
                                                onClick={() => {
                                                    onSelectMember?.(member);
                                                    closeModal();
                                                }}
                                                className="h-11 px-4 flex items-center gap-2 hover:bg-gray-500 border-b border-gray-100 text-primary cursor-pointer transition-colors"
                                            >
                                                {author?.image && (
                                                    <img
                                                        src={author.image}
                                                        alt={author.name}
                                                        className="w-6 h-6 rounded-full"
                                                    />
                                                )}
                                                <span>{author?.name}</span>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="p-4 border-t border-gray-200 text-sm text-gray-600">
                        {filteredMembers.length} of {members.length} members
                    </div>
                </div>
            </div>
        </>
    );
}
