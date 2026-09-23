import { redirect } from "next/navigation";
import { ADMIN_HOME, requireAdmin } from "@/lib/admin/auth";

/** /admin opens the orders list. */
export default async function AdminIndexPage() {
  await requireAdmin();
  redirect(ADMIN_HOME);
}
