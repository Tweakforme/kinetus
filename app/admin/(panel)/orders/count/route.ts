import { getAdmin } from "@/lib/admin/auth";
import { countOrdersNeedingAttention } from "@/lib/admin/orders";

/**
 * GET /admin/orders/count: the number of orders needing attention, as a bare integer, for
 * the admin bar to refresh on each navigation. Signed-in admins only; never cached.
 */
export async function GET() {
  if (!(await getAdmin())) {
    return new Response(null, { status: 401, headers: { "Cache-Control": "no-store" } });
  }
  const count = await countOrdersNeedingAttention();
  return new Response(String(count), {
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" },
  });
}
