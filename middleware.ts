import { withAuth } from "@/app/lib/withAuth"

export default withAuth({
    secret: process.env.NEXTAUTH_SECRET ?? "test",
    callbacks: {
        authorized: ({ token }) => !!token,
    },
})

export const config = {
    matcher: [
        "/((?!api|_next/static|_next/image|favicon.ico|auth/login|auth/forgot-password).*)",
    ],
}
