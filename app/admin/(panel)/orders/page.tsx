import type { Prisma } from "@prisma/client";
import type { Metadata } from "next";
import Link from "next/link";
import { OrderStatusBadge, WarningBadge } from "@/components/admin/Badges";
import styles from "@/components/admin/admin.module.css";
import { requireAdmin } from "@/lib/admin/auth";
import { formatStoreDate, formatStoreDateTime } from "@/lib/admin/forms";
import { prisma } from "@/lib/db";
import { emailConfigured } from "@/lib/order-email";
import {
  ATTENTION_STATUSES,
  isOrderStatus,
  ORDER_STATUS_LABEL,
  ORDER_STATUSES,
  type OrderStatus,
} from "@/lib/order-status";
import { formatCad } from "@/lib/pricing";

export const metadata: Metadata = { title: "Orders" };

const PAGE_SIZE = 50;
/** Status filter value for New and Awaiting payment together. */
const ATTENTION = "attention";

const SORTS = {
  "placed-desc": { label: "Newest first", orderBy: [{ createdAt: "desc" }] },
  "placed-asc": { label: "Oldest first", orderBy: [{ createdAt: "asc" }] },
  "total-desc": {
    label: "Highest total first",
    orderBy: [{ totalCents: "desc" }, { createdAt: "desc" }],
  },
  "total-asc": {
    label: "Lowest total first",
    orderBy: [{ totalCents: "asc" }, { createdAt: "desc" }],
  },
} satisfies Record<
  string,
  { label: string; orderBy: Prisma.OrderRequestOrderByWithRelationInput[] }
>;

type SortKey = keyof typeof SORTS;
const DEFAULT_SORT: SortKey = "placed-desc";

function first(value: string | string[] | undefined): string {
  return (Array.isArray(value) ? value[0] : value)?.trim() ?? "";
}

/**
 * /admin/orders: every order, newest first. Orders waiting on the client are counted at
 * the top, and any order whose customer was never emailed is flagged on its row: until
 * email is set up, this page is how the client learns an order exists.
 */
