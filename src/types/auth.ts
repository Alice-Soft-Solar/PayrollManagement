export type UserRole = "HR_ADMIN" | "FINANCE_ADMIN" | "SUPER_ADMIN";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface UserSession {
  user: AuthUser;
  token: string;
  loggedInAt: string;
}
