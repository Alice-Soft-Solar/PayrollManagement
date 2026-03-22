import { PayrollDistribution, PayrollRecord } from "@/types/payroll";

export interface PayrollInputSeed {
  employeeId: string;
  month: string;
  bonus: number;
  allowances: number;
}

export const PAYROLL_INPUT_SEED: PayrollInputSeed[] = [
  { employeeId: "emp-001", month: "2026-03", bonus: 40, allowances: 60 },
  { employeeId: "emp-002", month: "2026-03", bonus: 20, allowances: 35 },
  { employeeId: "emp-003", month: "2026-03", bonus: 0, allowances: 80 },
  { employeeId: "emp-004", month: "2026-03", bonus: 0, allowances: 25 },
  { employeeId: "emp-005", month: "2026-03", bonus: 15, allowances: 30 },
];

export const PAYROLL_SEED: PayrollRecord[] = [
  {
    id: "pay-seed-001",
    employeeId: "emp-001",
    employeeName: "Anita Rao",
    month: "2026-03",
    gross: 1357,
    deductions: 217,
    net: 1139,
    status: "PAID",
  },
  {
    id: "pay-seed-002",
    employeeId: "emp-002",
    employeeName: "Marcus Tan",
    month: "2026-03",
    gross: 1465,
    deductions: 242,
    net: 1223,
    status: "PAID",
  },
  {
    id: "pay-seed-003",
    employeeId: "emp-003",
    employeeName: "Lucy Green",
    month: "2026-03",
    gross: 1320,
    deductions: 218,
    net: 1102,
    status: "PENDING",
  },
  {
    id: "pay-seed-004",
    employeeId: "emp-004",
    employeeName: "Ibrahim Khan",
    month: "2026-03",
    gross: 1051,
    deductions: 188,
    net: 863,
    status: "PENDING",
  },
];

export const PAYROLL_DISTRIBUTION_SEED: PayrollDistribution[] = [
  { label: "Operations", value: 3200 },
  { label: "Safety", value: 1400 },
  { label: "Warehouse", value: 1700 },
  { label: "Admin", value: 900 },
];
