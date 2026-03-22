import { randomDelay, sleep } from "@/lib/utils";
import { attendanceValidationService } from "@/services/attendanceValidation.service";
import { auditService } from "@/services/audit.service";
import { employeeService } from "@/services/employee.service";
import { mealService } from "@/services/meal.service";
import { ATTENDANCE_SEED, ATTENDANCE_TREND_SEED } from "@/seeders/attendance";
import { AttendanceRecord, AttendanceTrendPoint } from "@/types/attendance";

const attendanceStore: AttendanceRecord[] = [...ATTENDANCE_SEED];
const trendStore: AttendanceTrendPoint[] = [...ATTENDANCE_TREND_SEED];
const toMonth = (date: string) => date.slice(0, 7);

const toHours = (minutes: number) => Math.round((minutes / 60) * 100) / 100;

const calculateMinutesFromLoginLogout = (row: AttendanceRecord) => {
  if (!row.loginAt || !row.logoutAt) {
    return row.durationMinutes;
  }

  const start = new Date(row.loginAt).getTime();
  const end = new Date(row.logoutAt).getTime();
  if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) {
    return row.durationMinutes;
  }

  return Math.round((end - start) / 60000);
};

export const attendanceService = {
  async getAllAttendance(): Promise<AttendanceRecord[]> {
    await sleep(randomDelay());
    return [...attendanceStore];
  },

  async getRecentAttendance(): Promise<AttendanceRecord[]> {
    await sleep(randomDelay());
    return [...attendanceStore].slice(0, 10);
  },

  async getAttendanceTrend(): Promise<AttendanceTrendPoint[]> {
    await sleep(randomDelay());
    return [...trendStore];
  },

  async getPresentCountToday(): Promise<number> {
    await sleep(randomDelay());
    return attendanceStore.filter((item) => item.status === "PRESENT").length;
  },

  async getMealsCountToday(): Promise<number> {
    await sleep(randomDelay());
    const meals = await mealService.getMealVerifications();
    return meals.reduce((sum, row) => sum + row.mealsConsumed, 0);
  },

  async getAttendanceByMonth(month: string): Promise<AttendanceRecord[]> {
    await sleep(randomDelay());
    const rows = attendanceStore.filter((row) => toMonth(row.date) === month);
    const employees = await employeeService.getEmployees();
    const errors = attendanceValidationService.validateAttendanceRows(rows, employees);
    if (errors.length) {
      auditService.log(
        "ATTENDANCE_VALIDATION_FAILED",
        "UNKNOWN",
        `Attendance validation failed for month ${month}: ${errors[0]}`,
      );
      throw new Error("Attendance validation failed.");
    }

    return rows;
  },

  async getAttendanceByEmployeeMonth(
    employeeId: string,
    month: string,
  ): Promise<AttendanceRecord[]> {
    await sleep(randomDelay());
    const rows = attendanceStore.filter(
      (row) => row.employeeId === employeeId && toMonth(row.date) === month,
    );
    const employees = await employeeService.getEmployees();
    const errors = attendanceValidationService.validateAttendanceRows(rows, employees);
    if (errors.length) {
      auditService.log(
        "ATTENDANCE_VALIDATION_FAILED",
        "UNKNOWN",
        `Attendance validation failed for ${employeeId} ${month}: ${errors[0]}`,
      );
      throw new Error("Attendance validation failed.");
    }

    return rows;
  },

  async getEmployeeDailyHours(employeeId: string, month: string) {
    await sleep(randomDelay());
    const rows = await this.getAttendanceByEmployeeMonth(employeeId, month);
    return rows.map((row) => {
      const workedMinutes = calculateMinutesFromLoginLogout(row);
      return {
        id: row.id,
        date: row.date,
        loginAt: row.loginAt ?? "-",
        logoutAt: row.logoutAt ?? "-",
        workedMinutes,
        workedHours: toHours(workedMinutes),
        status: row.status,
        shift: row.shift,
      };
    });
  },
};
