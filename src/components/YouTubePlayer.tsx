import { useEffect, useRef } from 'react';

interface YouTubePlayerProps {
    videoUrl: string;
}

export default function YouTubePlayer({ videoUrl }: YouTubePlayerProps) {
    const playerRef = useRef<HTMLDivElement | null>(null);
    const playerInstance = useRef<YT.Player | null>(null);  // <— FIXED

    const extractVideoId = (url: string): string | null => {
        const regex =
            /(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|embed)\/|.*[?&]v=)|youtu\.be\/)([^"&?/ ]{11})/;
        const match = url.match(regex);
        return match ? match[1] : null;
    };

    useEffect(() => {
        const videoId = extractVideoId(videoUrl);
        if (!videoId || !playerRef.current) return;

        // Load API
        if (!window.YT) {
            const tag = document.createElement('script');
            tag.src = "https://www.youtube.com/iframe_api";
            document.body.appendChild(tag);
        }

        const createPlayer = () => {
            playerInstance.current = new window.YT.Player(playerRef.current!, {
                height: "100%",
                width: "100%",
                videoId,
                playerVars: {
                    autoplay: 0,
                    controls: 1,
                    modestbranding: 1,
                    rel: 0,
                },
                events: {
                    onReady: (event: YT.PlayerEvent) => console.log("Player ready"),
                    onError: (error: YT.OnErrorEvent) => console.error("Player error:", error),
                },
            });
        };

        if (window.YT && window.YT.Player) {
            createPlayer();
        } else {
            window.onYouTubeIframeAPIReady = createPlayer;
        }

        return () => {
            playerInstance.current?.destroy();
        };
    }, [videoUrl]);

    return (
        <div className="w-full h-96 relative bg-black flex items-center justify-center">
            <div ref={playerRef} className="w-full h-full" />
        </div>
    );
}
