"use client";

import { useEffect, useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";

import { APP_ROUTES, PUBLIC_ROUTES } from "@/config/routes";
import { useAuth } from "@/hooks/useAuth";
import { useRole } from "@/hooks/useRole";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { Spinner } from "@/components/ui/Spinner";

export const AppShell = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, isAuthenticated, logout } = useAuth();
  const { allowedRoutes, canAccess } = useRole(user?.role);

  const routeKey = useMemo(() => {
    const match = APP_ROUTES.find((route) => pathname.startsWith(route.path));
    return match?.key;
  }, [pathname]);

  useEffect(() => {
    if (loading) {
      return;
    }

    const isPublic = PUBLIC_ROUTES.includes(pathname);

    if (!isAuthenticated && !isPublic) {
      if (pathname !== "/login") {
        router.replace("/login");
      }
      return;
    }

    if (isAuthenticated && pathname === "/login") {
      router.replace("/dashboard");
      return;
    }

    if (isAuthenticated && routeKey && !canAccess(routeKey)) {
      if (pathname !== "/dashboard") {
        router.replace("/dashboard");
      }
    }
  }, [loading, isAuthenticated, pathname, routeKey, canAccess, router]);

  if (loading && pathname !== "/login") {
    return (
      <div className="center-screen">
        <Spinner />
      </div>
    );
  }

  if (pathname === "/login") {
    return <>{children}</>;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="shell">
      <Sidebar routes={allowedRoutes} user={user} onLogout={logout} />
      <div className="shell-main">
        <Header user={user} />
        <main className="content">{children}</main>
      </div>
    </div>
  );
};
