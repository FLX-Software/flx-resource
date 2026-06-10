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
  AVAILABLE: "bg-emerald-500/15 text-emerald-400",
  ASSIGNED: "bg-orange-500/15 text-orange-400",
  VACATION: "bg-amber-500/15 text-amber-400",
  SICK: "bg-red-500/15 text-red-400",
  UNAVAILABLE: "bg-slate-500/15 text-slate-400",
};

export const vehicleStatusColors: Record<VehicleStatus, string> = {
  AVAILABLE: "bg-emerald-500/15 text-emerald-400",
  IN_USE: "bg-flx-blue/15 text-flx-blue-light",
  MAINTENANCE: "bg-amber-500/15 text-amber-400",
  UNAVAILABLE: "bg-slate-500/15 text-slate-400",
};

export const siteStatusColors: Record<SiteStatus, string> = {
  PLANNED: "bg-slate-500/15 text-slate-400",
  ACTIVE: "bg-emerald-500/15 text-emerald-400",
  COMPLETED: "bg-flx-blue/15 text-flx-blue-light",
  PAUSED: "bg-amber-500/15 text-amber-400",
};
