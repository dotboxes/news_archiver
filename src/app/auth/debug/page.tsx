'use client';

import { useEffect, useState } from 'react';

export default function AuthDebugPage() {
    const [config, setConfig] = useState<any>(null);

    useEffect(() => {
        // Check if auth client is working
        fetch('/api/auth/session')
            .then(res => res.json())
            .then(data => {
                console.log('Session data:', data);
            })
            .catch(err => {
                console.error('Session error:', err);
            });
    }, []);

    const testDiscordUrl = () => {
        // This is what Better Auth should generate
        const baseUrl = window.location.origin;
        const discordAuthUrl = `${baseUrl}/api/auth/signin/discord`;
        console.log('Discord auth URL:', discordAuthUrl);
        window.location.href = discordAuthUrl;
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="max-w-2xl w-full bg-white rounded-lg shadow-md p-8">
                <h1 className="text-2xl font-bold mb-6">Auth Debug Page</h1>

                <div className="space-y-4">
                    <div>
                        <h2 className="font-semibold mb-2">Environment Check:</h2>
                        <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
                            DISCORD_CLIENT_ID: {process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID ? '✓ Set' : '✗ Not set'}
                        </pre>
                    </div>

                    <div>
                        <h2 className="font-semibold mb-2">Auth Endpoints:</h2>
                        <ul className="list-disc list-inside space-y-2 text-sm">
                            <li>Auth API: <code>/api/auth/[...all]</code></li>
                            <li>Discord OAuth: <code>/api/auth/signin/discord</code></li>
                            <li>Session: <code>/api/auth/session</code></li>
                        </ul>
                    </div>

                    <button
                        onClick={testDiscordUrl}
                        className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700"
                    >
                        Test Direct Discord Redirect
                    </button>

                    <div>
                        <h2 className="font-semibold mb-2 mt-6">Instructions:</h2>
                        <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
                            <li>Check browser console for errors</li>
                            <li>Click the test button above</li>
                            <li>Check Discord Developer Portal redirect URIs</li>
                            <li>Verify DATABASE_URL is set correctly</li>
                        </ol>
                    </div>
                </div>
            </div>
        </div>
    );
}