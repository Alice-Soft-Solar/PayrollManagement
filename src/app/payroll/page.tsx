"use client";

import Link from "next/link";
import { useState } from "react";
import { CalendarDays, Lock, PlayCircle, Unlock } from "lucide-react";

import { PayrollConfigPanel } from "@/components/payroll/PayrollConfigPanel";
import { PayrollDetailModal } from "@/components/payroll/PayrollDetailModal";
import { PayrollTable } from "@/components/payroll/PayrollTable";
import { PayslipModal } from "@/components/payroll/PayslipModal";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { DataTable } from "@/components/ui/DataTable";
import { Modal } from "@/components/ui/Modal";
import { Skeleton } from "@/components/ui/Skeleton";
import { useToast } from "@/components/ui/Toast";
import { useAuth } from "@/hooks/useAuth";
import { usePayroll } from "@/hooks/usePayroll";
import { useRole } from "@/hooks/useRole";
import { formatCurrency } from "@/lib/utils";
import { PayrollConfig } from "@/types/payroll";

export default function PayrollPage() {
  const { user } = useAuth();
  const { canPerform } = useRole(user?.role);
  const { showToast } = useToast();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [payslipOpen, setPayslipOpen] = useState(false);
  const {
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
    config,
    payrollLocked,
    selectedDetail,
    selectedPayslip,
    loading,
    actionLoading,
    detailLoading,
    error,
    totals,
    runPayroll,
    loadSelectivePayroll,
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
  } = usePayroll();

  const canRunPayroll = canPerform("payroll:run");
  const canLockPayroll = canPerform("payroll:lock") || canPerform("payroll:unlock");
  const canMarkPayroll = canPerform("payroll:mark_paid");
  const canViewPayslip = canPerform("payslip:view_payslip");
  const canUpdateConfig = canPerform("salary-config:update");
  const hasCurrentRun = Boolean(currentMonthRun);

  const handleRunPayroll = async () => {
    try {
      await runPayroll();
      showToast("Payroll run completed.", "success");
      setConfirmOpen(false);
    } catch {
      showToast("Payroll run failed.", "error");
    }
  };

  const handleOpenDetail = async (payrollId: string) => {
    try {
      await fetchDetail(payrollId);
      setDetailOpen(true);
    } catch {
      showToast("Unable to load payroll detail.", "error");
    }
  };

  const handleOpenPayslip = async (employeeId: string) => {
    try {
      await fetchPayslip(employeeId);
      setPayslipOpen(true);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to load payslip.";
      showToast(message, "error");
    }
  };

  const handleToggleLock = async () => {
    try {
      if (payrollLocked) {
        await unlockPayroll();
        showToast("Payroll unlocked.", "success");
      } else {
        await lockPayroll();
        showToast("Payroll locked.", "success");
      }
    } catch {
      showToast("Unable to change payroll lock state.", "error");
    }
  };

  const handleStatusUpdate = async (
    payrollId: string,
    status: "PAID" | "PENDING",
  ) => {
    try {
      await updatePayrollStatus(payrollId, status);
      showToast(`Payroll marked ${status}.`, "success");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to update payroll status.";
      showToast(message, "error");
    }
  };

  const handleDetailClose = () => {
    setDetailOpen(false);
    clearDetail();
  };

  const handlePayslipClose = () => {
    setPayslipOpen(false);
    clearPayslip();
  };

  const handleConfigUpdate = async (key: keyof PayrollConfig, value: number | boolean) => {
    try {
      await updateConfig({ [key]: value });
      showToast("Payroll config updated.", "success");
    } catch {
      showToast("Unable to update payroll config.", "error");
    }
  };

  const handleLoadSelectivePayroll = async () => {
    try {
      await loadSelectivePayroll();
      showToast("Selective payroll generated.", "success");
    } catch {
      showToast("Unable to generate selective payroll.", "error");
    }
  };

  if (loading) {
    return <Skeleton height={260} />;
  }

  return (
    <div className="stack-24">
      <Card title="Payroll Processing">
        <div className="section-actions">
          <div className="payroll-totals">
            <p>Month: {month}</p>
            <p>Gross: {formatCurrency(totals.gross)}</p>
            <p>Deductions: {formatCurrency(totals.deductions)}</p>
            <p>Net: {formatCurrency(totals.net)}</p>
            <p>Status: {currentMonthRun ? currentMonthRun.status : "NO RUN"}</p>
          </div>
          <div className="row-actions">
            <div className="icon-field" style={{ minWidth: 170 }}>
              <CalendarDays size={16} />
              <input
                className="input"
                type="month"
                value={month}
                onChange={(event) => setMonth(event.target.value)}
              />
            </div>
            <Link href={`/payroll/preview?month=${month}`}>
              <Button variant="secondary">
                <PlayCircle size={16} />
                Preview
              </Button>
            </Link>
            {canLockPayroll ? (
              <Button
                variant={payrollLocked ? "secondary" : "primary"}
                onClick={handleToggleLock}
                disabled={!hasCurrentRun}
                isLoading={actionLoading}
              >
                {payrollLocked ? <Unlock size={16} /> : <Lock size={16} />}
                {payrollLocked ? "Unlock" : "Lock"}
              </Button>
            ) : null}
            <Button
              onClick={() => setConfirmOpen(true)}
              isLoading={actionLoading}
              disabled={hasCurrentRun || !canRunPayroll}
            >
              Run Payroll
            </Button>
          </div>
        </div>

        <div className="filters-row">
          <input
            className="input"
            placeholder="Search employee"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <select
            className="input"
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(event.target.value as "ALL" | "PAID" | "PENDING")
            }
          >
            <option value="ALL">All Status</option>
            <option value="PAID">Paid</option>
            <option value="PENDING">Pending</option>
          </select>
        </div>
      </Card>

      <Card title="Client Requirement Proof - Selective Payroll Generation">
        <div className="filters-row" style={{ gridTemplateColumns: "160px 200px 220px 180px 160px" }}>
          <select
            className="input"
            value={periodType}
            onChange={(event) => setPeriodType(event.target.value as "MONTH" | "WEEK")}
          >
            <option value="MONTH">Monthly</option>
            <option value="WEEK">Weekly</option>
          </select>

          {periodType === "MONTH" ? (
            <input
              className="input"
              type="month"
              value={periodValue}
              onChange={(event) => setPeriodValue(event.target.value)}
            />
          ) : (
            <input
              className="input"
              value={periodValue}
              onChange={(event) => setPeriodValue(event.target.value)}
              placeholder="YYYY-W##"
            />
          )}

          <select
            className="input"
            value={selectedEmployeeId}
            onChange={(event) => setSelectedEmployeeId(event.target.value)}
          >
            <option value="ALL">All Employees</option>
            {employees.map((employee) => (
              <option key={employee.id} value={employee.id}>
                {employee.name}
              </option>
            ))}
          </select>

          <select
            className="input"
            value={selectedSegment}
            onChange={(event) =>
              setSelectedSegment(event.target.value as "ALL" | "LABOUR" | "FINANCE")
            }
          >
            <option value="ALL">All Segments</option>
            <option value="LABOUR">Labour</option>
            <option value="FINANCE">Finance</option>
          </select>

          <Button onClick={handleLoadSelectivePayroll} isLoading={selectiveLoading}>
            Generate
          </Button>
        </div>

        <DataTable
          columns={[
            { key: "employeeName", header: "Employee" },
            { key: "employeeSegment", header: "Segment" },
            { key: "month", header: "Period" },
            {
              key: "gross",
              header: "Gross",
              render: (value) => formatCurrency(Number(value)),
            },
            {
              key: "deductions",
              header: "Deductions",
              render: (value) => formatCurrency(Number(value)),
            },
            {
              key: "net",
              header: "Net",
              render: (value) => formatCurrency(Number(value)),
            },
            {
              id: "selective-total-minutes",
              key: "id",
              header: "Total Minutes",
              render: (_, row) => row.breakdown.totalMinutes,
            },
            {
              id: "selective-pf",
              key: "id",
              header: "PF",
              render: (_, row) => formatCurrency(row.breakdown.pf),
            },
            {
              id: "selective-esi",
              key: "id",
              header: "ESI",
              render: (_, row) => formatCurrency(row.breakdown.esi),
            },
            {
              id: "selective-pt",
              key: "id",
              header: "PT",
              render: (_, row) => formatCurrency(row.breakdown.pt),
            },
            {
              id: "selective-tds",
              key: "id",
              header: "TDS",
              render: (_, row) => formatCurrency(row.breakdown.tds),
            },
            {
              id: "selective-meals",
              key: "id",
              header: "Meals",
              render: (_, row) => formatCurrency(row.breakdown.meals),
            },
            { key: "status", header: "Status" },
          ]}
          data={selectivePayroll}
        />
      </Card>

      {canUpdateConfig && config ? (
        <Card title="Payroll Config Panel">
          <PayrollConfigPanel
            config={config}
            disabled={actionLoading}
            onUpdate={handleConfigUpdate}
          />
        </Card>
      ) : null}

      <Card title="Payroll Runs">
        {payrollRuns.length ? (
          <div className="stack-16">
            {payrollRuns.slice(0, 5).map((run) => (
              <div key={run.id} className="section-actions">
                <p>
                  {run.month} | {run.status} | {run.lineCount} lines
                </p>
                <p>
                  Net: {formatCurrency(run.totals.net)}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="muted">No payroll run found yet for selected months.</p>
        )}
      </Card>

      <Card title="Payroll Records">
        {error ? <p className="alert-error">{error}</p> : null}
        <PayrollTable
          rows={payroll}
          canUpdateStatus={canMarkPayroll}
          canViewPayslip={canViewPayslip}
          locked={Boolean(currentMonthRun && currentMonthRun.status === "LOCKED")}
          onViewDetail={handleOpenDetail}
          onViewPayslip={handleOpenPayslip}
          onUpdateStatus={handleStatusUpdate}
        />
      </Card>

      <Modal
        open={confirmOpen}
        title="Run Payroll"
        onClose={() => setConfirmOpen(false)}
      >
        <div className="stack-16">
          <p>This creates a payroll snapshot for the selected month. Lock it after review.</p>
          <Button onClick={handleRunPayroll} isLoading={actionLoading}>
            Confirm Run
          </Button>
        </div>
      </Modal>

      <PayrollDetailModal
        open={detailOpen}
        loading={detailLoading}
        detail={selectedDetail}
        onClose={handleDetailClose}
      />

      <PayslipModal
        open={payslipOpen}
        loading={detailLoading}
        payslip={selectedPayslip}
        onClose={handlePayslipClose}
      />
    </div>
  );
}
