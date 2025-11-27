import { auth } from "@/app/api/auth/config";
import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admins";

export default auth(async (req) => {
    const session = req.auth;

    // Check if user is authenticated
    if (!session?.user) {
        console.log("Middleware: Unauthenticated user, redirecting");
        const url = new URL("/", req.nextUrl.origin);
        url.searchParams.set("auth", "true");
        return NextResponse.redirect(url);
    }

    // Check if trying to access admin routes
    if (req.nextUrl.pathname.startsWith("/admin")) {
        if (!isAdmin(session.user)) {
            console.log("Middleware: Non-admin user attempting to access admin area");
            // Get the referrer or default to home
            const referer = req.headers.get("referer");
            const redirectUrl = referer ? new URL(referer) : new URL("/", req.nextUrl.origin);
            redirectUrl.searchParams.set("error", "unauthorized");
            return NextResponse.redirect(redirectUrl);
        }
    }

    // Allow request to proceed
    return NextResponse.next();
});

export const config = {
    matcher: [
        "/settings",
        "/settings/:path*",
        "/admin",
        "/admin/:path*",
    ],
};