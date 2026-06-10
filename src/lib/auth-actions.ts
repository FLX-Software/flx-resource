"use server";

import { redirect } from "next/navigation";
import { prisma } from "./prisma";
import {
  normalizeUsername,
  validatePassword,
  validateUsername,
} from "./auth-helpers";
import { hashPassword, verifyPassword } from "./password";
import { createSession, destroySession } from "./session";

export async function login(formData: FormData) {
  const username = normalizeUsername(formData.get("username") as string);
  const password = formData.get("password") as string;

  if (!username || !password) {
    throw new Error("Benutzername und Passwort sind erforderlich.");
  }

  const user = await prisma.user.findUnique({ where: { username } });
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    throw new Error("Benutzername oder Passwort ist ungültig.");
  }

  await createSession({
    userId: user.id,
    username: user.username,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
    employeeId: user.employeeId,
  });

  return { ok: true as const };
}

export async function register(formData: FormData) {
  const username = normalizeUsername(formData.get("username") as string);
  const password = formData.get("password") as string;
  const firstName = (formData.get("firstName") as string)?.trim();
  const lastName = (formData.get("lastName") as string)?.trim();

  if (!username || !password || !firstName || !lastName) {
    throw new Error("Bitte alle Pflichtfelder ausfüllen.");
  }

  const usernameError = validateUsername(username);
  if (usernameError) throw new Error(usernameError);

  const passwordError = validatePassword(password);
  if (passwordError) throw new Error(passwordError);

  const existing = await prisma.user.findUnique({ where: { username } });
  if (existing) {
    throw new Error("Dieser Benutzername ist bereits vergeben.");
  }

  const user = await prisma.user.create({
    data: {
      username,
      passwordHash: await hashPassword(password),
      passwordDisplay: password,
      firstName,
      lastName,
      role: "EMPLOYEE",
    },
  });

  await createSession({
    userId: user.id,
    username: user.username,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
    employeeId: user.employeeId,
  });

  return { ok: true as const };
}

export async function logout() {
  await destroySession();
  redirect("/login");
}
