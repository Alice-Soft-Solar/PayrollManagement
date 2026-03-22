import { attendanceService } from "@/services/attendance.service";
import { payrollService } from "@/services/payroll.service";
import { PayrollPeriodType, PayrollSegment } from "@/types/payroll";

const getIsoWeekKey = (isoDate: string) => {
  const date = new Date(`${isoDate}T00:00:00.000Z`);
  const day = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((date.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  return `${date.getUTCFullYear()}-W${String(weekNo).padStart(2, "0")}`;
};

export const reportsService = {
  async getPayrollExpenditure(periodType: PayrollPeriodType, periodValue: string) {
    const lines = await payrollService.getPayrollByPeriod(periodType, periodValue, "ALL");
    return lines.reduce((sum, line) => sum + line.net, 0);
  },

  async getTotalAttendanceHours(periodType: PayrollPeriodType, periodValue: string) {
    if (periodType === "MONTH") {
      const rows = await attendanceService.getAttendanceByMonth(periodValue);
      return rows.reduce((sum, row) => sum + row.durationMinutes, 0) / 60;
    }

    const rows = await attendanceService.getAllAttendance();
    return (
      rows
        .filter((row) => getIsoWeekKey(row.date) === periodValue)
        .reduce((sum, row) => sum + row.durationMinutes, 0) / 60
    );
  },

  async getSegmentPayrollExpenditure(periodType: PayrollPeriodType, periodValue: string) {
    const [labour, finance] = await Promise.all([
      payrollService.getPayrollByPeriod(periodType, periodValue, "LABOUR"),
      payrollService.getPayrollByPeriod(periodType, periodValue, "FINANCE"),
    ]);

    return [
      {
        segment: "LABOUR",
        payroll: labour.reduce((sum, line) => sum + line.net, 0),
      },
      {
        segment: "FINANCE",
        payroll: finance.reduce((sum, line) => sum + line.net, 0),
      },
    ];
  },
};
