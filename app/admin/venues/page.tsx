import { CrudList } from "@/components/admin/crud-list";

export default function AdminVenuesPage() {
  return <CrudList title="Площадки" endpoint="/api/admin/venues" fields={["name", "cityId", "address", "lat", "lng"]} />;
}
