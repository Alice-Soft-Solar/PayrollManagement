import { authService } from "@/services/auth.service";
import { auditService } from "@/services/audit.service";
import { hasPermission } from "@/config/roleConfig";
import { UserRole } from "@/types/auth";
import { AppAction, AppModule, PermissionKey } from "@/types/permission";

export class AuthorizationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuthorizationError";
  }
}

const buildPermission = (module: AppModule, action: AppAction): PermissionKey => {
  return `${module}:${action}`;
};

const resolveRole = async (actorRole?: UserRole): Promise<UserRole | null> => {
  if (actorRole) {
    return actorRole;
  }

  const session = await authService.getSession();
  return session?.user.role ?? null;
};

const deny = (permission: PermissionKey, role: UserRole | "UNKNOWN"): never => {
  auditService.log("AUTHZ_DENIED", role, `Denied ${permission}`);
  throw new AuthorizationError(`Forbidden: ${permission}`);
};

export const permissionService = {
  async can(permission: PermissionKey, actorRole?: UserRole): Promise<boolean> {
    const role = await resolveRole(actorRole);
    if (!role) {
      return false;
    }

    return hasPermission(role, permission);
  },

  async assert(permission: PermissionKey, actorRole?: UserRole): Promise<UserRole> {
    const resolvedRole = await resolveRole(actorRole);
    if (!resolvedRole) {
      deny(permission, "UNKNOWN");
    }

    const role = resolvedRole as UserRole;

    if (!hasPermission(role, permission)) {
      deny(permission, role);
    }

    return role;
  },

  async assertAction(
    module: AppModule,
    action: AppAction,
    actorRole?: UserRole,
  ): Promise<UserRole> {
    const permission = buildPermission(module, action);
    return this.assert(permission, actorRole);
  },
};
