"use server";

import { redirect } from "next/navigation";
import { prisma } from "./prisma";
import { hashPassword, verifyPassword } from "./password";
import { createSession, destroySession } from "./session";

export async function login(formData: FormData) {
  const email = (formData.get("email") as string)?.trim().toLowerCase();
  const password = formData.get("password") as string;

  if (!email || !password) {
    throw new Error("E-Mail und Passwort sind erforderlich.");
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    throw new Error("E-Mail oder Passwort ist ungültig.");
  }

  await createSession({
    userId: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
    employeeId: user.employeeId,
  });

  redirect("/");
}

export async function register(formData: FormData) {
  const email = (formData.get("email") as string)?.trim().toLowerCase();
  const password = formData.get("password") as string;
  const firstName = (formData.get("firstName") as string)?.trim();
  const lastName = (formData.get("lastName") as string)?.trim();
  const accountType = formData.get("accountType") as string;
  const employeeId = (formData.get("employeeId") as string) || null;
  const adminSecret = (formData.get("adminSecret") as string) || "";

  if (!email || !password || !firstName || !lastName) {
    throw new Error("Bitte alle Pflichtfelder ausfüllen.");
  }

  if (password.length < 8) {
    throw new Error("Das Passwort muss mindestens 8 Zeichen lang sein.");
  }

  const role = accountType === "ADMIN" ? "ADMIN" : "EMPLOYEE";

  if (role === "ADMIN") {
    const requiredSecret = process.env.ADMIN_REGISTRATION_SECRET;
    if (requiredSecret && adminSecret !== requiredSecret) {
      throw new Error("Ungültiger Planer-Registrierungscode.");
    }
  }

  if (role === "EMPLOYEE" && !employeeId) {
    throw new Error("Bitte Ihr Mitarbeiterprofil auswählen.");
  }

  if (role === "EMPLOYEE") {
    const employee = await prisma.employee.findUnique({
      where: { id: employeeId! },
      include: { user: true },
    });
    if (!employee) {
      throw new Error("Mitarbeiterprofil nicht gefunden.");
    }
    if (employee.user) {
      throw new Error("Für dieses Mitarbeiterprofil existiert bereits ein Konto.");
    }
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw new Error("Diese E-Mail-Adresse ist bereits registriert.");
  }

  const user = await prisma.user.create({
    data: {
      email,
      passwordHash: await hashPassword(password),
      firstName,
      lastName,
      role,
      employeeId: role === "EMPLOYEE" ? employeeId : null,
    },
  });

  await createSession({
    userId: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
    employeeId: user.employeeId,
  });

  redirect("/");
}

export async function logout() {
  await destroySession();
  redirect("/login");
}

export async function getUnlinkedEmployees() {
  return prisma.employee.findMany({
    where: { user: null },
    orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
    select: {
      id: true,
      firstName: true,
      lastName: true,
      role: true,
    },
  });
}
