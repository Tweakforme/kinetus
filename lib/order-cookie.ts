/**
 * Set when an order is placed, holding its reference. The confirmation page shows the
 * order's contents only to the browser that placed it: references are sequential, so a
 * guessed URL must not reveal what someone else ordered.
 */
export const ORDER_COOKIE = "kinetus_order";
export const ORDER_COOKIE_PATH = "/checkout/confirmation";
