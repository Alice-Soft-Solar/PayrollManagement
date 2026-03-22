export type SalaryType = "MONTHLY" | "DAILY";
export type EmployeeStatus = "ACTIVE" | "INACTIVE";
export type EmployeeSegment = "LABOUR" | "FINANCE";

export interface Employee {
  id: string;
  name: string;
  phone: string;
  email: string;
  password: string;
  address: string;
  city: string;
  pincode: string;
  aadhaar: string;
  pan: string;
  bankName: string;
  accountNumber: string;
  ifsc: string;
  role: string;
  segment?: EmployeeSegment;
  salaryType: SalaryType;
  baseSalary: number;
  hourlyRate: number;
  status: EmployeeStatus;
  createdAt: string;
}

export interface EmployeeFormInput {
  name: string;
  phone: string;
  email: string;
  password: string;
  address: string;
  city: string;
  pincode: string;
  aadhaar: string;
  pan: string;
  bankName: string;
  accountNumber: string;
  ifsc: string;
  role: string;
  salaryType: SalaryType;
  baseSalary: number;
  hourlyRate: number;
}

export interface EmployeeSummary {
  presentDays: number;
  absentDays: number;
  totalNetPaid: number;
  pendingPayrollCount: number;
}

export interface EmployeeProfile {
  employee: Employee;
  summary: EmployeeSummary;
}

export interface EmployeeFilters {
  search: string;
  role: string;
  status: EmployeeStatus | "ALL";
}
