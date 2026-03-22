export interface AttendanceRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  date: string;
  status: "PRESENT" | "ABSENT";
  shift: "DAY" | "NIGHT";
  durationMinutes: number;
  loginAt?: string | null;
  logoutAt?: string | null;
}

export interface AttendanceTrendPoint {
  date: string;
  presentCount: number;
  absentCount: number;
}
