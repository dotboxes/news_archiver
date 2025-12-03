// components/MarkdownContent.tsx
'use client';

import ReactMarkdown from 'react-markdown';

interface MarkdownContentProps {
    content: string;
    className?: string;
    compact?: boolean; // For article cards vs full articles
}

export default function MarkdownContent({ content, className = '', compact = false }: MarkdownContentProps) {
    if (compact) {
        // Simplified styling for article cards/previews
        return (
            <div className={className}>
                <ReactMarkdown
                    components={{
                        h2: ({ ...props }) => (
                            <h2 className="text-lg font-bold mt-2 mb-1 text-primary" {...props} />
                        ),
                        h3: ({ ...props }) => (
                            <h3 className="text-base font-semibold mt-2 mb-1 text-secondary" {...props} />
                        ),
                        p: ({ ...props }) => (
                            <p className="mb-2 text-teritary leading-relaxed text-sm" {...props} />
                        ),
                        ul: ({ ...props }) => (
                            <ul className="list-disc ml-4 my-2 space-y-1" {...props} />
                        ),
                        li: ({ ...props }) => (
                            <li className="text-teritary text-sm" {...props} />
                        ),
                        strong: ({ ...props }) => (
                            <strong className="font-semibold text-teritary" {...props} />
                        ),
                    }}
                >
                    {content}
                </ReactMarkdown>
            </div>
        );
    }

    // Full styling for article pages
    return (
        <div className={className}>
            <ReactMarkdown
                components={{
                    h2: ({ ...props }) => (
                        <h2 className="text-2xl font-bold mt-6 mb-3 text-primary" {...props} />
                    ),
                    h3: ({ ...props }) => (
                        <h3 className="text-xl font-semibold mt-4 mb-2 text-secondary" {...props} />
                    ),
                    p: ({ ...props }) => (
                        <p className="mb-4 text-primary leading-relaxed" {...props} />
                    ),
                    ul: ({ ...props }) => (
                        <ul className="list-disc ml-6 my-4 space-y-2" {...props} />
                    ),
                    li: ({ ...props }) => (
                        <li className="text-primary" {...props} />
                    ),
                    strong: ({ ...props }) => (
                        <strong className="font-semibold text-primary" {...props} />
                    ),
                }}
            >
                {content}
            </ReactMarkdown>
        </div>
    );
}