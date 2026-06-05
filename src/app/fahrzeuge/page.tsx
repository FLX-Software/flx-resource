import { PageHeader } from "@/components/layout/page-header";
import { VehicleList } from "@/components/vehicles/vehicle-list";
import { getVehicles } from "@/lib/data";

export default async function FahrzeugePage() {
  const vehicles = await getVehicles();

  return (
    <div>
      <PageHeader
        title="Fahrzeuge"
        description="Verwalten Sie Ihre Fahrzeugflotte und deren Einsatz."
      />
      <VehicleList vehicles={vehicles} />
    </div>
  );
}
