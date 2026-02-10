import { CrudList } from "@/components/admin/crud-list";

export default function AdminCategoriesPage() {
  return <CrudList title="Категории" endpoint="/api/admin/categories" fields={["name", "slug"]} />;
}