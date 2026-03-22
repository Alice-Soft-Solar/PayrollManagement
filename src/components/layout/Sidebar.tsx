"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";
import {
  BarChart3,
  CalendarDays,
  LogOut,
  ScanFace,
  LayoutDashboard,
  Receipt,
  ShieldCheck,
  Users,
} from "lucide-react";

import { AppRoute } from "@/config/routes";
import { AuthUser } from "@/types/auth";

interface SidebarProps {
  routes: AppRoute[];
  user: AuthUser;
  onLogout: () => void;
}

const iconMap: Record<string, ReactNode> = {
  dashboard: <LayoutDashboard size={18} />,
  employees: <Users size={18} />,
  attendance: <CalendarDays size={18} />,
  "face-mismatch": <ScanFace size={18} />,
  payroll: <Receipt size={18} />,
  reports: <BarChart3 size={18} />,
  audit: <ShieldCheck size={18} />,
};

export const Sidebar = ({ routes, user, onLogout }: SidebarProps) => {
  const pathname = usePathname();

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <img src="/alicesoft-logo.png" alt="Alicesoft Logo" className="brand-logo" />
        <div>
          <h1>Alicesoft</h1>
          <p>Payroll Ops</p>
        </div>
      </div>

      <nav className="sidebar-nav">
        {routes.map((route) => (
          <Link
            key={route.key}
            className={pathname === route.path ? "side-link active" : "side-link"}
            href={route.path}
          >
            {iconMap[route.key]}
            <span>{route.label}</span>
          </Link>
        ))}
      </nav>

      <div className="sidebar-footer">
        <p className="sidebar-user">{user.name}</p>
        <button className="side-link side-link-logout" onClick={onLogout}>
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};
