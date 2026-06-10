import { endOfDay, startOfDay } from "date-fns";
import { prisma } from "./prisma";

export async function expireEndedSickLeaves() {
  const todayStart = startOfDay(new Date());

  await prisma.employee.updateMany({
    where: {
      status: "SICK",
      sickUntil: { lt: todayStart },
    },
    data: {
      status: "AVAILABLE",
      sickUntil: null,
    },
  });
}

export function parseSickUntilDate(value: string): Date {
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) {
    throw new Error("Ungültiges Datum.");
  }
  const date = new Date(year, month - 1, day);
  if (Number.isNaN(date.getTime())) {
    throw new Error("Ungültiges Datum.");
  }
  return endOfDay(date);
}
