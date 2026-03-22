import { randomDelay, sleep } from "@/lib/utils";
import { auditService } from "@/services/audit.service";
import { permissionService } from "@/services/permission.service";
import { ATTENDANCE_SEED } from "@/seeders/attendance";
import { EMPLOYEE_SEED } from "@/seeders/employees";
import { PAYROLL_SEED } from "@/seeders/payroll";
import { UserRole } from "@/types/auth";
import {
  Employee,
  EmployeeFilters,
  EmployeeFormInput,
  EmployeeProfile,
} from "@/types/employee";

const getEmployeeSegment = (role: string): "LABOUR" | "FINANCE" => {
  return role.toLowerCase().includes("finance") ? "FINANCE" : "LABOUR";
};

let employeesStore: Employee[] = [...EMPLOYEE_SEED];

const applyFilters = (employees: Employee[], filters?: Partial<EmployeeFilters>) => {
  if (!filters) {
    return employees;
  }

  return employees.filter((employee) => {
    const search = (filters.search ?? "").trim().toLowerCase();
    const role = (filters.role ?? "ALL").trim().toLowerCase();
    const status = filters.status ?? "ALL";

    const matchSearch =
      !search ||
      employee.name.toLowerCase().includes(search) ||
      employee.email.toLowerCase().includes(search) ||
      employee.phone.includes(search);
    const matchRole = role === "all" || employee.role.toLowerCase() === role;
    const matchStatus = status === "ALL" || employee.status === status;

    return matchSearch && matchRole && matchStatus;
  });
};

const buildSummary = (employeeId: string) => {
  const attendanceRows = ATTENDANCE_SEED.filter((row) => row.employeeId === employeeId);
  const payrollRows = PAYROLL_SEED.filter((row) => row.employeeId === employeeId);

  return {
    presentDays: attendanceRows.filter((row) => row.status === "PRESENT").length,
    absentDays: attendanceRows.filter((row) => row.status === "ABSENT").length,
    totalNetPaid: payrollRows
      .filter((row) => row.status === "PAID")
      .reduce((sum, row) => sum + row.net, 0),
    pendingPayrollCount: payrollRows.filter((row) => row.status === "PENDING").length,
  };
};

export const employeeService = {
  async getEmployees(filters?: Partial<EmployeeFilters>): Promise<Employee[]> {
    await sleep(randomDelay());
    return applyFilters([...employeesStore], filters);
  },

  async getActiveEmployees(): Promise<Employee[]> {
    await sleep(randomDelay());
    return employeesStore
      .filter((employee) => employee.status === "ACTIVE")
      .map((employee) => ({
        ...employee,
        segment: employee.segment ?? getEmployeeSegment(employee.role),
      }));
  },

  async addEmployee(payload: EmployeeFormInput, actorRole?: UserRole): Promise<Employee> {
    await sleep(randomDelay());
    const role = await permissionService.assertAction("employee", "create", actorRole);

    const employee: Employee = {
      id: `emp-${Date.now()}`,
      name: payload.name,
      phone: payload.phone,
      email: payload.email,
      password: payload.password,
      address: payload.address,
      city: payload.city,
      pincode: payload.pincode,
      aadhaar: payload.aadhaar,
      pan: payload.pan,
      bankName: payload.bankName,
      accountNumber: payload.accountNumber,
      ifsc: payload.ifsc,
      role: payload.role,
      salaryType: payload.salaryType,
      baseSalary: payload.baseSalary,
      hourlyRate: payload.hourlyRate,
      status: "ACTIVE",
      createdAt: new Date().toISOString(),
    };

    employeesStore = [employee, ...employeesStore];
    auditService.log("EMPLOYEE_CREATE", role, `Created employee ${employee.id}`, employee.id);
    return employee;
  },

  async getEmployeeById(id: string): Promise<Employee | null> {
    await sleep(randomDelay());
    return employeesStore.find((employee) => employee.id === id) ?? null;
  },

  async getEmployeeProfile(id: string): Promise<EmployeeProfile | null> {
    await sleep(randomDelay());
    const employee = employeesStore.find((item) => item.id === id) ?? null;
    if (!employee) {
      return null;
    }

    return {
      employee,
      summary: buildSummary(id),
    };
  },

  async updateEmployee(
    id: string,
    payload: EmployeeFormInput,
    actorRole?: UserRole,
  ): Promise<Employee> {
    await sleep(randomDelay());
    const role = await permissionService.assertAction("employee", "update", actorRole);

    const index = employeesStore.findIndex((item) => item.id === id);
    if (index === -1) {
      throw new Error("Employee not found.");
    }

    const current = employeesStore[index];
    const updated: Employee = {
      ...current,
      ...payload,
    };

    employeesStore[index] = updated;
    auditService.log("EMPLOYEE_UPDATE", role, `Updated employee ${id}`, id);
    return updated;
  },

  async deactivateEmployee(id: string, actorRole?: UserRole): Promise<Employee> {
    await sleep(randomDelay());
    const role = await permissionService.assertAction("employee", "update", actorRole);

    const index = employeesStore.findIndex((item) => item.id === id);
    if (index === -1) {
      throw new Error("Employee not found.");
    }

    const updated: Employee = {
      ...employeesStore[index],
      status: "INACTIVE",
    };

    employeesStore[index] = updated;
    auditService.log("EMPLOYEE_STATUS_UPDATE", role, `Deactivated employee ${id}`, id);
    return updated;
  },

  async activateEmployee(id: string, actorRole?: UserRole): Promise<Employee> {
    await sleep(randomDelay());
    const role = await permissionService.assertAction("employee", "update", actorRole);

    const index = employeesStore.findIndex((item) => item.id === id);
    if (index === -1) {
      throw new Error("Employee not found.");
    }

    const updated: Employee = {
      ...employeesStore[index],
      status: "ACTIVE",
    };

    employeesStore[index] = updated;
    auditService.log("EMPLOYEE_STATUS_UPDATE", role, `Activated employee ${id}`, id);
    return updated;
  },

  async deleteEmployee(id: string, actorRole?: UserRole): Promise<void> {
    await sleep(randomDelay());
    const role = await permissionService.assertAction("employee", "delete", actorRole);
    employeesStore = employeesStore.filter((item) => item.id !== id);
    auditService.log("EMPLOYEE_DELETE", role, `Deleted employee ${id}`, id);
  },
};
