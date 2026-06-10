"use server";

import { revalidatePath } from "next/cache";
import { startOfDay } from "date-fns";
import type { EmployeeStatus, SiteStatus, VehicleStatus } from "@prisma/client";
import { prisma } from "./prisma";
import {
  deleteEmployeePhoto,
  saveEmployeePhoto,
} from "./employee-photo";
import {
  deleteVehiclePhoto,
  saveVehiclePhoto,
} from "./vehicle-photo";
import {
  DEFAULT_END_MINUTES,
  DEFAULT_START_MINUTES,
  normalizeRange,
  rangesOverlap,
  timeToMinutes,
} from "./planning-time";

function revalidateAll() {
  revalidatePath("/");
  revalidatePath("/mitarbeiter");
  revalidatePath("/fahrzeuge");
  revalidatePath("/baustellen");
  revalidatePath("/planung");
}

// --- Mitarbeiter ---

export async function createEmployee(formData: FormData) {
  const photo = formData.get("photo");

  const employee = await prisma.employee.create({
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

  try {
    if (photo instanceof File && photo.size > 0) {
      const photoUrl = await saveEmployeePhoto(photo, employee.id);
      await prisma.employee.update({
        where: { id: employee.id },
        data: { photoUrl },
      });
    }
  } catch (error) {
    await prisma.employee.delete({ where: { id: employee.id } });
    throw error;
  }

  revalidateAll();
}

export async function updateEmployee(id: string, formData: FormData) {
  const existing = await prisma.employee.findUnique({ where: { id } });
  if (!existing) return;

  const photo = formData.get("photo");
  const removePhoto = formData.get("removePhoto") === "true";
  let photoUrl = existing.photoUrl;

  if (removePhoto && existing.photoUrl) {
    await deleteEmployeePhoto(existing.photoUrl);
    photoUrl = null;
  } else if (photo instanceof File && photo.size > 0) {
    if (existing.photoUrl) {
      await deleteEmployeePhoto(existing.photoUrl);
    }
    photoUrl = await saveEmployeePhoto(photo, id);
  }

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
      photoUrl,
    },
  });
  revalidateAll();
}

export async function deleteEmployee(id: string) {
  const employee = await prisma.employee.findUnique({ where: { id } });
  if (employee?.photoUrl) {
    await deleteEmployeePhoto(employee.photoUrl);
  }
  await prisma.employee.delete({ where: { id } });
  revalidateAll();
}

// --- Fahrzeuge ---

export async function createVehicle(formData: FormData) {
  const photo = formData.get("photo");

  const vehicle = await prisma.vehicle.create({
    data: {
      name: formData.get("name") as string,
      licensePlate: formData.get("licensePlate") as string,
      type: formData.get("type") as string,
      capacity: (formData.get("capacity") as string) || null,
      status: (formData.get("status") as VehicleStatus) || "AVAILABLE",
    },
  });

  try {
    if (photo instanceof File && photo.size > 0) {
      const photoUrl = await saveVehiclePhoto(photo, vehicle.id);
      await prisma.vehicle.update({
        where: { id: vehicle.id },
        data: { photoUrl },
      });
    }
  } catch (error) {
    await prisma.vehicle.delete({ where: { id: vehicle.id } });
    throw error;
  }

  revalidateAll();
}

export async function updateVehicle(id: string, formData: FormData) {
  const existing = await prisma.vehicle.findUnique({ where: { id } });
  if (!existing) return;

  const photo = formData.get("photo");
  const removePhoto = formData.get("removePhoto") === "true";
  let photoUrl = existing.photoUrl;

  if (removePhoto && existing.photoUrl) {
    await deleteVehiclePhoto(existing.photoUrl);
    photoUrl = null;
  } else if (photo instanceof File && photo.size > 0) {
    if (existing.photoUrl) {
      await deleteVehiclePhoto(existing.photoUrl);
    }
    photoUrl = await saveVehiclePhoto(photo, id);
  }

  await prisma.vehicle.update({
    where: { id },
    data: {
      name: formData.get("name") as string,
      licensePlate: formData.get("licensePlate") as string,
      type: formData.get("type") as string,
      capacity: (formData.get("capacity") as string) || null,
      status: formData.get("status") as VehicleStatus,
      photoUrl,
    },
  });
  revalidateAll();
}

