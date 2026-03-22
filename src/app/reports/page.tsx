"use client";

import { useEffect, useState } from "react";

import { Card } from "@/components/ui/Card";
import { DataTable } from "@/components/ui/DataTable";
import { Skeleton } from "@/components/ui/Skeleton";
import { reportsService } from "@/services/reports.service";
import { PayrollPeriodType } from "@/types/payroll";
import { formatCurrency } from "@/lib/utils";

export default function ReportsPage() {
  const [periodType, setPeriodType] = useState<PayrollPeriodType>("MONTH");
  const [periodValue, setPeriodValue] = useState("2026-03");
  const [totalPayroll, setTotalPayroll] = useState(0);
  const [totalAttendanceHours, setTotalAttendanceHours] = useState(0);
  const [segmentData, setSegmentData] = useState<Array<{ segment: string; payroll: number }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const [payroll, attendanceHours, segmentWise] = await Promise.all([
        reportsService.getPayrollExpenditure(periodType, periodValue),
        reportsService.getTotalAttendanceHours(periodType, periodValue),
        reportsService.getSegmentPayrollExpenditure(periodType, periodValue),
      ]);
      setTotalPayroll(payroll);
      setTotalAttendanceHours(attendanceHours);
      setSegmentData(segmentWise);
      setLoading(false);
    };

    load();
  }, [periodType, periodValue]);

  if (loading) {
    return <Skeleton height={240} />;
  }

  return (
    <div className="stack-24">
      <Card title="Reports Filters">
        <div className="row-actions">
          <select
            className="input"
            value={periodType}
            onChange={(event) => setPeriodType(event.target.value as PayrollPeriodType)}
            style={{ maxWidth: 180 }}
          >
            <option value="MONTH">Month</option>
            <option value="WEEK">Week</option>
          </select>
          <input
            className="input"
            value={periodValue}
            onChange={(event) => setPeriodValue(event.target.value)}
            placeholder={periodType === "MONTH" ? "YYYY-MM" : "YYYY-W##"}
            style={{ maxWidth: 220 }}
          />
        </div>
      </Card>

      <Card title="Totals">
        <div className="payroll-totals">
          <p>Total Payroll Expenditure: {formatCurrency(totalPayroll)}</p>
          <p>Total Attendance Hours: {totalAttendanceHours.toFixed(2)} hrs</p>
        </div>
      </Card>

      <Card title="Segment-wise Payroll Expenditure">
        <DataTable
          columns={[
            { key: "segment", header: "Segment" },
            {
              key: "payroll",
              header: "Payroll Expenditure",
              render: (value) => formatCurrency(Number(value)),
            },
          ]}
          data={segmentData}
        />
      </Card>
    </div>
  );
}
