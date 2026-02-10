import { CrudList } from "@/components/admin/crud-list";

export default function AdminCitiesPage() {
  return <CrudList title="Города" endpoint="/api/admin/cities" fields={["name", "slug"]} />;
}