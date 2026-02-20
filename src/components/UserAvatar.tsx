// components/UserAvatar.tsx
"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import Image from "next/image";

interface UserAvatarProps {
    src?: string | null;
    name?: string | null;
    size?: number;
}

export function UserAvatar({ src, name, size = 40 }: UserAvatarProps) {
    const { update } = useSession();
    const [errored, setErrored] = useState(false);

    async function handleError() {
        if (errored) return; // don't loop
        setErrored(true);

        try {
            const res = await fetch("/api/user/refresh-avatar", { method: "POST" });
            if (res.ok) {
                const data = await res.json();
                await update({ image: data.image, name: data.name }); // refreshes session client-side
            }
        } catch (e) {
            console.error("Avatar refresh failed:", e);
        }
    }

    return (
        <Image
            src={src ?? "/default-avatar.png"}
            alt={name ?? "User avatar"}
            width={size}
            height={size}
            onError={handleError}
        />
    );
}