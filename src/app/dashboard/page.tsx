"use client";

import dynamic from "next/dynamic";
import { Users, UserCheck, Wallet, UtensilsCrossed } from "lucide-react";

import { Card } from "@/components/ui/Card";
import { DataTable } from "@/components/ui/DataTable";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { formatCurrency } from "@/lib/utils";
import { useDashboard } from "@/hooks/useDashboard";

const AttendanceChart = dynamic(
  () => import("@/components/charts/AttendanceChart").then((mod) => mod.AttendanceChart),
  { ssr: false },
);

const PayrollChart = dynamic(
  () => import("@/components/charts/PayrollChart").then((mod) => mod.PayrollChart),
  { ssr: false },
);

const statItems = [
  { key: "totalEmployees", label: "Total Employees", icon: <Users size={18} /> },
  { key: "presentToday", label: "Present Today", icon: <UserCheck size={18} /> },
  { key: "totalPayroll", label: "Total Payroll", icon: <Wallet size={18} /> },
  { key: "mealsCount", label: "Meals Count", icon: <UtensilsCrossed size={18} /> },
] as const;

export default function DashboardPage() {
  const {
    totalEmployees,
    presentToday,
    totalPayroll,
    mealsCount,
    attendanceTrend,
    payrollDistribution,
    recentAttendance,
    recentPayroll,
    loading,
    error,
  } = useDashboard();

  if (loading) {
    return (
      <div className="stack-16">
        <Skeleton height={120} />
        <Skeleton height={280} />
        <Skeleton height={280} />
      </div>
    );
  }

  if (error) {
    return <p className="alert-error">{error}</p>;
  }

  if (!recentAttendance.length && !recentPayroll.length) {
    return (
      <EmptyState
        title="No dashboard data"
        description="Mock data is currently unavailable."
      />
    );
  }

  const statValues = {
    totalEmployees,
    presentToday,
    totalPayroll: formatCurrency(totalPayroll),
    mealsCount,
  };

  return (
    <div className="stack-24">
      <Card>
        <div className="dashboard-brand">
          <img src="/alicesoft-logo.png" alt="Alicesoft Logo" className="dashboard-brand-logo" />
          <div>
            <h2>Alicesoft Dashboard</h2>
            <p className="muted">Attendance, payroll, and reporting overview</p>
          </div>
        </div>
      </Card>

      <section className="stats-grid">
        {statItems.map((item) => (
          <Card key={item.key}>
            <div className="stat-row">
              <span>{item.icon}</span>
              <div>
                <p className="muted">{item.label}</p>
                <h3>{String(statValues[item.key])}</h3>
              </div>
            </div>
          </Card>
        ))}
      </section>

      <section className="grid-2">
        <Card title="Attendance Trend">
          <AttendanceChart data={attendanceTrend} />
        </Card>
        <Card title="Payroll Distribution">
          <PayrollChart data={payrollDistribution} />
        </Card>
      </section>

      <section className="grid-2">
        <Card title="Recent Attendance">
          <DataTable
            columns={[
              { key: "employeeName", header: "Employee" },
              { key: "date", header: "Date" },
              { key: "status", header: "Status" },
              { key: "shift", header: "Shift" },
            ]}
            data={recentAttendance}
            pageSize={4}
          />
        </Card>
        <Card title="Recent Payroll">
          <DataTable
            columns={[
              { key: "employeeName", header: "Employee" },
              { key: "month", header: "Month" },
              {
                key: "net",
                header: "Net",
                render: (value) => formatCurrency(Number(value)),
              },
              { key: "status", header: "Status" },
            ]}
            data={recentPayroll}
            pageSize={4}
          />
        </Card>
      </section>
    </div>
  );
}
