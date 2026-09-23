import { getAdmin } from "@/lib/admin/auth";
import { countMessagesNeedingAttention } from "@/lib/admin/messages";

/**
 * GET /admin/messages/count: the number of contact messages not yet handled, as a bare
 * integer, for the admin bar to refresh on each navigation. Signed-in admins only.
 */
export async function GET() {
  if (!(await getAdmin())) {
    return new Response(null, { status: 401, headers: { "Cache-Control": "no-store" } });
  }
  const count = await countMessagesNeedingAttention();
  return new Response(String(count), {
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" },
  });
}
