'use client';

import { useEffect, useState } from 'react';

declare global {
    interface Window {
        twttr?: any;
    }
}

interface TwitterVideoEmbedProps {
    tweetUrl: string;
}

export default function TwitterVideoEmbed({ tweetUrl }: TwitterVideoEmbedProps) {
    const [embedHtml, setEmbedHtml] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!tweetUrl) return;

        const fetchEmbed = async () => {
            try {
                const res = await fetch(
                    `https://publish.twitter.com/oembed?` +
                    `url=${encodeURIComponent(tweetUrl)}` +
                    `&widget=Video` +
                    `&dnt=true`
                );

                if (!res.ok) throw new Error('Failed to fetch Twitter embed');

                const data = await res.json();
                setEmbedHtml(data.html);
            } catch (err) {
                console.error(err);
                setError('Failed to load Twitter video');
            }
        };

        fetchEmbed();
    }, [tweetUrl]);

    useEffect(() => {
        if (!embedHtml) return;

        // Load widgets.js if needed, otherwise re-process embeds
        if (!window.twttr) {
            const script = document.createElement('script');
            script.src = 'https://platform.twitter.com/widgets.js';
            script.async = true;
            script.onload = () => window.twttr?.widgets?.load();
            document.body.appendChild(script);
        } else {
            window.twttr.widgets.load();
        }
    }, [embedHtml]);

    if (error) {
        return <div className="text-red-500 text-sm">{error}</div>;
    }

    if (!embedHtml) {
        return <div className="text-secondary text-sm">Loading video…</div>;
    }

    return (
        <div
            className="twitter-video-embed flex justify-center"
            dangerouslySetInnerHTML={{ __html: embedHtml }}
        />
    );
}
