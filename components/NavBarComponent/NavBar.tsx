"use client";
import React, { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Image from "next/image";

export default function NavBar() {
  const { loggedIn, user, setAuth, refresh } = useAuth();
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  const handleLogin = useCallback(() => {
    router.push("/auth/login");
  }, [router]);

  const handleAdmin = useCallback(() => {
    router.push("/admin");
  }, [router]);

  const handleLogout = useCallback(async () => {
    if (busy) return;
    try {
      setBusy(true);
      setAuth(null);

      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
      router.replace("/");
      await refresh();
    } catch (e) {
      console.error("Logout error:", e);
      router.replace("/");
    } finally {
      setBusy(false);
    }
  }, [busy, router, setAuth, refresh]);

  const isAdmin = !!user?.roles?.includes("ADMIN");

  return (
    <header className="sticky top-0 z-10 bg-white shadow-md">
      <div className="max-w-full px-4 sm:px-6 py-3 sm:py-4">
        <div className="flex flex-col gap-3 sm:gap-4 md:flex-row md:items-center md:justify-between">
          {/* Left: logo + title */}
          <div className="flex items-center gap-3 min-w-0">
            <Image
              src="/images/logo/logo.png"
              alt="Logo"
              width={80}
              height={80}
              className="h-14 w-14 sm:h-16 sm:w-16 md:h-20 md:w-20 rounded-md flex-shrink-0"
              priority
            />
            <div className="flex items-center gap-2 min-w-0">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-800 truncate">
                UPS Monitoring Dashboard
              </h1>

              {/* แสดง badge Admin เล็ก ๆ */}
              {isAdmin && (
                <span className="ml-1 inline-flex items-center rounded-md bg-gray-900 text-white text-[10px] sm:text-xs px-2 py-0.5 border border-gray-700">
                  ADMIN
                </span>
              )}
            </div>
          </div>

          {/* Right: status + actions */}
          <div className="flex flex-wrap items-center gap-3 sm:gap-4">
            <div className="text-xs sm:text-sm text-gray-600">
              {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </div>

            <div className="flex items-center gap-2">
              <span className="inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-xs sm:text-sm text-green-600 font-semibold">Live</span>
            </div>

            {/* แสดง AdminMenu เฉพาะผู้ใช้ ADMIN และล็อกอินแล้ว */}
            {loggedIn && (
              <button
                onClick={handleAdmin}
                className="ml-auto md:ml-0 flex items-center gap-2 px-4 sm:px-5 py-2 rounded-xl
               bg-gradient-to-r from-emerald-500 to-green-600 text-white
               text-sm sm:text-base font-semibold shadow-md
               hover:from-emerald-600 hover:to-green-700 hover:shadow-lg
               active:scale-95 transition-all duration-200"
                aria-label="Admin"
                title="Admin"
              >
                Admin
              </button>
            )}


            {loggedIn ? (
              <button
                onClick={handleLogout}
                disabled={busy}
                className="ml-auto md:ml-0 flex items-center gap-2 px-4 sm:px-5 py-2 rounded-xl
                           bg-gradient-to-r from-red-500 to-pink-600 text-white
                           text-sm sm:text-base font-semibold shadow-md
                           hover:from-red-600 hover:to-pink-700 hover:shadow-lg
                           active:scale-95 transition-all duration-200
                           disabled:opacity-70 disabled:cursor-not-allowed"
                aria-label="Logout"
                title="Logout"
              >
                {busy ? "Logging out..." : "Logout"}
              </button>
            ) : (
              <button
                onClick={handleLogin}
                className="ml-auto md:ml-0 flex items-center gap-2 px-4 sm:px-5 py-2 rounded-xl
                           bg-gradient-to-r from-blue-500 to-indigo-600 text-white
                           text-sm sm:text-base font-semibold shadow-md
                           hover:from-blue-600 hover:to-indigo-700 hover:shadow-lg
                           active:scale-95 transition-all duration-200"
                aria-label="Login"
                title="Login"
              >
                Login
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
