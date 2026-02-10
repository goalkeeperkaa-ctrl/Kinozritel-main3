import { CrudList } from "@/components/admin/crud-list";

export default function AdminEventsPage() {
  return <CrudList title="События" endpoint="/api/admin/events" fields={["cityId", "venueId", "slug", "title", "description", "priceFrom", "coverUrl", "categoryIds"]} />;
}
