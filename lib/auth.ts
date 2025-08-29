import { NextRequest, NextResponse } from "next/server";
import type { NextMiddlewareResult } from "next/dist/server/web/types";
import * as jose from "jose";
import { MiddlewareOptions } from "@/types/middlewareOptions";

// ใช้ JWTPayload ของ jose (type-safe)
type JwtPayload = jose.JWTPayload & Record<string, unknown>;

export default async function handleMiddleware(
  req: NextRequest,
  options: MiddlewareOptions,
  onSuccess?: (token: JwtPayload) => Promise<NextMiddlewareResult>
): Promise<NextMiddlewareResult> {
  const signInPage = "/auth/login";
  const errorPage = "/auth/error";

  // อย่าใช้ NEXT_PUBLIC_* สำหรับ secret ฝั่ง server
  const secret = options?.secret ?? process.env.JWT_SECRET;
  if (!secret) {
    const errorUrl = new URL(errorPage, req.url);
    errorUrl.searchParams.set("error", "Configuration");
    return NextResponse.redirect(errorUrl);
  }

  const rawToken = req.cookies.get("access_token")?.value;
  let token: JwtPayload | null = null;

  if (rawToken) {
    try {
      // กัน clock skew 5 วินาที
      const { payload } = await jose.jwtVerify(
        rawToken,
        new TextEncoder().encode(secret),
        { clockTolerance: 5 }
      );
      token = payload as JwtPayload;
      // (ถ้าจะ log ให้เหลือเฉพาะตอน dev)
      if (process.env.NODE_ENV !== "production") {
        console.log("Verified token sub:", token.sub);
      }
    } catch (err: unknown) {
      if (err instanceof jose.errors.JWTExpired) {
        // token หมดอายุ
        const signInUrl = new URL(signInPage, req.url);
        signInUrl.searchParams.set(
          "callbackUrl",
          `${req.nextUrl.pathname}${req.nextUrl.search}`
        );
        signInUrl.searchParams.set("error", "SessionExpired");
        return NextResponse.redirect(signInUrl);
      }
      if (err instanceof jose.errors.JOSEError) {
        
        // โครงสร้าง/ลายเซ็น/secret ผิด ฯลฯ
        if (process.env.NODE_ENV !== "production") {
          console.error("JWT verification failed:", err.message);
        }
      } else {
        // error อื่น ๆ
        if (process.env.NODE_ENV !== "production") {
          console.error("Unexpected JWT error:", err);
        }
      }
    }
  }

  if (token) {
    return onSuccess ? await onSuccess(token) : NextResponse.next();
  }

  // ไม่มี token หรือ verify ไม่ผ่าน → ไปหน้า login
  const signInUrl = new URL(signInPage, req.url);
  signInUrl.searchParams.set(
    "callbackUrl",
    `${req.nextUrl.pathname}${req.nextUrl.search}`
  );
  return NextResponse.redirect(signInUrl);
}
