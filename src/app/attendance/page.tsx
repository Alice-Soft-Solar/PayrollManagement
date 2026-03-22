"use client";

import { useEffect, useState } from "react";

import { Card } from "@/components/ui/Card";
import { DataTable } from "@/components/ui/DataTable";
import { Skeleton } from "@/components/ui/Skeleton";
import { attendanceService } from "@/services/attendance.service";
import { employeeService } from "@/services/employee.service";

export default function AttendancePage() {
  const [employeeId, setEmployeeId] = useState("emp-001");
  const [month, setMonth] = useState("2026-03");
  const [employees, setEmployees] = useState<Array<{ id: string; name: string }>>([]);
  const [rows, setRows] = useState<
    Array<{
      id: string;
      date: string;
      loginAt: string;
      logoutAt: string;
      workedMinutes: number;
      workedHours: number;
      status: "PRESENT" | "ABSENT";
      shift: "DAY" | "NIGHT";
    }>
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadEmployees = async () => {
      const list = await employeeService.getActiveEmployees();
      setEmployees(list.map((employee) => ({ id: employee.id, name: employee.name })));
      if (list.length && !list.find((item) => item.id === employeeId)) {
        setEmployeeId(list[0].id);
      }
    };

    loadEmployees();
  }, [employeeId]);

  useEffect(() => {
    const loadRows = async () => {
      setLoading(true);
      if (!employeeId) {
        setRows([]);
        setLoading(false);
        return;
      }

      const data = await attendanceService.getEmployeeDailyHours(employeeId, month);
      setRows(data);
      setLoading(false);
    };

    loadRows();
  }, [employeeId, month]);

  if (loading) {
    return <Skeleton height={260} />;
  }

  return (
    <div className="stack-24">
      <Card title="Attendance Filters">
        <div className="row-actions">
          <select
            className="input"
            value={employeeId}
            onChange={(event) => setEmployeeId(event.target.value)}
            style={{ maxWidth: 260 }}
          >
            {employees.map((employee) => (
              <option key={employee.id} value={employee.id}>
                {employee.name}
              </option>
            ))}
          </select>
          <input
            className="input"
            type="month"
            value={month}
            onChange={(event) => setMonth(event.target.value)}
            style={{ maxWidth: 180 }}
          />
        </div>
      </Card>

      <Card title="Individual Daily Attendance (Login/Logout Based)">
        <DataTable
          columns={[
            { key: "date", header: "Date" },
            { key: "loginAt", header: "Login" },
            { key: "logoutAt", header: "Logout" },
            { key: "workedMinutes", header: "Worked Minutes" },
            { key: "workedHours", header: "Worked Hours" },
            { key: "status", header: "Status" },
            { key: "shift", header: "Shift" },
          ]}
          data={rows}
        />
      </Card>
    </div>
  );
}
