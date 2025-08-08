import { NextMiddlewareResult } from "next/dist/server/web/types";
import { NextRequest, NextResponse } from "next/server";
import { NextAuthMiddlewareOptions } from "next-auth/middleware";
import { JWT, getToken } from "next-auth/jwt";

export default async function handleMiddleware(
    req: NextRequest,
    options: NextAuthMiddlewareOptions | undefined,
    onSuccess?: (token: JWT | null) => Promise<NextMiddlewareResult>
) {
    const signInPage = "/auth/login";
    const errorPage = "/auth/error";

    const secret = options?.secret ?? process.env.NEXTAUTH_SECRET;
    if (!secret) {
        console.error(
            `[next-auth][error][NO_SECRET]`,
            `\nhttps://next-auth.js.org/errors#no_secret`
        );

        const errorUrl = new URL(errorPage, req.nextUrl.origin);
        errorUrl.searchParams.append("error", "Configuration");

        return NextResponse.redirect(errorUrl);
    }

    let token: JWT | null = null;
    const authHeader = req.headers.get("authorization");
    console.log("Auth header in middleware:", authHeader);

    // Check for Bearer token in Authorization header
    // or retrieve token from cookies

    if (authHeader && authHeader.startsWith("Bearer ")) {
        const rawToken = authHeader.substring(7);
        token = { token: rawToken } as JWT;
    } else {
        token = await getToken({
            req,
            secret,
            cookieName: "access_token",
        });
    }

    console.log("Middleware token:", token);

    const isAuthorized =
        (await options?.callbacks?.authorized?.({
            req,
            token,
        })) ?? !!token;

    if (isAuthorized) {
        return onSuccess ? await onSuccess(token) : NextResponse.next();
    }

    const signInUrl = new URL(signInPage, req.nextUrl.origin);
    signInUrl.searchParams.append(
        "callbackUrl",
        `${req.nextUrl.pathname}${req.nextUrl.search}`
    );
    return NextResponse.redirect(signInUrl);
}
