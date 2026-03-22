import { AuditEntry } from "@/types/audit";

export const AUDIT_SEED: AuditEntry[] = [
  {
    id: "audit-seed-001",
    action: "PAYROLL_RUN",
    role: "FINANCE_ADMIN",
    message: "Initial payroll run sample event",
    entityId: "run-2026-02-sample",
    timestamp: "2026-03-20T08:30:00.000Z",
  },
  {
    id: "audit-seed-002",
    action: "PAYROLL_LOCK",
    role: "FINANCE_ADMIN",
    message: "Initial payroll lock sample event",
    entityId: "2026-02",
    timestamp: "2026-03-20T08:35:00.000Z",
  },
];
