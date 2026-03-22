"use client";

import { CheckCircle2, CreditCard, FileText, XCircle } from "lucide-react";

import { DataTable } from "@/components/ui/DataTable";
import { PayrollLine, PayrollLineStatus } from "@/types/payroll";
import { formatCurrency } from "@/lib/utils";

interface PayrollTableProps {
  rows: PayrollLine[];
  canUpdateStatus: boolean;
  canViewPayslip: boolean;
  locked: boolean;
  onViewDetail: (payrollId: string) => void;
  onViewPayslip: (employeeId: string) => void;
  onUpdateStatus: (payrollId: string, status: PayrollLineStatus) => void;
}

export const PayrollTable = ({
  rows,
  canUpdateStatus,
  canViewPayslip,
  locked,
  onViewDetail,
  onViewPayslip,
  onUpdateStatus,
}: PayrollTableProps) => {
  return (
    <DataTable
      columns={[
        { key: "employeeName", header: "Employee" },
        { key: "month", header: "Month" },
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
        { key: "status", header: "Status", align: "center" },
        {
          id: "payroll-status-actions",
          key: "id",
          header: "Status Actions",
          align: "center",
          render: (value, row) =>
            canUpdateStatus ? (
              <div className="row-actions row-actions-center">
                <button
                  className="action-icon-button"
                  onClick={() => onUpdateStatus(String(value), "PAID")}
                  disabled={!locked || row.status === "PAID"}
                  title="Mark Paid"
                  aria-label="Mark Paid"
                >
                  <CheckCircle2 size={15} />
                </button>
                <button
                  className="action-icon-button danger"
                  onClick={() => onUpdateStatus(String(value), "PENDING")}
                  disabled={!locked || row.status === "PENDING"}
                  title="Mark Pending"
                  aria-label="Mark Pending"
                >
                  <XCircle size={15} />
                </button>
              </div>
            ) : (
              <span>-</span>
            ),
        },
        {
          id: "payroll-detail-action",
          key: "id",
          header: "Detail",
          align: "center",
          render: (value) => (
            <button
              className="action-icon-button"
              onClick={() => onViewDetail(String(value))}
              title="View Breakdown"
              aria-label="View Breakdown"
            >
              <FileText size={15} />
            </button>
          ),
        },
        {
          id: "payroll-payslip-action",
          key: "employeeId",
          header: "Payslip",
          align: "center",
          render: (value) => (
            <button
              className="action-icon-button"
              onClick={() => onViewPayslip(String(value))}
              disabled={!canViewPayslip}
              title="View Payslip"
              aria-label="View Payslip"
            >
              <CreditCard size={15} />
            </button>
          ),
        },
      ]}
      data={rows}
    />
  );
};
