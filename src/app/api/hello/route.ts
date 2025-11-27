import { NextResponse } from 'next/server';

export async function GET() {
    return NextResponse.json({
        message: 'Auth API is accessible',
        discordClientId: process.env.DISCORD_CLIENT_ID ? 'Set' : 'Not set',
        discordSecret: process.env.DISCORD_CLIENT_SECRET ? 'Set' : 'Not set',
        databaseUrl: process.env.DATABASE_URL ? 'Set' : 'Not set',
    });
}