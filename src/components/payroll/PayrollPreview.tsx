"use client";

import { PayrollPreview as PayrollPreviewType } from "@/types/payroll";
import { formatCurrency } from "@/lib/utils";
import { DataTable } from "@/components/ui/DataTable";

interface PayrollPreviewProps {
  preview: PayrollPreviewType;
}

export const PayrollPreview = ({ preview }: PayrollPreviewProps) => {
  return (
    <div className="stack-16">
      <div className="payroll-totals">
        <p>Month: {preview.month}</p>
        <p>Status: {preview.locked ? "LOCKED" : "OPEN"}</p>
        <p>Gross: {formatCurrency(preview.totals.gross)}</p>
        <p>Deductions: {formatCurrency(preview.totals.deductions)}</p>
        <p>Net: {formatCurrency(preview.totals.net)}</p>
      </div>

      <DataTable
        columns={[
          { key: "employeeName", header: "Employee" },
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
          { key: "status", header: "Status" },
        ]}
        data={preview.lines}
      />
    </div>
  );
};
