"use client";

import { useCallback, useEffect, useState } from "react";

import { attendanceService } from "@/services/attendance.service";
import { employeeService } from "@/services/employee.service";
import { payrollService } from "@/services/payroll.service";
import { AttendanceRecord, AttendanceTrendPoint } from "@/types/attendance";
import { PayrollDistribution, PayrollRecord } from "@/types/payroll";

interface DashboardState {
  totalEmployees: number;
  presentToday: number;
  totalPayroll: number;
  mealsCount: number;
  attendanceTrend: AttendanceTrendPoint[];
  payrollDistribution: PayrollDistribution[];
  recentAttendance: AttendanceRecord[];
  recentPayroll: PayrollRecord[];
}

const initialState: DashboardState = {
  totalEmployees: 0,
  presentToday: 0,
  totalPayroll: 0,
  mealsCount: 0,
  attendanceTrend: [],
  payrollDistribution: [],
  recentAttendance: [],
  recentPayroll: [],
};

export const useDashboard = () => {
  const [state, setState] = useState<DashboardState>(initialState);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [employees, presentToday, totalPayroll, mealsCount, trend, dist, att, pay] =
        await Promise.all([
          employeeService.getEmployees(),
          attendanceService.getPresentCountToday(),
          payrollService.getTotalPayroll(),
          attendanceService.getMealsCountToday(),
          attendanceService.getAttendanceTrend(),
          payrollService.getPayrollDistribution(),
          attendanceService.getRecentAttendance(),
          payrollService.getRecentPayroll(),
        ]);

      setState({
        totalEmployees: employees.length,
        presentToday,
        totalPayroll,
        mealsCount,
        attendanceTrend: trend,
        payrollDistribution: dist,
        recentAttendance: att,
        recentPayroll: pay,
      });
    } catch {
      setError("Failed to load dashboard data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  return { ...state, loading, error, fetchDashboard };
};
