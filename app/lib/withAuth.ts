import { getToken, JWT } from "next-auth/jwt"
import { NextAuthMiddlewareOptions } from "next-auth/middleware"
import { NextMiddlewareResult } from "next/dist/server/web/types"
import { NextRequest, NextResponse } from "next/server"

export function withAuth(options?: NextAuthMiddlewareOptions) {
    return async function middleware(
        req: NextRequest
    ): Promise<NextMiddlewareResult> {
        return await handleMiddleware(req, options, async (token) => {
            req.nextUrl.searchParams.set("authed", "true")
            return NextResponse.next()
        })
    }
}

export default async function handleMiddleware(
    req: NextRequest,
    options: NextAuthMiddlewareOptions | undefined,
    onSuccess?: (token: JWT | null) => Promise<NextMiddlewareResult>
) {
    const signInPage = "/auth/login"
    const errorPage = "/auth/error"

    const secret = options?.secret ?? process.env.NEXTAUTH_SECRET
    if (!secret) {
        console.error(
            `[next-auth][error][NO_SECRET]`,
            `\nhttps://next-auth.js.org/errors#no_secret`
        )

        const errorUrl = new URL(errorPage, req.nextUrl.origin)
        errorUrl.searchParams.append("error", "Configuration")

        return NextResponse.redirect(errorUrl)
    }

    const token = await getToken({
        req,
        decode: options?.jwt?.decode,
        cookieName: options?.cookies?.sessionToken?.name,
        secret,
    })

    const isAuthorized =
        (await options?.callbacks?.authorized?.({ req, token })) ?? !!token

    if (isAuthorized) return await onSuccess?.(token)

    const signInUrl = new URL(signInPage, req.nextUrl.origin)
    signInUrl.searchParams.append(
        "callbackUrl",
        `${req.nextUrl.pathname}${req.nextUrl.search}`
    )
    return NextResponse.redirect(signInUrl)
}
