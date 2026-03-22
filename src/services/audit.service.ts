import { AUDIT_SEED } from "@/seeders/audit";
import { AuditAction, AuditEntry } from "@/types/audit";
import { UserRole } from "@/types/auth";

let auditStore: AuditEntry[] = [...AUDIT_SEED];

export const auditService = {
  log(action: AuditAction, role: UserRole | "UNKNOWN", message: string, entityId?: string) {
    const entry: AuditEntry = {
      id: `audit-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      action,
      role,
      message,
      entityId,
      timestamp: new Date().toISOString(),
    };

    auditStore = [entry, ...auditStore].slice(0, 500);
    return entry;
  },

  getRecent(limit = 50) {
    return auditStore.slice(0, limit);
  },

  async getRecentAsync(limit = 50): Promise<AuditEntry[]> {
    return auditStore.slice(0, limit);
  },
};
