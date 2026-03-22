import { UserRole } from "@/types/auth";

export type AppModule =
  | "dashboard"
  | "employee"
  | "attendance"
  | "payroll"
  | "reports"
  | "audit"
  | "salary-config"
  | "payslip";

export type AppAction =
  | "read"
  | "create"
  | "update"
  | "delete"
  | "approve"
  | "run"
  | "lock"
  | "unlock"
  | "mark_paid"
  | "view_payslip"
  | "export";

export type PermissionKey = `${AppModule}:${AppAction}`;

export interface PermissionCheckContext {
  role: UserRole;
  permission: PermissionKey;
}