export async function deleteVehicle(id: string) {
  const vehicle = await prisma.vehicle.findUnique({ where: { id } });
  if (vehicle?.photoUrl) {
    await deleteVehiclePhoto(vehicle.photoUrl);
  }
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

async function assertNoEmployeeOverlap(
  employeeId: string,
  date: Date,
  startMinutes: number,
  endMinutes: number,
  excludeId?: string
) {
  const existing = await prisma.assignment.findMany({
    where: {
      employeeId,
      date,
      ...(excludeId ? { id: { not: excludeId } } : {}),
    },
  });

  const conflict = existing.find((a) =>
    rangesOverlap(a.startMinutes, a.endMinutes, startMinutes, endMinutes)
  );

  if (conflict) {
    throw new Error("Der Mitarbeiter ist in diesem Zeitraum bereits eingeteilt.");
  }
}

export async function createAssignment(formData: FormData) {
  const employeeId = (formData.get("employeeId") as string) || null;
  const vehicleId = (formData.get("vehicleId") as string) || null;
  const siteId = formData.get("siteId") as string;
  const date = startOfDay(new Date(formData.get("date") as string));
  const notes = (formData.get("notes") as string) || null;
  const startTime = (formData.get("startTime") as string) || "";
  const endTime = (formData.get("endTime") as string) || "";
  const startRaw = Number(formData.get("startMinutes"));
  const endRaw = Number(formData.get("endMinutes"));
  const { startMinutes, endMinutes } = normalizeRange(
    startTime
      ? timeToMinutes(startTime)
      : Number.isFinite(startRaw)
        ? startRaw
        : DEFAULT_START_MINUTES,
    endTime
      ? timeToMinutes(endTime)
      : Number.isFinite(endRaw)
        ? endRaw
        : DEFAULT_END_MINUTES
  );

  if (!employeeId && !vehicleId) {
    throw new Error("Mindestens Mitarbeiter oder Fahrzeug muss zugewiesen werden.");
  }

  if (employeeId) {
    await assertNoEmployeeOverlap(employeeId, date, startMinutes, endMinutes);
  }

  await prisma.assignment.create({
    data: {
      siteId,
      date,
      notes,
      startMinutes,
      endMinutes,
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

export async function createDragAssignment(data: {
  employeeId: string;
  siteId: string;
  date: string;
  startMinutes: number;
  endMinutes: number;
}) {
  const date = startOfDay(new Date(data.date));
  const { startMinutes, endMinutes } = normalizeRange(
    data.startMinutes,
    data.endMinutes
  );

  await assertNoEmployeeOverlap(data.employeeId, date, startMinutes, endMinutes);

  await prisma.assignment.create({
    data: {
      siteId: data.siteId,
      date,
      employeeId: data.employeeId,
      startMinutes,
      endMinutes,
    },
  });

  await prisma.employee.update({
    where: { id: data.employeeId },
    data: { status: "ASSIGNED" },
  });

  revalidateAll();
}

export async function updateAssignmentSchedule(data: {
  id: string;
  startMinutes?: number;
  endMinutes?: number;
}) {
  const assignment = await prisma.assignment.findUnique({
    where: { id: data.id },
  });

  if (!assignment) {
    throw new Error("Zuweisung nicht gefunden.");
  }

  const { startMinutes, endMinutes } = normalizeRange(
    data.startMinutes ?? assignment.startMinutes,
    data.endMinutes ?? assignment.endMinutes
  );

  if (assignment.employeeId) {
    await assertNoEmployeeOverlap(
      assignment.employeeId,
      assignment.date,
      startMinutes,
      endMinutes,
      assignment.id
    );
  }

  await prisma.assignment.update({
    where: { id: data.id },
    data: { startMinutes, endMinutes },
  });

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
