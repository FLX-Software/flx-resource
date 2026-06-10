"use server";

import { revalidatePath } from "next/cache";
import type { UserRole } from "@prisma/client";
import { prisma } from "./prisma";
import {
  normalizeUsername,
  validatePassword,
  validateUsername,
} from "./auth-helpers";
import { hashPassword } from "./password";
import { createSession, requireAdmin, requireAuth } from "./session";

function revalidateAuthPaths() {
  revalidatePath("/administration");
  revalidatePath("/profil");
  revalidatePath("/");
}

export async function createUserAccount(formData: FormData) {
  const session = await requireAdmin();

  const username = normalizeUsername(formData.get("username") as string);
  const password = formData.get("password") as string;
  const firstName = (formData.get("firstName") as string)?.trim();
  const lastName = (formData.get("lastName") as string)?.trim();
  const role = (formData.get("role") as UserRole) || "EMPLOYEE";
  const employeeId = (formData.get("employeeId") as string) || null;

  if (!username || !password || !firstName || !lastName) {
    throw new Error("Bitte alle Pflichtfelder ausfüllen.");
  }

  const usernameError = validateUsername(username);
  if (usernameError) throw new Error(usernameError);

  const passwordError = validatePassword(password);
  if (passwordError) throw new Error(passwordError);

  if (role !== "ADMIN" && role !== "EMPLOYEE") {
    throw new Error("Ungültige Rolle.");
  }

  if (employeeId) {
    const employee = await prisma.employee.findUnique({
      where: { id: employeeId },
      include: { user: true },
    });
    if (!employee) throw new Error("Mitarbeiter nicht gefunden.");
    if (employee.user) {
      throw new Error("Dieser Mitarbeiter ist bereits mit einem Konto verknüpft.");
    }
  }

  const existing = await prisma.user.findUnique({ where: { username } });
  if (existing) throw new Error("Dieser Benutzername ist bereits vergeben.");

  await prisma.user.create({
    data: {
      username,
      passwordHash: await hashPassword(password),
      passwordDisplay: password,
      firstName,
      lastName,
      role,
      employeeId: employeeId || null,
    },
  });

  revalidateAuthPaths();
  return { ok: true as const };
}

export async function updateUserAccount(userId: string, formData: FormData) {
  await requireAdmin();

  const firstName = (formData.get("firstName") as string)?.trim();
  const lastName = (formData.get("lastName") as string)?.trim();
  const role = formData.get("role") as UserRole;
  const employeeId = (formData.get("employeeId") as string) || null;
  const password = (formData.get("password") as string) || "";

  if (!firstName || !lastName) {
    throw new Error("Vor- und Nachname sind erforderlich.");
  }

  if (role !== "ADMIN" && role !== "EMPLOYEE") {
    throw new Error("Ungültige Rolle.");
  }

  const existing = await prisma.user.findUnique({ where: { id: userId } });
  if (!existing) throw new Error("Benutzer nicht gefunden.");

  if (employeeId) {
    const employee = await prisma.employee.findUnique({
      where: { id: employeeId },
      include: { user: true },
    });
    if (!employee) throw new Error("Mitarbeiter nicht gefunden.");
    if (employee.user && employee.user.id !== userId) {
      throw new Error("Dieser Mitarbeiter ist bereits mit einem anderen Konto verknüpft.");
    }
  }

  const data: {
    firstName: string;
    lastName: string;
    role: UserRole;
    employeeId: string | null;
    passwordHash?: string;
    passwordDisplay?: string;
  } = {
    firstName,
    lastName,
    role,
    employeeId: employeeId || null,
  };

  if (password) {
    const passwordError = validatePassword(password);
    if (passwordError) throw new Error(passwordError);
    data.passwordHash = await hashPassword(password);
    data.passwordDisplay = password;
  }

  await prisma.user.update({ where: { id: userId }, data });
  revalidateAuthPaths();
  return { ok: true as const };
}

export async function deleteUserAccount(userId: string) {
  const session = await requireAdmin();
  if (session.userId === userId) {
    throw new Error("Sie können Ihr eigenes Konto nicht löschen.");
  }

  await prisma.user.delete({ where: { id: userId } });
  revalidateAuthPaths();
  return { ok: true as const };
}

export async function updateOwnProfile(formData: FormData) {
  const session = await requireAuth();
  const firstName = (formData.get("firstName") as string)?.trim();
  const lastName = (formData.get("lastName") as string)?.trim();
  const password = (formData.get("password") as string) || "";

  if (!firstName || !lastName) {
    throw new Error("Vor- und Nachname sind erforderlich.");
  }

  const data: {
    firstName: string;
    lastName: string;
    passwordHash?: string;
    passwordDisplay?: string;
  } = { firstName, lastName };

  if (password) {
    const passwordError = validatePassword(password);
    if (passwordError) throw new Error(passwordError);
    data.passwordHash = await hashPassword(password);
    data.passwordDisplay = password;
  }

  const user = await prisma.user.update({
    where: { id: session.userId },
    data,
  });

  await createSession({
    userId: user.id,
    username: user.username,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
    employeeId: user.employeeId,
  });

  revalidateAuthPaths();
  return { ok: true as const };
}
