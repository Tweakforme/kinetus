import { cartItemCount } from "@/lib/cart";

/**
 * GET /api/cart/count: the number of units in the visitor's cart, as a bare integer. The
 * header fetches it in the browser so catalogue pages stay statically rendered. Nothing
 * else about the cart is exposed here.
 */
export async function GET() {
  const count = await cartItemCount();
  return Response.json(count, {
    headers: { "Cache-Control": "no-store", "X-Robots-Tag": "noindex" },
  });
}
