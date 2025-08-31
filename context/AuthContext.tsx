// context/AuthContext.tsx
"use client";
import { createContext, useContext, useState, useCallback } from "react";

type AuthState = { user: any | null; loggedIn: boolean };
type AuthCtxType = AuthState & {
  setAuth: (user: any | null) => void;   // 👈 ตั้งค่าเองได้
  refresh: () => Promise<void>;          // 👈 ให้กด refresh manual ได้
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
      const r = await fetch("/api/auth/me", { credentials: "include" });
      if (!r.ok) {
        setState({ user: null, loggedIn: false });
        return;
      }
      const data = await r.json();
      setState({ user: data?.user ?? null, loggedIn: !!data?.user });
    } catch {
      setState({ user: null, loggedIn: false });
    }
  }, []);

  return (
    <AuthCtx.Provider value={{ ...state, setAuth, refresh }}>
      {children}
    </AuthCtx.Provider>
  );
}

export const useAuth = () => useContext(AuthCtx);
