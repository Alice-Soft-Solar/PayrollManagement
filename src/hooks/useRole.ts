"use client";

import { useCallback, useMemo } from "react";

import { hasPermission, hasRouteAccess, RouteKey } from "@/config/roleConfig";
import { APP_ROUTES } from "@/config/routes";
import { UserRole } from "@/types/auth";
import { PermissionKey } from "@/types/permission";

export const useRole = (role?: UserRole) => {
  const allowedRoutes = useMemo(() => {
    if (!role) {
      return [];
    }

    return APP_ROUTES.filter((route) => hasRouteAccess(role, route.key));
  }, [role]);

  const canAccess = useCallback((routeKey: RouteKey) => {
    if (!role) {
      return false;
    }

    return hasRouteAccess(role, routeKey);
  }, [role]);

  const canPerform = useCallback((permission: PermissionKey) => {
    if (!role) {
      return false;
    }

    return hasPermission(role, permission);
  }, [role]);

  return {
    allowedRoutes,
    canAccess,
    canPerform,
  };
};
