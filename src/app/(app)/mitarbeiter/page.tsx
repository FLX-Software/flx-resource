import { PageHeader } from "@/components/layout/page-header";
import { EmployeeList } from "@/components/employees/employee-list";
import { getEmployees } from "@/lib/data";

export default async function MitarbeiterPage() {
  const employees = await getEmployees();

  return (
    <div>
      <PageHeader
        title="Mitarbeiter"
        description="Verwalten Sie Ihr Team und deren Verfügbarkeit."
      />
      <EmployeeList employees={employees} />
    </div>
  );
}
