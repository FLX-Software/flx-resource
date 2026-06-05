import { startOfDay, endOfDay, startOfWeek, endOfWeek } from "date-fns";
import { prisma } from "./prisma";

export async function getDashboardStats(date = new Date()) {
  const dayStart = startOfDay(date);
  const dayEnd = endOfDay(date);

  const [
    totalEmployees,
    totalVehicles,
    activeSites,
    todayAssignments,
    employees,
    vehicles,
    sites,
  ] = await Promise.all([
    prisma.employee.count(),
    prisma.vehicle.count(),
    prisma.constructionSite.count({ where: { status: "ACTIVE" } }),
    prisma.assignment.findMany({
      where: { date: { gte: dayStart, lte: dayEnd } },
      include: {
        employee: true,
        vehicle: true,
        site: true,
      },
    }),
    prisma.employee.findMany({ orderBy: { lastName: "asc" } }),
    prisma.vehicle.findMany({ orderBy: { name: "asc" } }),
    prisma.constructionSite.findMany({
      where: { status: { in: ["PLANNED", "ACTIVE"] } },
      orderBy: { startDate: "asc" },
      take: 5,
    }),
  ]);

  const assignedEmployeeIds = new Set(
    todayAssignments.filter((a) => a.employeeId).map((a) => a.employeeId!)
  );
  const assignedVehicleIds = new Set(
    todayAssignments.filter((a) => a.vehicleId).map((a) => a.vehicleId!)
  );

  const availableEmployees = employees.filter(
    (e) => e.status === "AVAILABLE" && !assignedEmployeeIds.has(e.id)
  ).length;

  const employeeUtilization =
    totalEmployees > 0
      ? ((totalEmployees - availableEmployees) / totalEmployees) * 100
      : 0;

  const availableVehicles = vehicles.filter(
    (v) => v.status === "AVAILABLE" && !assignedVehicleIds.has(v.id)
  ).length;

  const vehicleUtilization =
    totalVehicles > 0
      ? ((totalVehicles - availableVehicles) / totalVehicles) * 100
      : 0;

  return {
    totalEmployees,
    totalVehicles,
    activeSites,
    availableEmployees,
    availableVehicles,
    employeeUtilization,
    vehicleUtilization,
    todayAssignments,
    employees,
    vehicles,
    upcomingSites: sites,
  };
}

export async function getEmployees() {
  return prisma.employee.findMany({
    orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
    include: {
      assignments: {
        where: { date: { gte: startOfDay(new Date()) } },
        include: { site: true },
        orderBy: { date: "asc" },
        take: 5,
      },
    },
  });
}

export async function getVehicles() {
  return prisma.vehicle.findMany({
    orderBy: { name: "asc" },
    include: {
      assignments: {
        where: { date: { gte: startOfDay(new Date()) } },
        include: { site: true },
        orderBy: { date: "asc" },
        take: 5,
      },
    },
  });
}

export async function getSites() {
  return prisma.constructionSite.findMany({
    orderBy: { startDate: "desc" },
    include: {
      assignments: {
        include: { employee: true, vehicle: true },
        orderBy: { date: "asc" },
      },
    },
  });
}

export async function getAssignmentsForWeek(date = new Date()) {
  const weekStart = startOfWeek(date, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(date, { weekStartsOn: 1 });

  return prisma.assignment.findMany({
    where: { date: { gte: weekStart, lte: weekEnd } },
    include: {
      employee: true,
      vehicle: true,
      site: true,
    },
    orderBy: { date: "asc" },
  });
}

export async function getAvailableResources(date: Date) {
  const dayStart = startOfDay(date);
  const dayEnd = endOfDay(date);

  const dayAssignments = await prisma.assignment.findMany({
    where: { date: { gte: dayStart, lte: dayEnd } },
  });

  const assignedEmployeeIds = new Set(
    dayAssignments.filter((a) => a.employeeId).map((a) => a.employeeId!)
  );
  const assignedVehicleIds = new Set(
    dayAssignments.filter((a) => a.vehicleId).map((a) => a.vehicleId!)
  );

  const [employees, vehicles, sites] = await Promise.all([
    prisma.employee.findMany({ orderBy: { lastName: "asc" } }),
    prisma.vehicle.findMany({ orderBy: { name: "asc" } }),
    prisma.constructionSite.findMany({
      where: { status: { in: ["PLANNED", "ACTIVE"] } },
      orderBy: { name: "asc" },
    }),
  ]);

  return {
    employees: employees.filter(
      (e) =>
        (e.status === "AVAILABLE" || e.status === "ASSIGNED") &&
        !assignedEmployeeIds.has(e.id)
    ),
    vehicles: vehicles.filter(
      (v) =>
        (v.status === "AVAILABLE" || v.status === "IN_USE") &&
        !assignedVehicleIds.has(v.id)
    ),
    sites,
    assignedEmployeeIds,
    assignedVehicleIds,
  };
}
