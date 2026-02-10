import { CrudList } from "@/components/admin/crud-list";

export default function AdminOccurrencesPage() {
  return <CrudList title="Расписание" endpoint="/api/admin/occurrences" fields={["eventId", "startsAt", "endsAt"]} />;
}
