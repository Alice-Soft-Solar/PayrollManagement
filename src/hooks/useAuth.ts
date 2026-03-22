"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { SESSION_KEY } from "@/lib/constants";
import { authService } from "@/services/auth.service";
import { LoginPayload, UserSession } from "@/types/auth";

const isValidSession = (value: unknown): value is UserSession => {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<UserSession>;
  const user = candidate.user as Partial<UserSession["user"]> | undefined;

  return (
    typeof candidate.token === "string" &&
    typeof candidate.loggedInAt === "string" &&
    !!user &&
    typeof user.id === "string" &&
    typeof user.name === "string" &&
    typeof user.email === "string" &&
    typeof user.role === "string"
  );
};

const readStoredSession = (): UserSession | null => {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = localStorage.getItem(SESSION_KEY);
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!isValidSession(parsed)) {
      localStorage.removeItem(SESSION_KEY);
      return null;
    }

    return parsed;
  } catch {
    localStorage.removeItem(SESSION_KEY);
    return null;
  }
};

export const useAuth = () => {
  const [session, setSession] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState(true);

  const hydrateSession = useCallback(() => {
    setSession(readStoredSession());
  }, []);

  useEffect(() => {
    hydrateSession();
    setLoading(false);

    const handleStorageSync = () => {
      hydrateSession();
    };

    window.addEventListener("storage", handleStorageSync);
    window.addEventListener("bfiaps-auth-changed", handleStorageSync);
    return () => {
      window.removeEventListener("storage", handleStorageSync);
      window.removeEventListener("bfiaps-auth-changed", handleStorageSync);
    };
  }, [hydrateSession]);

  const login = useCallback(async (payload: LoginPayload) => {
    const response = await authService.login(payload);
    authService.persistSession(response);
    setSession(response);
    return response;
  }, []);

  const logout = useCallback(() => {
    authService.clearSession();
    setSession(null);
  }, []);

  return useMemo(
    () => ({
      session,
      user: session?.user ?? null,
      isAuthenticated: Boolean(session),
      loading,
      login,
      logout,
    }),
    [session, loading, login, logout],
  );
};
