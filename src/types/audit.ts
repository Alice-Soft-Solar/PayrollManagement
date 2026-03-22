import { UserRole } from "@/types/auth";

export type AuditAction =
  | "AUTHZ_DENIED"
  | "ATTENDANCE_VALIDATION_FAILED"
  | "PAYROLL_RUN"
  | "PAYROLL_LOCK"
  | "PAYROLL_UNLOCK"
  | "PAYROLL_STATUS_UPDATE"
  | "PAYROLL_CONFIG_UPDATE"
  | "SYSTEM_CONFIG_UPDATE"
  | "EMPLOYEE_CREATE"
  | "EMPLOYEE_UPDATE"
  | "EMPLOYEE_STATUS_UPDATE"
  | "EMPLOYEE_DELETE";

export interface AuditEntry {
  id: string;
  action: AuditAction;
  role: UserRole | "UNKNOWN";
  message: string;
  entityId?: string;
  timestamp: string;
}
