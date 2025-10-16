"use client";

import DiscordLoginButton from "@/components/LoginButton";

export default function SignIn() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen gap-4">
            <h1 className="text-2xl font-bold mb-4">Sign in</h1>
            <DiscordLoginButton />
        </div>
    );
}
