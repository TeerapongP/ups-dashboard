import handleMiddleware from "@/lib/auth"; // path ตามจริงของคุณ
import { NextAuthMiddlewareOptions } from "next-auth/middleware";
import { NextRequest } from "next/server";

export default async function middleware(req: NextRequest) {
    const options: NextAuthMiddlewareOptions = {
        secret: process.env.NEXTAUTH_SECRET,
        callbacks: {
            authorized: ({ token }) => {
                return !!token;
            },
        },
    };

    return await handleMiddleware(req, options);
}

export const config = {
    matcher: [
        "/((?!api|_next/static|_next/image|favicon.ico|auth/login|auth/forgot-password).*)",
    ],
};
