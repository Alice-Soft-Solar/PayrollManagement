import { PayrollConfig } from "@/types/payroll";

export const DEFAULT_PAYROLL_CONFIG: PayrollConfig = {
  pfRate: 0.12,
  esiRate: 0.02,
  tdsEnabled: false,
  tdsRate: 0.05,
  overtimeRate: 9,
  mealSubsidyValue: 2,
  workingDays: 26,
};