export default async function AdminOrdersPage({ searchParams }: PageProps<"/admin/orders">) {
  await requireAdmin();
  const params = await searchParams;
  const query = first(params.q).slice(0, 100);
  const statusParam = first(params.status);
  const status: OrderStatus | typeof ATTENTION | "" =
    statusParam === ATTENTION || isOrderStatus(statusParam) ? statusParam : "";
  const sortParam = first(params.sort);
  const sort: SortKey = sortParam in SORTS ? (sortParam as SortKey) : DEFAULT_SORT;
  const requestedPage = Number.parseInt(first(params.page), 10);

  const where: Prisma.OrderRequestWhereInput = {
    ...(status === ATTENTION ? { status: { in: ATTENTION_STATUSES } } : status ? { status } : {}),
    ...(query
      ? {
          OR: [
            { referenceNumber: { contains: query, mode: "insensitive" } },
            { customerName: { contains: query, mode: "insensitive" } },
            { customerEmail: { contains: query, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  const [byStatus, matching] = await Promise.all([
    prisma.orderRequest.groupBy({ by: ["status"], _count: { _all: true } }),
    prisma.orderRequest.count({ where }),
  ]);
  const pages = Math.max(1, Math.ceil(matching / PAGE_SIZE));
  const page =
    Number.isInteger(requestedPage) && requestedPage > 1 ? Math.min(requestedPage, pages) : 1;
  const orders = await prisma.orderRequest.findMany({
    where,
    orderBy: SORTS[sort].orderBy,
    skip: (page - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
    select: {
      id: true,
      referenceNumber: true,
      status: true,
      createdAt: true,
      customerName: true,
      customerEmail: true,
      totalCents: true,
      notificationSentAt: true,
      items: { select: { quantity: true } },
    },
  });

  const counts = Object.fromEntries(ORDER_STATUSES.map((value) => [value, 0])) as Record<
    OrderStatus,
    number
  >;
  for (const row of byStatus) {
    counts[row.status] = row._count._all;
  }
  const totalOrders = ORDER_STATUSES.reduce((sum, value) => sum + counts[value], 0);
  const attention = ATTENTION_STATUSES.reduce((sum, value) => sum + counts[value], 0);
  const filtered = Boolean(query || status);

  const pageHref = (target: number) => {
    const search = new URLSearchParams();
    if (query) {
      search.set("q", query);
    }
    if (status) {
      search.set("status", status);
    }
    if (sort !== DEFAULT_SORT) {
      search.set("sort", sort);
    }
    if (target > 1) {
      search.set("page", String(target));
    }
    const text = search.toString();
    return text ? `/admin/orders?${text}` : "/admin/orders";
  };

  return (
    <>
      <div className={styles.pageHeader}>
        <div className={styles.pageHeaderText}>
          <h1 className={styles.pageTitle}>Orders</h1>
          <p className={styles.pageIntro}>
            Every order placed at checkout. Select one to see the customer, the items and the
            address, and to move it from received to shipped.
          </p>
        </div>
      </div>

      {attention > 0 ? (
        <section className={styles.attention} aria-labelledby="attention-heading">
          <p className={styles.attentionCount} aria-hidden="true">
            {attention}
          </p>
          <div>
            <h2 id="attention-heading" className={styles.attentionTitle}>
              {attention === 1 ? "1 order needs attention" : `${attention} orders need attention`}
            </h2>
            <ul className={styles.attentionLinks}>
              <li>
                <Link href="/admin/orders?status=NEW">{counts.NEW} new</Link>
              </li>
              <li>
                <Link href="/admin/orders?status=AWAITING_PAYMENT">
                  {counts.AWAITING_PAYMENT} awaiting payment
                </Link>
              </li>
            </ul>
          </div>
        </section>
      ) : (
        <p className={styles.attentionClear}>
          No orders need attention. New orders and orders awaiting payment are counted here.
        </p>
      )}

      {!emailConfigured() && (
        <div className={`${styles.notice} ${styles.noticeError}`}>
          <p className={styles.noticeTitle}>Order emails are not being sent.</p>
          <p>
            Email is not set up on this server (RESEND_API_KEY is missing), so no order email
            reaches you or your customers. Check this page for new orders, and contact each customer
            directly.
          </p>
        </div>
      )}

      <form
        method="get"
        className={`${styles.filters} ${styles.orderFilters}`}
        role="search"
        aria-label="Find orders"
      >
        <div className={styles.field}>
          <label htmlFor="filter-q" className={styles.label}>
            Search by reference, name or email
          </label>
          <input
            id="filter-q"
            name="q"
            type="search"
            defaultValue={query}
            className={styles.input}
            autoComplete="off"
          />
        </div>
        <div className={styles.field}>
          <label htmlFor="filter-status" className={styles.label}>
            Status
          </label>
          <select id="filter-status" name="status" defaultValue={status} className={styles.select}>
            <option value="">All ({totalOrders})</option>
            <option value={ATTENTION}>Needs attention ({attention})</option>
            {ORDER_STATUSES.map((value) => (
              <option key={value} value={value}>
                {ORDER_STATUS_LABEL[value]} ({counts[value]})
              </option>
            ))}
          </select>
        </div>
        <div className={styles.field}>
          <label htmlFor="filter-sort" className={styles.label}>
            Sort
          </label>
          <select id="filter-sort" name="sort" defaultValue={sort} className={styles.select}>
            {Object.entries(SORTS).map(([key, option]) => (
              <option key={key} value={key}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <button type="submit" className={`${styles.button} ${styles.secondary}`}>
          Apply
        </button>
      </form>

      <p className={styles.resultCount} aria-live="polite">
        {matching} {matching === 1 ? "order" : "orders"}
        {filtered && (
          <>
            {" "}
            {matching === 1 ? "matches" : "match"}.{" "}
            <Link href="/admin/orders" className={styles.textButton}>
              Clear filters
            </Link>
          </>
        )}
      </p>

      {orders.length === 0 ? (
        <div className={styles.records}>
          <p className={styles.empty}>
            {totalOrders === 0
              ? "No orders yet. Orders placed at checkout appear here straight away."
              : "No orders match. Try another search or clear the filters."}
          </p>
        </div>
      ) : (
        <ul className={`${styles.records} ${styles.orderRecords}`} aria-label="Orders">
          <li className={styles.recordsHead} aria-hidden="true">
            <span>Order</span>
            <span>Customer</span>
            <span>Items</span>
            <span>Total</span>
            <span>Status</span>
            <span>Customer emailed</span>
          </li>
          {orders.map((order) => {
            const units = order.items.reduce((sum, item) => sum + item.quantity, 0);
            return (
              <li key={order.id} className={styles.record}>
                <div className={styles.recordCell}>
                  <Link
                    href={`/admin/orders/${order.referenceNumber}`}
                    className={styles.recordName}
                  >
                    {order.referenceNumber}
                  </Link>
                  <span className={styles.recordSub}>
                    Placed {formatStoreDateTime(order.createdAt)}
                  </span>
                </div>
                <div className={styles.recordMeta}>
                  <span className={styles.recordCell}>
                    <span className={styles.recordLabel}>Customer: </span>
                    <span className={styles.recordStrong}>{order.customerName}</span>
                    <span className={styles.recordSub}>{order.customerEmail}</span>
                  </span>
                  <span className={styles.recordCell}>
                    <span className={styles.recordLabel}>Items: </span>
                    <span className={styles.mono}>{units}</span>
                  </span>
                  <span className={styles.recordCell}>
                    <span className={styles.recordLabel}>Total: </span>
                    <span className={styles.mono}>{formatCad(order.totalCents)}</span>
                  </span>
                  <span className={styles.recordCell}>
                    <span className={styles.recordLabel}>Status: </span>
                    <OrderStatusBadge status={order.status} />
                  </span>
                  <span className={styles.recordCell}>
                    <span className={styles.recordLabel}>Customer emailed: </span>
                    {order.notificationSentAt ? (
                      <>Yes, {formatStoreDate(order.notificationSentAt)}</>
                    ) : (
                      <>
                        <WarningBadge>Not emailed</WarningBadge>
                        <span className={styles.recordWarn}>
                          The customer was not emailed automatically. Contact them directly.
                        </span>
                      </>
                    )}
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {pages > 1 && (
        <nav className={styles.pager} aria-label="Order pages">
          {page > 1 ? (
            <Link href={pageHref(page - 1)} className={`${styles.button} ${styles.secondary}`}>
              Previous
            </Link>
          ) : (
            <span />
          )}
          <p className={styles.pagerText}>
            Page {page} of {pages}
          </p>
          {page < pages ? (
            <Link href={pageHref(page + 1)} className={`${styles.button} ${styles.secondary}`}>
              Next
            </Link>
          ) : (
            <span />
          )}
        </nav>
      )}
    </>
  );
}
