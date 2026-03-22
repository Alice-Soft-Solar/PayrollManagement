import { AttendanceRecord } from "@/types/attendance";
import { Employee } from "@/types/employee";

const MIN_MINUTES = 0;
const MAX_MINUTES = 16 * 60;

const uniqueKey = (row: AttendanceRecord) => `${row.employeeId}-${row.date}-${row.shift}`;

export const attendanceValidationService = {
  validateAttendanceRows(rows: AttendanceRecord[], employees: Employee[]): string[] {
    const errors: string[] = [];
    const knownEmployees = new Set(employees.map((employee) => employee.id));
    const seen = new Set<string>();

    rows.forEach((row) => {
      if (!knownEmployees.has(row.employeeId)) {
        errors.push(`Unknown employeeId ${row.employeeId} in ${row.id}`);
      }

      if (!Number.isFinite(row.durationMinutes)) {
        errors.push(`Invalid durationMinutes for ${row.id}`);
      }

      if (row.durationMinutes < MIN_MINUTES || row.durationMinutes > MAX_MINUTES) {
        errors.push(`Duration out of range for ${row.id}`);
      }

      if (row.status === "ABSENT" && row.durationMinutes !== 0) {
        errors.push(`Absent row must have zero duration for ${row.id}`);
      }

      const key = uniqueKey(row);
      if (seen.has(key)) {
        errors.push(`Duplicate attendance session ${key}`);
      }
      seen.add(key);
    });

    return errors;
  },
};
