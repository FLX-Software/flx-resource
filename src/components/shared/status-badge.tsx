import { Badge } from "@/components/ui/badge";
import {
  employeeStatusLabels,
  employeeStatusColors,
  vehicleStatusLabels,
  vehicleStatusColors,
  siteStatusLabels,
  siteStatusColors,
} from "@/lib/labels";
import type { EmployeeStatus, VehicleStatus, SiteStatus } from "@prisma/client";

type StatusType = "employee" | "vehicle" | "site";

interface StatusBadgeProps {
  type: StatusType;
  status: EmployeeStatus | VehicleStatus | SiteStatus;
}

export function StatusBadge({ type, status }: StatusBadgeProps) {
  const labels =
    type === "employee"
      ? employeeStatusLabels
      : type === "vehicle"
        ? vehicleStatusLabels
        : siteStatusLabels;

  const colors =
    type === "employee"
      ? employeeStatusColors
      : type === "vehicle"
        ? vehicleStatusColors
        : siteStatusColors;

  return (
    <Badge className={colors[status as keyof typeof colors]}>
      {labels[status as keyof typeof labels]}
    </Badge>
  );
}
