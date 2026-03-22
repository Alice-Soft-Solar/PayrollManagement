import { DEFAULT_PAYROLL_CONFIG } from "@/seeders/systemConfig";
import { PayrollConfig } from "@/types/payroll";

let configStore: PayrollConfig = { ...DEFAULT_PAYROLL_CONFIG };

export const systemConfigService = {
  getPayrollConfigSync(): PayrollConfig {
    return { ...configStore };
  },

  async getPayrollConfig(): Promise<PayrollConfig> {
    return { ...configStore };
  },

  async updatePayrollConfig(partial: Partial<PayrollConfig>): Promise<PayrollConfig> {
    configStore = { ...configStore, ...partial };
    return { ...configStore };
  },
};
