import { PageHeader } from "@/components/layout/page-header";
import { EmployeeList } from "@/components/employees/employee-list";
import { getEmployees } from "@/lib/data";
import { getSession, isAdmin } from "@/lib/session";

export default async function MitarbeiterPage() {
  const session = await getSession();
  const admin = isAdmin(session);
  const employees = await getEmployees();

  return (
    <div>
      <PageHeader
        title="Mitarbeiter"
        description={
          admin
            ? "Verwalten Sie Ihr Team und deren Verfügbarkeit."
            : "Übersicht über das Team und kommende Einsätze."
        }
      />
      <EmployeeList employees={employees} isAdmin={admin} />
    </div>
  );
}
