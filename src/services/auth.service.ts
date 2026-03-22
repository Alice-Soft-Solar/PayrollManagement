import { SESSION_KEY } from "@/lib/constants";
import { randomDelay, sleep } from "@/lib/utils";
import { MOCK_USERS } from "@/seeders/roles";
import { AuthUser, LoginPayload, UserSession } from "@/types/auth";

const toUser = (input: (typeof MOCK_USERS)[number]): AuthUser => ({
  id: input.id,
  name: input.name,
  email: input.email,
  role: input.role,
});

const isValidSession = (value: unknown): value is UserSession => {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<UserSession>;
  const user = candidate.user as Partial<UserSession["user"]> | undefined;

  return (
    typeof candidate.token === "string" &&
    typeof candidate.loggedInAt === "string" &&
    !!user &&
    typeof user.id === "string" &&
    typeof user.name === "string" &&
    typeof user.email === "string" &&
    typeof user.role === "string"
  );
};

export const authService = {
  async login(payload: LoginPayload): Promise<UserSession> {
    await sleep(randomDelay());

    const match = MOCK_USERS.find(
      (item) =>
        item.email.toLowerCase() === payload.email.toLowerCase() &&
        item.password === payload.password,
    );

    if (!match) {
      throw new Error("Invalid email or password.");
    }

    return {
      user: toUser(match),
      token: `mock-token-${match.id}`,
      loggedInAt: new Date().toISOString(),
    };
  },

  async getSession(): Promise<UserSession | null> {
    await sleep(300);
    if (typeof window === "undefined") {
      return null;
    }

    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) {
      return null;
    }

    try {
      const parsed = JSON.parse(raw) as unknown;
      if (!isValidSession(parsed)) {
        localStorage.removeItem(SESSION_KEY);
        return null;
      }

      return parsed;
    } catch {
      localStorage.removeItem(SESSION_KEY);
      return null;
    }
  },

  persistSession(session: UserSession): void {
    if (typeof window === "undefined") {
      return;
    }

    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    window.dispatchEvent(new Event("bfiaps-auth-changed"));
  },

  clearSession(): void {
    if (typeof window === "undefined") {
      return;
    }

    localStorage.removeItem(SESSION_KEY);
    window.dispatchEvent(new Event("bfiaps-auth-changed"));
  },
};
