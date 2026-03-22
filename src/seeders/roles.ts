import { AuthUser } from "@/types/auth";

export interface MockUserCredential extends AuthUser {
  password: string;
}

export const MOCK_USERS: MockUserCredential[] = [
  {
    id: "u-1",
    name: "Helen Carter",
    email: "hr.admin@bfiaps.com",
    password: "Password123",
    role: "HR_ADMIN",
  },
  {
    id: "u-2",
    name: "Frank Gomez",
    email: "finance.admin@bfiaps.com",
    password: "Password123",
    role: "FINANCE_ADMIN",
  },
  {
    id: "u-3",
    name: "Sandra Blake",
    email: "super.admin@bfiaps.com",
    password: "Password123",
    role: "SUPER_ADMIN",
  },
];
