export interface MealVerification {
  id: string;
  employeeId: string;
  date: string;
  mealsConsumed: number;
}

export const MEAL_VERIFICATIONS_SEED: MealVerification[] = [
  { id: "meal-001", employeeId: "emp-001", date: "2026-03-10", mealsConsumed: 1 },
  { id: "meal-002", employeeId: "emp-001", date: "2026-03-11", mealsConsumed: 1 },
  { id: "meal-003", employeeId: "emp-002", date: "2026-03-10", mealsConsumed: 2 },
  { id: "meal-004", employeeId: "emp-002", date: "2026-03-11", mealsConsumed: 1 },
  { id: "meal-005", employeeId: "emp-003", date: "2026-03-10", mealsConsumed: 1 },
  { id: "meal-006", employeeId: "emp-004", date: "2026-03-10", mealsConsumed: 2 },
  { id: "meal-007", employeeId: "emp-005", date: "2026-03-12", mealsConsumed: 1 }
];
