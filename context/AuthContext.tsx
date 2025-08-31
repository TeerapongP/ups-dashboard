// context/AuthContext.tsx
"use client";
import { createContext, useContext, useEffect, useState, useCallback } from "react";

type AuthState = { user: any | null; loggedIn: boolean };
type AuthCtxType = AuthState & {
  setAuth: (user: any | null) => void;   // 👈 อัปเดตทันที
  refresh: () => Promise<void>;          // 👈 รีเฟรชจากเซิร์ฟเวอร์
};

const AuthCtx = createContext<AuthCtxType>({
  user: null,
  loggedIn: false,
  setAuth: () => {},
  refresh: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({ user: null, loggedIn: false });

  const setAuth = useCallback((user: any | null) => {
    setState({ user, loggedIn: !!user });
  }, []);

  const refresh = useCallback(async () => {
    try {
      const r = await fetch("/api/auth/me", { credentials: "include", cache: "no-store" });
      const data = r.ok ? await r.json() : null;
      setState({ user: data?.user ?? null, loggedIn: !!data?.user });
    } catch {
      setState({ user: null, loggedIn: false });
    }
  }, []);

  useEffect(() => {
    refresh();
    // อัปเดตเมื่อโฟกัสกลับหน้า (ช่วยให้ทันใจหลัง redirect)
    const onFocus = () => refresh();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [refresh]);

  return (
    <AuthCtx.Provider value={{ ...state, setAuth, refresh }}>
      {children}
    </AuthCtx.Provider>
  );
}

export const useAuth = () => useContext(AuthCtx);
