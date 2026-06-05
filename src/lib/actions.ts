"use server";

import { revalidatePath } from "next/cache";
import { startOfDay } from "date-fns";
import type { EmployeeStatus, SiteStatus, VehicleStatus } from "@prisma/client";
import { prisma } from "./prisma";

function revalidateAll() {
  revalidatePath("/");
  revalidatePath("/mitarbeiter");
  revalidatePath("/fahrzeuge");
  revalidatePath("/baustellen");
  revalidatePath("/planung");
}

// --- Mitarbeiter ---

export async function createEmployee(formData: FormData) {
  await prisma.employee.create({
    data: {
      firstName: formData.get("firstName") as string,
      lastName: formData.get("lastName") as string,
      role: formData.get("role") as string,
      phone: (formData.get("phone") as string) || null,
      email: (formData.get("email") as string) || null,
      skills: (formData.get("skills") as string) || null,
      status: (formData.get("status") as EmployeeStatus) || "AVAILABLE",
    },
  });
  revalidateAll();
}

export async function updateEmployee(id: string, formData: FormData) {
  await prisma.employee.update({
    where: { id },
    data: {
      firstName: formData.get("firstName") as string,
      lastName: formData.get("lastName") as string,
      role: formData.get("role") as string,
      phone: (formData.get("phone") as string) || null,
      email: (formData.get("email") as string) || null,
      skills: (formData.get("skills") as string) || null,
      status: formData.get("status") as EmployeeStatus,
    },
  });
  revalidateAll();
}

export async function deleteEmployee(id: string) {
  await prisma.employee.delete({ where: { id } });
  revalidateAll();
}

// --- Fahrzeuge ---

export async function createVehicle(formData: FormData) {
  await prisma.vehicle.create({
    data: {
      name: formData.get("name") as string,
      licensePlate: formData.get("licensePlate") as string,
      type: formData.get("type") as string,
      capacity: (formData.get("capacity") as string) || null,
      status: (formData.get("status") as VehicleStatus) || "AVAILABLE",
    },
  });
  revalidateAll();
}

export async function updateVehicle(id: string, formData: FormData) {
  await prisma.vehicle.update({
    where: { id },
    data: {
      name: formData.get("name") as string,
      licensePlate: formData.get("licensePlate") as string,
      type: formData.get("type") as string,
      capacity: (formData.get("capacity") as string) || null,
      status: formData.get("status") as VehicleStatus,
    },
  });
  revalidateAll();
}

export async function deleteVehicle(id: string) {
  await prisma.vehicle.delete({ where: { id } });
  revalidateAll();
}

// --- Baustellen ---

export async function createSite(formData: FormData) {
  await prisma.constructionSite.create({
    data: {
      name: formData.get("name") as string,
      address: formData.get("address") as string,
      client: (formData.get("client") as string) || null,
      description: (formData.get("description") as string) || null,
      startDate: new Date(formData.get("startDate") as string),
      endDate: formData.get("endDate")
        ? new Date(formData.get("endDate") as string)
        : null,
      status: (formData.get("status") as SiteStatus) || "PLANNED",
    },
  });
  revalidateAll();
}

export async function updateSite(id: string, formData: FormData) {
  await prisma.constructionSite.update({
    where: { id },
    data: {
      name: formData.get("name") as string,
      address: formData.get("address") as string,
      client: (formData.get("client") as string) || null,
      description: (formData.get("description") as string) || null,
      startDate: new Date(formData.get("startDate") as string),
      endDate: formData.get("endDate")
        ? new Date(formData.get("endDate") as string)
        : null,
      status: formData.get("status") as SiteStatus,
    },
  });
  revalidateAll();
}

export async function deleteSite(id: string) {
  await prisma.constructionSite.delete({ where: { id } });
  revalidateAll();
}

// --- Zuweisungen ---

export async function createAssignment(formData: FormData) {
  const employeeId = (formData.get("employeeId") as string) || null;
  const vehicleId = (formData.get("vehicleId") as string) || null;
  const siteId = formData.get("siteId") as string;
  const date = startOfDay(new Date(formData.get("date") as string));
  const notes = (formData.get("notes") as string) || null;

  if (!employeeId && !vehicleId) {
    throw new Error("Mindestens Mitarbeiter oder Fahrzeug muss zugewiesen werden.");
  }

  await prisma.assignment.create({
    data: {
      siteId,
      date,
      notes,
      employeeId: employeeId || undefined,
      vehicleId: vehicleId || undefined,
    },
  });

  if (employeeId) {
    await prisma.employee.update({
      where: { id: employeeId },
      data: { status: "ASSIGNED" },
    });
  }
  if (vehicleId) {
    await prisma.vehicle.update({
      where: { id: vehicleId },
      data: { status: "IN_USE" },
    });
  }

  revalidateAll();
}

export async function deleteAssignment(id: string) {
  const assignment = await prisma.assignment.findUnique({
    where: { id },
    include: { employee: true, vehicle: true },
  });

  if (!assignment) return;

  await prisma.assignment.delete({ where: { id } });

  if (assignment.employeeId) {
    const otherAssignments = await prisma.assignment.count({
      where: {
        employeeId: assignment.employeeId,
        date: { gte: startOfDay(new Date()) },
      },
    });
    if (otherAssignments === 0) {
      await prisma.employee.update({
        where: { id: assignment.employeeId },
        data: { status: "AVAILABLE" },
      });
    }
  }

  if (assignment.vehicleId) {
    const otherAssignments = await prisma.assignment.count({
      where: {
        vehicleId: assignment.vehicleId,
        date: { gte: startOfDay(new Date()) },
      },
    });
    if (otherAssignments === 0) {
      await prisma.vehicle.update({
        where: { id: assignment.vehicleId },
        data: { status: "AVAILABLE" },
      });
    }
  }

  revalidateAll();
}
