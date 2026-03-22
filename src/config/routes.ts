import { RouteKey } from "@/config/roleConfig";

export interface AppRoute {
  key: RouteKey;
  label: string;
  path: string;
}

export const APP_ROUTES: AppRoute[] = [
  { key: "dashboard", label: "Dashboard", path: "/dashboard" },
  { key: "employees", label: "Employees", path: "/employees" },
  { key: "attendance", label: "Attendance", path: "/attendance" },
  { key: "face-mismatch", label: "Face Mismatch", path: "/face-mismatch" },
  { key: "payroll", label: "Payroll", path: "/payroll" },
  { key: "reports", label: "Reports", path: "/reports" },
  { key: "audit", label: "Audit", path: "/audit" },
];

export const PUBLIC_ROUTES = ["/login"];
