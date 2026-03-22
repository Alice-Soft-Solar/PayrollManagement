import { UserRole } from "@/types/auth";
import { PermissionKey } from "@/types/permission";

export type RouteKey =
  | "dashboard"
  | "employees"
  | "attendance"
  | "face-mismatch"
  | "payroll"
  | "reports"
  | "audit";

export const ROLE_CONFIG: Record<UserRole, readonly (RouteKey | "*")[]> = {
  HR_ADMIN: ["dashboard", "employees", "attendance", "face-mismatch"],
  FINANCE_ADMIN: ["dashboard", "payroll", "reports"],
  SUPER_ADMIN: ["*"],
};

export const ROLE_PERMISSIONS: Record<UserRole, readonly (PermissionKey | "*")[]> = {
  HR_ADMIN: [
    "dashboard:read",
    "employee:read",
    "employee:create",
    "employee:update",
    "employee:delete",
    "attendance:read",
    "attendance:approve",
    "reports:read",
  ],
  FINANCE_ADMIN: [
    "dashboard:read",
    "employee:read",
    "attendance:read",
    "payroll:read",
    "payroll:run",
    "payroll:lock",
    "payroll:unlock",
    "payroll:mark_paid",
    "payslip:view_payslip",
    "reports:read",
    "reports:export",
    "salary-config:update",
  ],
  SUPER_ADMIN: ["*"],
};

export const hasRouteAccess = (role: UserRole, routeKey: RouteKey): boolean => {
  const accessList = ROLE_CONFIG[role];
  return accessList.includes("*") || accessList.includes(routeKey);
};

export const hasPermission = (role: UserRole, permission: PermissionKey): boolean => {
  const permissions = ROLE_PERMISSIONS[role];
  return permissions.includes("*") || permissions.includes(permission);
};
