import { NextRequest } from 'next/server'

export function checkJwt(req: NextRequest) {
    const token = req.cookies.get("next-auth.session-token")
    return !!token
}
