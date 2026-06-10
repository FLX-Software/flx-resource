import { PageHeader } from "@/components/layout/page-header";
import { VehicleList } from "@/components/vehicles/vehicle-list";
import { getVehicles } from "@/lib/data";
import { getSession, isAdmin } from "@/lib/session";

export default async function FahrzeugePage() {
  const session = await getSession();
  const admin = isAdmin(session);
  const vehicles = await getVehicles();

  return (
    <div>
      <PageHeader
        title="Fahrzeuge"
        description={
          admin
            ? "Verwalten Sie Ihre Fahrzeugflotte und deren Einsatz."
            : "Übersicht über die Fahrzeugflotte und kommende Einsätze."
        }
      />
      <VehicleList vehicles={vehicles} isAdmin={admin} />
    </div>
  );
}
