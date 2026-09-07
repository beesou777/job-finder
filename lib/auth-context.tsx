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

export function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

export function getAuthHeaders(customHeaders?: HeadersInit): HeadersInit {
  const token = getAuthToken();
  const headers = new Headers(customHeaders || {});
  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  return headers;
}

export async function authFetch(url: string, init: RequestInit = {}): Promise<Response> {
  const token = getAuthToken();
  const headers = new Headers(init.headers || {});
  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  return fetch(url, {
    ...init,
    headers,
  });
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [status, setStatus] = useState<"loading" | "authenticated" | "unauthenticated">("loading");

  const fetchSession = useCallback(async () => {
  const fetchSession = useCallback(async (explicitToken?: string) => {
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const token =
        explicitToken || (typeof window !== "undefined" ? localStorage.getItem("token") : null);
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

    const handleAuthChange = (e?: Event) => {
      const custom = e as CustomEvent;
      if (custom?.detail?.token && custom?.detail?.user) {
        setSession({ user: custom.detail.user });
        setStatus("authenticated");
      } else {
        fetchSession();
      }
    };

    window.addEventListener("auth-state-change", handleAuthChange);
    window.addEventListener("storage", handleAuthChange);
    return () => {
      window.removeEventListener("auth-state-change", handleAuthChange);
      window.removeEventListener("storage", handleAuthChange);
    };
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
      const token = data.accessToken || data.access_token || data.token;
      if (!res.ok || !token) {
        return { error: data.message || "Invalid email or password" };
      }

      localStorage.setItem("token", data.access_token);
      document.cookie = "token=" + data.access_token + "; path=/; max-age=604800; SameSite=Lax";
      localStorage.setItem("token", token);
      document.cookie = "token=" + token + "; path=/; max-age=604800; SameSite=Lax";

      const user = data.user || {
        id: data.sub,
        id: data.sub || data.id,
        email: options?.email,
        name: options?.email?.split("@")[0],
        name: data.name || options?.email?.split("@")[0],
      };

      // Immediately update local React state synchronously
      setSession({ user });
      setStatus("authenticated");

      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("auth-state-change", {
            detail: { token, user },
          }),
        );
      }

      // Verify in background
      fetchSession(token);

      return { error: undefined };
    } catch (err: any) {
      return { error: (err && err.message) || "Failed to sign in" };
    }
  };

  const signOut = async (options?: { callbackUrl?: string }) => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
      document.cookie = "token=; path=/; max-age=0; SameSite=Lax";
      window.dispatchEvent(new CustomEvent("auth-state-change"));
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
    session: context.data,
    status: context.status,
    signIn: context.signIn,
    signOut: context.signOut,
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
    if (!res.ok || !data.accessToken) {
    const token = data.accessToken || data.access_token || data.token;
    if (!res.ok || !token) {
      return { error: data.message || "Invalid email or password" };
    }

    if (typeof window !== "undefined") {
      localStorage.setItem("token", data.accessToken);
      document.cookie = "token=" + data.accessToken + "; path=/; max-age=604800; SameSite=Lax";
      localStorage.setItem("token", token);
      document.cookie = "token=" + token + "; path=/; max-age=604800; SameSite=Lax";
      window.dispatchEvent(
        new CustomEvent("auth-state-change", {
          detail: { token, user: data.user },
        }),
      );
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
    window.dispatchEvent(new CustomEvent("auth-state-change"));
    if (options?.callbackUrl) {
      window.location.href = options.callbackUrl;
    }
  }
}
