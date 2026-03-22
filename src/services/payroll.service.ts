import { randomDelay, sleep } from "@/lib/utils";
import { attendanceService } from "@/services/attendance.service";
import { auditService } from "@/services/audit.service";
import { employeeService } from "@/services/employee.service";
import { mealService } from "@/services/meal.service";
import { permissionService } from "@/services/permission.service";
import { systemConfigService } from "@/services/systemConfig.service";
import {
  PAYROLL_DISTRIBUTION_SEED,
  PAYROLL_INPUT_SEED,
  PAYROLL_SEED,
} from "@/seeders/payroll";
import {
  PayrollConfig,
  PayrollDetail,
  PayrollDistribution,
  PayrollLine,
  PayrollLineStatus,
  PayrollPeriodType,
  PayrollSegment,
  PayrollPreview,
  PayrollRecord,
  PayrollRun,
  PayslipData,
} from "@/types/payroll";
import { UserRole } from "@/types/auth";

const distributionStore: PayrollDistribution[] = [...PAYROLL_DISTRIBUTION_SEED];

let payrollRunsStore: PayrollRun[] = [];
let monthLockStore: Record<string, boolean> = {};

const getProfessionalTax = (gross: number) => {
  if (gross < 900) {
    return 0;
  }
  if (gross < 1300) {
    return 8;
  }
  if (gross < 1700) {
    return 12;
  }
  return 18;
};

const DEFAULT_MONTH = "2026-03";

const round = (value: number) => Math.round(value);

