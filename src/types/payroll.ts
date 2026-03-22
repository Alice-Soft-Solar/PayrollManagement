export type SalaryModel = "DAILY" | "MONTHLY";
export type PayrollLineStatus = "PAID" | "PENDING";
export type PayrollRunStatus = "OPEN" | "LOCKED";
export type PayrollPeriodType = "MONTH" | "WEEK";
export type PayrollSegment = "ALL" | "LABOUR" | "FINANCE";

export interface PayrollRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  month: string;
  gross: number;
  deductions: number;
  net: number;
  status: PayrollLineStatus;
}

export interface PayrollBreakdown {
  totalMinutes: number;
  totalHours: number;
  presentDays: number;
  salary: number;
  overtimeHours: number;
  overtimePay: number;
  bonus: number;
  allowances: number;
  mealsConsumed: number;
  mealSubsidyValue: number;
  meals: number;
  pf: number;
  esi: number;
  pt: number;
  tds: number;
}

export interface PayrollLine extends PayrollRecord {
  employeeSegment?: Exclude<PayrollSegment, "ALL">;
  salaryModel: SalaryModel;
  baseSalary: number;
  hourlyRate: number;
  deductions: number;
  breakdown: PayrollBreakdown;
}

export interface PayrollDistribution {
  label: string;
  value: number;
}

export interface PayrollConfig {
  pfRate: number;
  esiRate: number;
  tdsEnabled: boolean;
  tdsRate: number;
  overtimeRate: number;
  mealSubsidyValue: number;
  workingDays: number;
}

export interface PayrollPreview {
  month: string;
  locked: boolean;
  lines: PayrollLine[];
  totals: {
    gross: number;
    deductions: number;
    net: number;
  };
}

export interface PayrollRun {
  id: string;
  month: string;
  status: PayrollRunStatus;
  createdAt: string;
  lineCount: number;
  totals: {
    gross: number;
    deductions: number;
    net: number;
  };
  lines: PayrollLine[];
}

export interface PayrollDetail {
  payrollId: string;
  month: string;
  status: PayrollLineStatus;
  employeeId: string;
  employeeName: string;
  totalMinutes: number;
  totalHours: number;
  presentDays: number;
  salaryModel: SalaryModel;
  baseSalary: number;
  hourlyRate: number;
  salary: number;
  overtimeHours: number;
  overtimePay: number;
  bonus: number;
  allowances: number;
  pf: number;
  esi: number;
  pt: number;
  tds: number;
  mealsConsumed: number;
  mealSubsidyValue: number;
  meals: number;
  gross: number;
  deductions: number;
  net: number;
}

export interface PayslipData {
  employeeId: string;
  employeeName: string;
  month: string;
  role: string;
  salaryModel: SalaryModel;
  totalMinutes: number;
  gross: number;
  pf: number;
  esi: number;
  pt: number;
  tds: number;
  meals: number;
  mealsConsumed: number;
  mealSubsidyValue: number;
  deductions: number;
  net: number;
}
