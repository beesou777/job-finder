"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

export interface User {
  id: string | number;
  email: string;
  name?: string;
  role?: string;
}

export interface Session {
  user: User;
}

interface AuthContextType {
  data: Session | null;
  status: "loading" | "authenticated" | "unauthenticated";
  signIn: (provider?: string, options?: any) => Promise<{ error?: string }>;
  signOut: (options?: { callbackUrl?: string }) => Promise<void>;
  update: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  data: null,
  status: "loading",
  signIn: async () => ({}),
  signOut: async () => {},
  update: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [status, setStatus] = useState<"loading" | "authenticated" | "unauthenticated">("loading");

  const fetchSession = useCallback(async () => {
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (!token) {
        setSession(null);
        setStatus("unauthenticated");
        return;
      }

      const res = await fetch("/api/auth/me", {
        headers: {
          Authorization: "Bearer " + token,
        },
      });

      if (res.ok) {
        const data = await res.json();
        const user = data.user || data.data || data;
        setSession({ user });
        setStatus("authenticated");
      } else {
        localStorage.removeItem("token");
        document.cookie = "token=; path=/; max-age=0; SameSite=Lax";
        setSession(null);
        setStatus("unauthenticated");
      }
    } catch {
      setSession(null);
      setStatus("unauthenticated");
    }
  }, []);

  useEffect(() => {
    fetchSession();
  }, [fetchSession]);

  const signIn = async (_provider?: string, options?: any) => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: options?.email,
          password: options?.password,
        }),
      });

      const data: any = await res.json();
      if (!res.ok || !data.access_token) {
        return { error: data.message || "Invalid email or password" };
      }

      localStorage.setItem("token", data.access_token);
      document.cookie = "token=" + data.access_token + "; path=/; max-age=604800; SameSite=Lax";

      const user = data.user || {
        id: data.sub,
        email: options?.email,
        name: options?.email?.split("@")[0],
      };
      setSession({ user });
      setStatus("authenticated");

      return { error: undefined };
    } catch (err: any) {
      return { error: (err && err.message) || "Failed to sign in" };
    }
  };

  const signOut = async (options?: { callbackUrl?: string }) => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
      document.cookie = "token=; path=/; max-age=0; SameSite=Lax";
    }
    setSession(null);
    setStatus("unauthenticated");
    if (options?.callbackUrl && typeof window !== "undefined") {
      window.location.href = options.callbackUrl;
    }
  };

  return (
    <AuthContext.Provider value={{ data: session, status, signIn, signOut, update: fetchSession }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useSession() {
  const context = useContext(AuthContext);
  return {
    data: context.data,
    status: context.status,
    update: context.update,
  };
}

export async function signIn(_provider?: string, options?: any) {
  try {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: options?.email,
        password: options?.password,
      }),
    });

    const data: any = await res.json();
    console.log("Sign in response data:", data);
    if (!res.ok || !data.accessToken) {
      return { error: data.message || "Invalid email or password" };
    }

    if (typeof window !== "undefined") {
      localStorage.setItem("token", data.accessToken);
      document.cookie = "token=" + data.accessToken + "; path=/; max-age=604800; SameSite=Lax";
    }

    return { error: undefined };
  } catch (err: any) {
    return { error: (err && err.message) || "Network error occurred" };
  }
}

export async function signOut(options?: { callbackUrl?: string }) {
  if (typeof window !== "undefined") {
    localStorage.removeItem("token");
    document.cookie = "token=; path=/; max-age=0; SameSite=Lax";
    if (options?.callbackUrl) {
      window.location.href = options.callbackUrl;
    }
  }
}
