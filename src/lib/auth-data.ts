import { prisma } from "./prisma";

export async function getUsersForAdmin() {
  return prisma.user.findMany({
    orderBy: [{ role: "asc" }, { lastName: "asc" }, { firstName: "asc" }],
    include: {
      employee: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          role: true,
        },
      },
    },
  });
}

export async function getEmployeesForUserLink() {
  return prisma.employee.findMany({
    orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
    select: {
      id: true,
      firstName: true,
      lastName: true,
      role: true,
      user: { select: { id: true } },
    },
  });
}
