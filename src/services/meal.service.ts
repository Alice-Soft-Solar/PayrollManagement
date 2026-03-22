import { randomDelay, sleep } from "@/lib/utils";
import { MEAL_VERIFICATIONS_SEED, MealVerification } from "@/seeders/meals";

const mealStore: MealVerification[] = [...MEAL_VERIFICATIONS_SEED];

const toMonth = (date: string) => date.slice(0, 7);

export const mealService = {
  async getMealVerifications(): Promise<MealVerification[]> {
    await sleep(randomDelay());
    return [...mealStore];
  },

  async getMealVerificationsByMonth(month: string): Promise<MealVerification[]> {
    await sleep(randomDelay());
    return mealStore.filter((row) => toMonth(row.date) === month);
  },

  async getMealVerificationsByEmployeeMonth(
    employeeId: string,
    month: string,
  ): Promise<MealVerification[]> {
    await sleep(randomDelay());
    return mealStore.filter(
      (row) => row.employeeId === employeeId && toMonth(row.date) === month,
    );
  },
};
