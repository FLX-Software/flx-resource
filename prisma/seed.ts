import { PrismaClient } from "@prisma/client";
import { addDays, startOfDay } from "date-fns";

const prisma = new PrismaClient();

async function main() {
  await prisma.assignment.deleteMany();
  await prisma.employee.deleteMany();
  await prisma.vehicle.deleteMany();
  await prisma.constructionSite.deleteMany();

  const today = startOfDay(new Date());

  const employees = await Promise.all([
    prisma.employee.create({
      data: {
        firstName: "Marco",
        lastName: "Fluck",
        role: "Produktionsleiter",
        phone: "+41 79 123 45 67",
        email: "marco.fluck@fluck-holzbau.ch",
        skills: "Zimmermann, Planung, Kranführung",
        status: "AVAILABLE",
      },
    }),
    prisma.employee.create({
      data: {
        firstName: "Thomas",
        lastName: "Meier",
        role: "Zimmermann",
        phone: "+41 79 234 56 78",
        skills: "Holzbau, Dachstuhl",
        status: "AVAILABLE",
      },
    }),
    prisma.employee.create({
      data: {
        firstName: "Simon",
        lastName: "Keller",
        role: "Zimmermann",
        phone: "+41 79 345 67 89",
        skills: "Fassade, Verkleidung",
        status: "AVAILABLE",
      },
    }),
    prisma.employee.create({
      data: {
        firstName: "Lukas",
        lastName: "Brunner",
        role: "Lehrling",
        skills: "Holzbau Grundlagen",
        status: "AVAILABLE",
      },
    }),
    prisma.employee.create({
      data: {
        firstName: "Andreas",
        lastName: "Schmid",
        role: "Zimmermann",
        skills: "Montage, Kran",
        status: "VACATION",
      },
    }),
    prisma.employee.create({
      data: {
        firstName: "Peter",
        lastName: "Weber",
        role: "Logistik",
        skills: "Transport, Lager",
        status: "AVAILABLE",
      },
    }),
  ]);

  const vehicles = await Promise.all([
    prisma.vehicle.create({
      data: {
        name: "Lieferwagen 1",
        licensePlate: "SG 123456",
        type: "Lieferwagen",
        capacity: "3.5t",
        status: "AVAILABLE",
      },
    }),
    prisma.vehicle.create({
      data: {
        name: "Kranwagen",
        licensePlate: "SG 234567",
        type: "Kranwagen",
        capacity: "25t",
        status: "AVAILABLE",
      },
    }),
    prisma.vehicle.create({
      data: {
        name: "Anhänger Holz",
        licensePlate: "SG 345678",
        type: "Anhänger",
        capacity: "12t",
        status: "AVAILABLE",
      },
    }),
    prisma.vehicle.create({
      data: {
        name: "Transporter Team",
        licensePlate: "SG 456789",
        type: "Transporter",
        capacity: "7 Sitze",
        status: "MAINTENANCE",
      },
    }),
  ]);

  const sites = await Promise.all([
    prisma.constructionSite.create({
      data: {
        name: "Einfamilienhaus Müller",
        address: "Bergstrasse 12, 9000 St. Gallen",
        client: "Familie Müller",
        startDate: addDays(today, -5),
        endDate: addDays(today, 20),
        status: "ACTIVE",
        description: "Holzrahmenbau EFH, 2 Stockwerke",
      },
    }),
    prisma.constructionSite.create({
      data: {
        name: "Mehrfamilienhaus Sonnenhof",
        address: "Sonnenweg 4, 9500 Wil",
        client: "Sonnenhof AG",
        startDate: addDays(today, 3),
        endDate: addDays(today, 60),
        status: "PLANNED",
        description: "MFH mit 8 Wohnungen",
      },
    }),
    prisma.constructionSite.create({
      data: {
        name: "Dachsanierung Schule",
        address: "Schulhausplatz 1, 9200 Gossau",
        client: "Gemeinde Gossau",
        startDate: addDays(today, -2),
        endDate: addDays(today, 10),
        status: "ACTIVE",
        description: "Dachstuhl-Sanierung",
      },
    }),
  ]);

  await prisma.assignment.createMany({
    data: [
      {
        siteId: sites[0].id,
        employeeId: employees[1].id,
        vehicleId: vehicles[0].id,
        date: today,
        notes: "Montage OG",
      },
      {
        siteId: sites[0].id,
        employeeId: employees[2].id,
        date: today,
        notes: "Fassadenarbeiten",
      },
      {
        siteId: sites[2].id,
        employeeId: employees[3].id,
        vehicleId: vehicles[1].id,
        date: today,
        notes: "Kranarbeiten Dach",
      },
      {
        siteId: sites[0].id,
        employeeId: employees[1].id,
        vehicleId: vehicles[0].id,
        date: addDays(today, 1),
      },
    ],
  });

  await prisma.employee.update({
    where: { id: employees[1].id },
    data: { status: "ASSIGNED" },
  });
  await prisma.employee.update({
    where: { id: employees[2].id },
    data: { status: "ASSIGNED" },
  });
  await prisma.employee.update({
    where: { id: employees[3].id },
    data: { status: "ASSIGNED" },
  });
  await prisma.vehicle.update({
    where: { id: vehicles[0].id },
    data: { status: "IN_USE" },
  });
  await prisma.vehicle.update({
    where: { id: vehicles[1].id },
    data: { status: "IN_USE" },
  });

  console.log("Demo-Daten erfolgreich erstellt.");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
