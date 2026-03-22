"use client";

import { Modal } from "@/components/ui/Modal";
import { Skeleton } from "@/components/ui/Skeleton";
import { PayrollDetail } from "@/types/payroll";
import { formatCurrency } from "@/lib/utils";

interface PayrollDetailModalProps {
  open: boolean;
  loading: boolean;
  detail: PayrollDetail | null;
  onClose: () => void;
}

export const PayrollDetailModal = ({
  open,
  loading,
  detail,
  onClose,
}: PayrollDetailModalProps) => {
  return (
    <Modal open={open} title="Payroll Breakdown" onClose={onClose}>
      {loading ? (
        <Skeleton height={220} />
      ) : detail ? (
        <div className="stack-16">
          <p>
            <strong>Employee:</strong> {detail.employeeName}
          </p>
          <div className="detail-grid">
            <p>Total Minutes: {detail.totalMinutes}</p>
            <p>Total Hours: {detail.totalHours}</p>
            <p>Present Days: {detail.presentDays}</p>
            <p>Salary Model: {detail.salaryModel}</p>
            <p>Base Salary: {formatCurrency(detail.baseSalary)}</p>
            <p>Hourly Rate: {formatCurrency(detail.hourlyRate)}</p>
            <p>Salary: {formatCurrency(detail.salary)}</p>
            <p>Overtime Hours: {detail.overtimeHours}</p>
            <p>Overtime Pay: {formatCurrency(detail.overtimePay)}</p>
            <p>Allowances: {formatCurrency(detail.allowances)}</p>
            <p>Bonus: {formatCurrency(detail.bonus)}</p>
            <p>PF: {formatCurrency(detail.pf)}</p>
            <p>ESI: {formatCurrency(detail.esi)}</p>
            <p>PT: {formatCurrency(detail.pt)}</p>
            <p>TDS: {formatCurrency(detail.tds)}</p>
            <p>Meals Consumed: {detail.mealsConsumed}</p>
            <p>Meal Subsidy Value: {formatCurrency(detail.mealSubsidyValue)}</p>
            <p>Meals: {formatCurrency(detail.meals)}</p>
          </div>
          <div className="payroll-totals">
            <p>Gross: {formatCurrency(detail.gross)}</p>
            <p>Deductions: {formatCurrency(detail.deductions)}</p>
            <p>Net: {formatCurrency(detail.net)}</p>
          </div>
        </div>
      ) : (
        <p>No payroll detail found.</p>
      )}
    </Modal>
  );
};
