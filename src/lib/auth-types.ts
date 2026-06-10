import type { UserRole } from "@prisma/client";

export const SESSION_COOKIE = "flx-session";

export interface SessionUser {
  userId: string;
  username: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  employeeId: string | null;
}
