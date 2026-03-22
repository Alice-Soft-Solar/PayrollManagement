"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { useAuth } from "@/hooks/useAuth";
import { employeeService } from "@/services/employee.service";
import { payrollService } from "@/services/payroll.service";
import { Employee } from "@/types/employee";
import {
  PayrollConfig,
  PayrollDetail,
  PayrollLine,
  PayrollLineStatus,
  PayrollPeriodType,
  PayrollPreview,
  PayrollRun,
  PayrollSegment,
  PayslipData,
} from "@/types/payroll";

export const usePayroll = () => {
  const { user } = useAuth();
  const [month, setMonth] = useState("2026-03");
  const [statusFilter, setStatusFilter] = useState<"ALL" | PayrollLineStatus>("ALL");
  const [search, setSearch] = useState("");
  const [payroll, setPayroll] = useState<PayrollLine[]>([]);
  const [payrollRuns, setPayrollRuns] = useState<PayrollRun[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [periodType, setPeriodType] = useState<PayrollPeriodType>("MONTH");
  const [periodValue, setPeriodValue] = useState("2026-03");
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("ALL");
  const [selectedSegment, setSelectedSegment] = useState<PayrollSegment>("ALL");
  const [selectivePayroll, setSelectivePayroll] = useState<PayrollLine[]>([]);
  const [selectiveLoading, setSelectiveLoading] = useState(false);
  const [preview, setPreview] = useState<PayrollPreview | null>(null);
  const [config, setConfig] = useState<PayrollConfig | null>(null);
  const [payrollLocked, setPayrollLocked] = useState(false);
  const [selectedDetail, setSelectedDetail] = useState<PayrollDetail | null>(null);
  const [selectedPayslip, setSelectedPayslip] = useState<PayslipData | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPayroll = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [data, runs, currentConfig, lockState] = await Promise.all([
        payrollService.getPayroll(month, statusFilter, search),
        payrollService.getPayrollRuns(),
        payrollService.getPayrollConfig(),
        payrollService.getPayrollLockedState(month),
      ]);
      setPayroll(data);
      setPayrollRuns(runs);
      setConfig(currentConfig);
      setPayrollLocked(lockState);
    } catch {
      setError("Failed to fetch payroll.");
    } finally {
      setLoading(false);
    }
  }, [month, statusFilter, search]);

  useEffect(() => {
    fetchPayroll();
  }, [fetchPayroll]);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const data = await employeeService.getActiveEmployees();
        setEmployees(data);
      } catch {
        setEmployees([]);
      }
    };

    fetchEmployees();
  }, []);

  const loadSelectivePayroll = useCallback(async () => {
    setSelectiveLoading(true);
    setError(null);

    try {
      if (selectedEmployeeId === "ALL") {
        const lines = await payrollService.getPayrollByPeriod(
          periodType,
          periodValue,
          selectedSegment,
        );
        setSelectivePayroll(lines);
        return lines;
      }

      const line = await payrollService.getPayrollForEmployeePeriod(
        selectedEmployeeId,
        periodType,
        periodValue,
      );

      const filtered = line
        ? selectedSegment === "ALL" || line.employeeSegment === selectedSegment
          ? [line]
          : []
        : [];

      setSelectivePayroll(filtered);
      return filtered;
    } catch {
      setError("Unable to load selective payroll.");
      throw new Error("Unable to load selective payroll.");
    } finally {
      setSelectiveLoading(false);
    }
  }, [periodType, periodValue, selectedEmployeeId, selectedSegment]);

  const generatePreview = useCallback(async () => {
    setActionLoading(true);
    setError(null);
    try {
      const data = await payrollService.generatePayrollPreview(month);
      setPreview(data);
      return data;
    } catch {
      setError("Unable to generate payroll preview.");
      throw new Error("Unable to generate payroll preview.");
    } finally {
      setActionLoading(false);
    }
  }, [month]);

  const runPayroll = useCallback(async () => {
    setActionLoading(true);
    setError(null);

    try {
      const run = await payrollService.runPayroll(month, user?.role);
      setPreview(null);
      await fetchPayroll();
      return run;
    } catch {
      setError("Unable to run payroll.");
      throw new Error("Unable to run payroll.");
    } finally {
      setActionLoading(false);
    }
  }, [month, fetchPayroll, user?.role]);

  const lockPayroll = useCallback(async () => {
    setActionLoading(true);
    setError(null);
    try {
      const locked = await payrollService.lockPayroll(month, user?.role);
      setPayrollLocked(locked);
      await fetchPayroll();
      return locked;
    } catch {
      setError("Unable to lock payroll.");
      throw new Error("Unable to lock payroll.");
    } finally {
      setActionLoading(false);
    }
  }, [month, user?.role, fetchPayroll]);

  const unlockPayroll = useCallback(async () => {
    setActionLoading(true);
    setError(null);
    try {
      const locked = await payrollService.unlockPayroll(month, user?.role);
      setPayrollLocked(locked);
      await fetchPayroll();
      return locked;
    } catch {
      setError("Unable to unlock payroll.");
      throw new Error("Unable to unlock payroll.");
    } finally {
      setActionLoading(false);
    }
  }, [month, user?.role, fetchPayroll]);

  const updatePayrollStatus = useCallback(
    async (payrollId: string, status: PayrollLineStatus) => {
      setActionLoading(true);
      setError(null);
      try {
        await payrollService.updatePayrollStatus(payrollId, status, month, user?.role);
        await fetchPayroll();
        return true;
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unable to update payroll status.";
        setError(message);
        throw error instanceof Error ? error : new Error(message);
      } finally {
        setActionLoading(false);
      }
    },
    [month, fetchPayroll, user?.role],
  );

  const updateConfig = useCallback(async (partial: Partial<PayrollConfig>) => {
    setActionLoading(true);
    setError(null);

    try {
      const updatedConfig = await payrollService.updatePayrollConfig(partial, user?.role);
      setConfig(updatedConfig);
      await fetchPayroll();
      return updatedConfig;
    } catch {
      setError("Unable to update payroll config.");
      throw new Error("Unable to update payroll config.");
    } finally {
      setActionLoading(false);
    }
  }, [fetchPayroll, user?.role]);

  const fetchDetail = useCallback(async (payrollId: string) => {
    setDetailLoading(true);
    setError(null);

    try {
      const detail = await payrollService.getPayrollDetail(payrollId);
      setSelectedDetail(detail);
      return detail;
    } catch {
      setError("Unable to fetch payroll detail.");
      throw new Error("Unable to fetch payroll detail.");
    } finally {
      setDetailLoading(false);
    }
  }, []);

  const fetchPayslip = useCallback(async (employeeId: string) => {
    setDetailLoading(true);
    setError(null);
    try {
      const data = await payrollService.getPayslipByEmployee(employeeId, month, user?.role);
      setSelectedPayslip(data);
      return data;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to fetch payslip data.";
      setError(message);
      throw error instanceof Error ? error : new Error(message);
    } finally {
      setDetailLoading(false);
    }
  }, [month, user?.role]);

  const clearDetail = useCallback(() => {
    setSelectedDetail(null);
  }, []);

  const clearPayslip = useCallback(() => {
    setSelectedPayslip(null);
  }, []);

  const totals = useMemo(() => {
    return payroll.reduce(
      (acc, row) => {
        acc.gross += row.gross;
        acc.deductions += row.deductions;
        acc.net += row.net;
        return acc;
      },
      { gross: 0, deductions: 0, net: 0 },
    );
  }, [payroll]);

  const currentMonthRun = useMemo(() => {
    return payrollRuns.find((run) => run.month === month) ?? null;
  }, [payrollRuns, month]);

  return {
    payroll,
    month,
    statusFilter,
    search,
    payrollRuns,
    employees,
    periodType,
    periodValue,
    selectedEmployeeId,
    selectedSegment,
    selectivePayroll,
    selectiveLoading,
    currentMonthRun,
    preview,
    config,
    payrollLocked,
    selectedDetail,
    selectedPayslip,
    loading,
    actionLoading,
    detailLoading,
    error,
    totals,
    fetchPayroll,
    loadSelectivePayroll,
    generatePreview,
    runPayroll,
    lockPayroll,
    unlockPayroll,
    updatePayrollStatus,
    updateConfig,
    fetchDetail,
    fetchPayslip,
    clearDetail,
    clearPayslip,
    setMonth,
    setStatusFilter,
    setSearch,
    setPeriodType,
    setPeriodValue,
    setSelectedEmployeeId,
    setSelectedSegment,
  };
};