const getIsoWeekKey = (isoDate: string) => {
  const date = new Date(`${isoDate}T00:00:00.000Z`);
  const day = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((date.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  return `${date.getUTCFullYear()}-W${String(weekNo).padStart(2, "0")}`;
};

const isEmployeeInSegment = (
  employee: Awaited<ReturnType<typeof employeeService.getActiveEmployees>>[number],
  segment: PayrollSegment,
) => {
  if (segment === "ALL") {
    return true;
  }

  return (employee.segment ?? "LABOUR") === segment;
};

const generateLinesForMonth = async (month: string): Promise<PayrollLine[]> => {
  const [employees, attendanceRows, mealRowsByMonth, config] = await Promise.all([
    employeeService.getActiveEmployees(),
    attendanceService.getAttendanceByMonth(month),
    mealService.getMealVerificationsByMonth(month),
    systemConfigService.getPayrollConfig(),
  ]);

  return employees.map((employee) => {
    const sessions = attendanceRows.filter((row) => row.employeeId === employee.id);

    const mealRows = mealRowsByMonth.filter((row) => row.employeeId === employee.id);

    const payrollInput =
      PAYROLL_INPUT_SEED.find(
        (seed) => seed.employeeId === employee.id && seed.month === month,
      ) ?? { bonus: 0, allowances: 0 };

    const presentRows = sessions.filter((row) => row.status === "PRESENT");
    const presentDays = new Set(presentRows.map((row) => row.date)).size;
    const totalMinutes = presentRows.reduce((sum, row) => sum + row.durationMinutes, 0);
    const totalHours = totalMinutes / 60;

    const salary =
      employee.salaryType === "DAILY"
        ? totalHours * employee.hourlyRate
        : employee.baseSalary * (presentDays / config.workingDays);

    const overtimeHours = Math.max(totalHours - presentDays * 8, 0);
    const overtimePay = overtimeHours * config.overtimeRate;
    const gross = salary + overtimePay + payrollInput.bonus + payrollInput.allowances;

    const pf = salary * config.pfRate;
    const esi = gross * config.esiRate;
    const pt = getProfessionalTax(gross);
    const tds = config.tdsEnabled ? gross * config.tdsRate : 0;
    const mealsConsumed = mealRows.reduce((sum, row) => sum + row.mealsConsumed, 0);
    const meals = mealsConsumed * config.mealSubsidyValue;

    const deductions = pf + esi + pt + tds + meals;
    const net = gross - deductions;
    const lineId = `${month}-${employee.id}`;

    return {
      id: lineId,
      employeeId: employee.id,
      employeeName: employee.name,
      month,
      employeeSegment: employee.segment ?? "LABOUR",
      gross: round(gross),
      deductions: round(deductions),
      net: round(net),
      status: "PENDING",
      salaryModel: employee.salaryType,
      baseSalary: employee.baseSalary,
      hourlyRate: employee.hourlyRate,
      breakdown: {
        totalMinutes,
        totalHours,
        presentDays,
        salary: round(salary),
        overtimeHours: round(overtimeHours),
        overtimePay: round(overtimePay),
        bonus: round(payrollInput.bonus),
        allowances: round(payrollInput.allowances),
        mealsConsumed,
        mealSubsidyValue: config.mealSubsidyValue,
        meals: round(meals),
        pf: round(pf),
        esi: round(esi),
        pt: round(pt),
        tds: round(tds),
      },
    };
  });
};

const generateLinesForPeriod = async (
  periodType: PayrollPeriodType,
  periodValue: string,
  employeeId?: string,
  segment: PayrollSegment = "ALL",
): Promise<PayrollLine[]> => {
  if (periodType === "MONTH") {
    const monthlyLines = await generateLinesForMonth(periodValue);
    return monthlyLines.filter((line) => {
      if (employeeId && line.employeeId !== employeeId) {
        return false;
      }

      if (segment === "ALL") {
        return true;
      }

      return (line.employeeSegment ?? "LABOUR") === segment;
    });
  }

  const [employees, attendanceRows, mealRows, config] = await Promise.all([
    employeeService.getActiveEmployees(),
    attendanceService.getAllAttendance(),
    mealService.getMealVerifications(),
    systemConfigService.getPayrollConfig(),
  ]);

  const weeklyAttendance = attendanceRows.filter((row) => getIsoWeekKey(row.date) === periodValue);
  const weeklyMeals = mealRows.filter((row) => getIsoWeekKey(row.date) === periodValue);

  return employees
    .filter((employee) => (!employeeId || employee.id === employeeId) && isEmployeeInSegment(employee, segment))
    .map((employee) => {
      const sessions = weeklyAttendance.filter((row) => row.employeeId === employee.id);
      const mealRowsByEmployee = weeklyMeals.filter((row) => row.employeeId === employee.id);
      const presentRows = sessions.filter((row) => row.status === "PRESENT");
      const presentDays = new Set(presentRows.map((row) => row.date)).size;
      const totalMinutes = presentRows.reduce((sum, row) => sum + row.durationMinutes, 0);
      const totalHours = totalMinutes / 60;

      const salary =
        employee.salaryType === "DAILY"
          ? totalHours * employee.hourlyRate
          : employee.baseSalary * (presentDays / config.workingDays);

      const overtimeHours = Math.max(totalHours - presentDays * 8, 0);
      const overtimePay = overtimeHours * config.overtimeRate;
      const pf = salary * config.pfRate;
      const gross = salary + overtimePay;
      const esi = gross * config.esiRate;
      const pt = getProfessionalTax(gross);
      const tds = config.tdsEnabled ? gross * config.tdsRate : 0;
      const mealsConsumed = mealRowsByEmployee.reduce((sum, row) => sum + row.mealsConsumed, 0);
      const mealCost = mealsConsumed * config.mealSubsidyValue;
      const deductions = pf + esi + pt + tds + mealCost;

      return {
        id: `${periodValue}-${employee.id}`,
        employeeId: employee.id,
        employeeName: employee.name,
        month: periodValue,
        employeeSegment: employee.segment ?? "LABOUR",
        gross: round(gross),
        deductions: round(deductions),
        net: round(gross - deductions),
        status: "PENDING" as const,
        salaryModel: employee.salaryType,
        baseSalary: employee.baseSalary,
        hourlyRate: employee.hourlyRate,
        breakdown: {
          totalMinutes,
          totalHours,
          presentDays,
          salary: round(salary),
          overtimeHours: round(overtimeHours),
          overtimePay: round(overtimePay),
          bonus: 0,
          allowances: 0,
          mealsConsumed,
          mealSubsidyValue: config.mealSubsidyValue,
          meals: round(mealCost),
          pf: round(pf),
          esi: round(esi),
          pt: round(pt),
          tds: round(tds),
        },
      };
    });
};

const toPreview = (month: string, lines: PayrollLine[], locked: boolean): PayrollPreview => {
  const totals = lines.reduce(
    (acc, line) => {
      acc.gross += line.gross;
      acc.deductions += line.deductions;
      acc.net += line.net;
      return acc;
    },
    { gross: 0, deductions: 0, net: 0 },
  );

  return {
    month,
    locked,
    lines,
    totals,
  };
};

const getRunByMonth = (month: string) => {
  return payrollRunsStore.find((run) => run.month === month) ?? null;
};

const listLinesByFilters = (
  status: "ALL" | PayrollLineStatus,
  search: string,
  sourceLines: PayrollLine[],
) => {
  const normalizedSearch = search.trim().toLowerCase();

  return sourceLines.filter((line) => {
    const matchStatus = status === "ALL" || line.status === status;
    const matchSearch =
      !normalizedSearch ||
      line.employeeName.toLowerCase().includes(normalizedSearch);
    return matchStatus && matchSearch;
  });
};

const toDetail = (line: PayrollLine): PayrollDetail => {
  return {
    payrollId: line.id,
    month: line.month,
    status: line.status,
    employeeId: line.employeeId,
    employeeName: line.employeeName,
    totalMinutes: line.breakdown.totalMinutes,
    totalHours: line.breakdown.totalHours,
    presentDays: line.breakdown.presentDays,
    salaryModel: line.salaryModel,
    baseSalary: line.baseSalary,
    hourlyRate: line.hourlyRate,
    salary: line.breakdown.salary,
    overtimeHours: line.breakdown.overtimeHours,
    overtimePay: line.breakdown.overtimePay,
    bonus: line.breakdown.bonus,
    allowances: line.breakdown.allowances,
    pf: line.breakdown.pf,
    esi: line.breakdown.esi,
    pt: line.breakdown.pt,
    tds: line.breakdown.tds,
    mealsConsumed: line.breakdown.mealsConsumed,
    mealSubsidyValue: line.breakdown.mealSubsidyValue,
    meals: line.breakdown.meals,
    gross: line.gross,
    deductions: line.deductions,
    net: line.net,
  };
};

export const payrollService = {
  async getPayroll(
    month = DEFAULT_MONTH,
    status: "ALL" | PayrollLineStatus = "ALL",
    search = "",
  ): Promise<PayrollLine[]> {
    await sleep(randomDelay());
    const run = getRunByMonth(month);
    const sourceLines = run ? run.lines : await generateLinesForMonth(month);
    return listLinesByFilters(status, search, sourceLines);
  },

  async getRecentPayroll(): Promise<PayrollRecord[]> {
    await sleep(randomDelay());
    return PAYROLL_SEED.slice(0, 8);
  },

  async generatePayrollPreview(month: string): Promise<PayrollPreview> {
    await sleep(randomDelay());
    const run = getRunByMonth(month);
    if (run) {
      return toPreview(month, run.lines, Boolean(monthLockStore[month]));
    }

    return toPreview(
      month,
      await generateLinesForMonth(month),
      Boolean(monthLockStore[month]),
    );
  },

  async runPayroll(month: string, actorRole?: UserRole): Promise<PayrollRun> {
    await sleep(randomDelay());
    const role = await permissionService.assertAction("payroll", "run", actorRole);

    if (getRunByMonth(month)) {
      throw new Error("Payroll run already exists for this month.");
    }

    const preview = await this.generatePayrollPreview(month);
    const lines = preview.lines.map((line) => ({
      ...line,
      status: "PENDING" as const,
    }));

    const run: PayrollRun = {
      id: `run-${month}-${Date.now()}`,
      month,
      status: "OPEN",
      createdAt: new Date().toISOString(),
      lineCount: lines.length,
      totals: {
        gross: preview.totals.gross,
        deductions: preview.totals.deductions,
        net: preview.totals.net,
      },
      lines,
    };

    payrollRunsStore = [run, ...payrollRunsStore];
    monthLockStore[month] = false;
    auditService.log("PAYROLL_RUN", role, `Ran payroll for ${month}`, run.id);

    return run;
  },

  async getPayrollRuns(): Promise<PayrollRun[]> {
    await sleep(randomDelay());
    return [...payrollRunsStore];
  },

  async getPayrollByEmployee(
    employeeId: string,
    month = DEFAULT_MONTH,
  ): Promise<PayrollLine | null> {
    await sleep(randomDelay());

    const run = getRunByMonth(month);
    if (run) {
      return run.lines.find((line) => line.employeeId === employeeId) ?? null;
    }

    return (await generateLinesForMonth(month)).find((line) => line.employeeId === employeeId) ?? null;
  },

  async getPayrollDetail(payrollId: string): Promise<PayrollDetail | null> {
    await sleep(randomDelay());

    const fromRun = payrollRunsStore
      .flatMap((run) => run.lines)
      .find((line) => line.id === payrollId);
    if (fromRun) {
      return toDetail(fromRun);
    }

    const payrollIdParts = payrollId.split("-");
    const [month, employeeId] = payrollIdParts.length >= 4
      ? [`${payrollIdParts[0]}-${payrollIdParts[1]}`, payrollIdParts.slice(2).join("-")]
      : [DEFAULT_MONTH, ""];
    const previewLine = (await generateLinesForMonth(month)).find(
      (line) => line.employeeId === employeeId,
    );
    return previewLine ? toDetail(previewLine) : null;
  },

  async getPayrollLockedState(month = DEFAULT_MONTH): Promise<boolean> {
    await sleep(randomDelay());
    const run = getRunByMonth(month);
    if (run) {
      return run.status === "LOCKED";
    }

    return false;
  },

  async lockPayroll(month = DEFAULT_MONTH, actorRole?: UserRole): Promise<boolean> {
    await sleep(randomDelay());
    const role = await permissionService.assertAction("payroll", "lock", actorRole);

    const run = getRunByMonth(month);
    if (!run) {
      throw new Error("Run payroll before locking.");
    }

    payrollRunsStore = payrollRunsStore.map((item) =>
      item.id === run.id ? { ...item, status: "LOCKED" } : item,
    );
    monthLockStore[month] = true;
    auditService.log("PAYROLL_LOCK", role, `Locked payroll for ${month}`, month);
    return true;
  },

  async unlockPayroll(month = DEFAULT_MONTH, actorRole?: UserRole): Promise<boolean> {
    await sleep(randomDelay());
    const role = await permissionService.assertAction("payroll", "unlock", actorRole);

    const run = getRunByMonth(month);
    if (!run) {
      throw new Error("No payroll run exists for this month.");
    }

    payrollRunsStore = payrollRunsStore.map((item) =>
      item.id === run.id ? { ...item, status: "OPEN" } : item,
    );
    monthLockStore[month] = false;
    auditService.log("PAYROLL_UNLOCK", role, `Unlocked payroll for ${month}`, month);
    return false;
  },

  async updatePayrollStatus(
    payrollId: string,
    status: PayrollLineStatus,
    month = DEFAULT_MONTH,
    actorRole?: UserRole,
  ): Promise<PayrollLine> {
    await sleep(randomDelay());
    const role = await permissionService.assertAction("payroll", "mark_paid", actorRole);

    const run = getRunByMonth(month);
    if (!run) {
      throw new Error("Run payroll before updating payment status.");
    }

    if (!monthLockStore[month]) {
      throw new Error("Lock payroll before updating payment status.");
    }

    const lineIndex = run.lines.findIndex((item) => item.id === payrollId);
    if (lineIndex === -1) {
      throw new Error("Payroll line not found.");
    }

    const currentLine = run.lines[lineIndex];
    if (currentLine.status === status) {
      return currentLine;
    }

    const updatedLine: PayrollLine = {
      ...currentLine,
      status,
    };

    const updatedRun: PayrollRun = {
      ...run,
      lines: run.lines.map((line, index) => (index === lineIndex ? updatedLine : line)),
    };

    payrollRunsStore = payrollRunsStore.map((item) =>
      item.id === run.id ? updatedRun : item,
    );

    auditService.log(
      "PAYROLL_STATUS_UPDATE",
      role,
      `Updated payroll status to ${status} for ${payrollId}`,
      payrollId,
    );

    return updatedLine;
  },

  async updatePayrollConfig(
    partial: Partial<PayrollConfig>,
    actorRole?: UserRole,
  ): Promise<PayrollConfig> {
    await sleep(randomDelay());
    const role = await permissionService.assertAction(
      "salary-config",
      "update",
      actorRole,
    );
    const updated = await systemConfigService.updatePayrollConfig(partial);
    auditService.log("SYSTEM_CONFIG_UPDATE", role, "Updated system payroll config");
    auditService.log("PAYROLL_CONFIG_UPDATE", role, "Updated payroll config");
    return updated;
  },

  async getPayrollConfig(): Promise<PayrollConfig> {
    await sleep(randomDelay());
    return systemConfigService.getPayrollConfig();
  },

  async getTotalPayroll(month = DEFAULT_MONTH): Promise<number> {
    await sleep(randomDelay());
    const lines = await this.getPayroll(month);
    return lines.reduce((acc, item) => acc + item.net, 0);
  },

  async getPayrollDistribution(): Promise<PayrollDistribution[]> {
    await sleep(randomDelay());
    return [...distributionStore];
  },

  async getPayrollByPeriod(
    periodType: PayrollPeriodType,
    periodValue: string,
    segment: PayrollSegment = "ALL",
  ): Promise<PayrollLine[]> {
    await sleep(randomDelay());
    return generateLinesForPeriod(periodType, periodValue, undefined, segment);
  },

  async getPayrollForEmployeePeriod(
    employeeId: string,
    periodType: PayrollPeriodType,
    periodValue: string,
  ): Promise<PayrollLine | null> {
    await sleep(randomDelay());
    const lines = await generateLinesForPeriod(periodType, periodValue, employeeId, "ALL");
    return lines[0] ?? null;
  },

  async getPayslipByEmployee(
    employeeId: string,
    month = DEFAULT_MONTH,
    actorRole?: UserRole,
  ): Promise<PayslipData | null> {
    await sleep(randomDelay());
    await permissionService.assertAction("payslip", "view_payslip", actorRole);

    const run = getRunByMonth(month);
    if (!run || run.status !== "LOCKED") {
      throw new Error("Payslip is available only after payroll is locked.");
    }

    const line = run.lines.find((item) => item.employeeId === employeeId) ?? null;
    if (!line) {
      return null;
    }

    const employee = await employeeService.getEmployeeById(employeeId);
    if (!employee) {
      return null;
    }

    return {
      employeeId: employee.id,
      employeeName: employee.name,
      month,
      role: employee.role,
      salaryModel: line.salaryModel,
      totalMinutes: line.breakdown.totalMinutes,
      gross: line.gross,
      pf: line.breakdown.pf,
      esi: line.breakdown.esi,
      pt: line.breakdown.pt,
      tds: line.breakdown.tds,
      meals: line.breakdown.meals,
      mealsConsumed: line.breakdown.mealsConsumed,
      mealSubsidyValue: line.breakdown.mealSubsidyValue,
      deductions: line.deductions,
      net: line.net,
    };
  },
};
