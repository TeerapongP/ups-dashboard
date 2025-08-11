import { NextRequest, NextResponse } from "next/server";
import * as jose from "jose";
import { NextMiddlewareResult } from "next/dist/server/web/types";

export default async function handleMiddleware(
    req: NextRequest,
    options: any,
    onSuccess?: (token: any) => Promise<NextMiddlewareResult>
) {
    const signInPage = "/auth/login";
    const errorPage = "/auth/error";

    const secret = options?.secret ?? process.env.NEXT_PUBLIC_SECRET_KEY;
    if (!secret) {
        const errorUrl = new URL(errorPage, req.url);
        errorUrl.searchParams.append("error", "Configuration");
        return NextResponse.redirect(errorUrl);
    }

    let token = null;
    const rawToken = req.cookies.get("access_token")?.value;

    if (rawToken) {
        try {
            const { payload } = await jose.jwtVerify(
                rawToken,
                new TextEncoder().encode(secret)
            );
            token = payload;
            console.log("Verified token:", token);
        } catch (err) {
            console.error("JWT verify error:", err);
        }
    }

    if (token) {
        return onSuccess ? await onSuccess(token) : NextResponse.next();
    }

    console.log("Unauthorized access, redirecting to sign-in page");
    const signInUrl = new URL(signInPage, req.url);
    signInUrl.searchParams.append(
        "callbackUrl",
        `${req.nextUrl.pathname}${req.nextUrl.search}`
    );
    return NextResponse.redirect(signInUrl);
}
