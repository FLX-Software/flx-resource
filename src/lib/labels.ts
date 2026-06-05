import type { EmployeeStatus, SiteStatus, VehicleStatus } from "@prisma/client";

export const employeeStatusLabels: Record<EmployeeStatus, string> = {
  AVAILABLE: "Verfügbar",
  ASSIGNED: "Eingesetzt",
  VACATION: "Ferien",
  SICK: "Krank",
  UNAVAILABLE: "Nicht verfügbar",
};

export const vehicleStatusLabels: Record<VehicleStatus, string> = {
  AVAILABLE: "Verfügbar",
  IN_USE: "Im Einsatz",
  MAINTENANCE: "Wartung",
  UNAVAILABLE: "Nicht verfügbar",
};

export const siteStatusLabels: Record<SiteStatus, string> = {
  PLANNED: "Geplant",
  ACTIVE: "Aktiv",
  COMPLETED: "Abgeschlossen",
  PAUSED: "Pausiert",
};

export const employeeStatusColors: Record<EmployeeStatus, string> = {
  AVAILABLE: "bg-emerald-100 text-emerald-800",
  ASSIGNED: "bg-blue-100 text-blue-800",
  VACATION: "bg-amber-100 text-amber-800",
  SICK: "bg-red-100 text-red-800",
  UNAVAILABLE: "bg-slate-100 text-slate-600",
};

export const vehicleStatusColors: Record<VehicleStatus, string> = {
  AVAILABLE: "bg-emerald-100 text-emerald-800",
  IN_USE: "bg-blue-100 text-blue-800",
  MAINTENANCE: "bg-amber-100 text-amber-800",
  UNAVAILABLE: "bg-slate-100 text-slate-600",
};

export const siteStatusColors: Record<SiteStatus, string> = {
  PLANNED: "bg-slate-100 text-slate-700",
  ACTIVE: "bg-emerald-100 text-emerald-800",
  COMPLETED: "bg-blue-100 text-blue-800",
  PAUSED: "bg-amber-100 text-amber-800",
};
