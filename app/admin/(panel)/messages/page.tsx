import type { Prisma } from "@prisma/client";
import type { Metadata } from "next";
import Link from "next/link";
import { HandledBadge, WarningBadge } from "@/components/admin/Badges";
import styles from "@/components/admin/admin.module.css";
import { requireAdmin } from "@/lib/admin/auth";
import { formatStoreDate, formatStoreDateTime } from "@/lib/admin/forms";
import { prisma } from "@/lib/db";
import { emailConfigured } from "@/lib/order-email";

export const metadata: Metadata = { title: "Messages" };

const PAGE_SIZE = 50;

const SHOW = {
  all: "All",
  waiting: "Not handled",
  handled: "Handled",
} as const;

type Show = keyof typeof SHOW;

function first(value: string | string[] | undefined): string {
  return (Array.isArray(value) ? value[0] : value)?.trim() ?? "";
}

/**
 * /admin/messages: everything sent through the contact form, newest first. Messages not
 * yet handled are counted at the top, and any message whose email did not send is flagged:
 * until email is set up, this page is the only place they appear.
 */
export default async function AdminMessagesPage({ searchParams }: PageProps<"/admin/messages">) {
  await requireAdmin();
  const params = await searchParams;
  const query = first(params.q).slice(0, 100);
  const showParam = first(params.show);
  const show: Show = showParam === "waiting" || showParam === "handled" ? showParam : "all";
  const requestedPage = Number.parseInt(first(params.page), 10);

  const where: Prisma.ContactMessageWhereInput = {
    ...(show === "waiting"
      ? { handledAt: null }
      : show === "handled"
        ? { handledAt: { not: null } }
        : {}),
    ...(query
      ? {
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { email: { contains: query, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  const [total, waiting, matching] = await Promise.all([
    prisma.contactMessage.count(),
    prisma.contactMessage.count({ where: { handledAt: null } }),
    prisma.contactMessage.count({ where }),
  ]);
  const pages = Math.max(1, Math.ceil(matching / PAGE_SIZE));
  const page =
    Number.isInteger(requestedPage) && requestedPage > 1 ? Math.min(requestedPage, pages) : 1;
  const messages = await prisma.contactMessage.findMany({
    where,
    orderBy: { createdAt: "desc" },
    skip: (page - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      message: true,
      sentAt: true,
      handledAt: true,
      createdAt: true,
    },
  });
  const filtered = Boolean(query || show !== "all");

  const pageHref = (target: number) => {
    const search = new URLSearchParams();
    if (query) {
      search.set("q", query);
    }
    if (show !== "all") {
      search.set("show", show);
    }
    if (target > 1) {
      search.set("page", String(target));
    }
    const text = search.toString();
    return text ? `/admin/messages?${text}` : "/admin/messages";
  };

  return (
    <>
      <div className={styles.pageHeader}>
        <div className={styles.pageHeaderText}>
          <h1 className={styles.pageTitle}>Messages</h1>
          <p className={styles.pageIntro}>
            Everything sent through the contact form. Reply from your own email, then mark the
            message handled.
          </p>
        </div>
      </div>

      {waiting > 0 ? (
        <section className={styles.attention} aria-labelledby="waiting-heading">
          <p className={styles.attentionCount} aria-hidden="true">
            {waiting}
          </p>
          <div>
            <h2 id="waiting-heading" className={styles.attentionTitle}>
              {waiting === 1 ? "1 message waiting" : `${waiting} messages waiting`}
            </h2>
            <ul className={styles.attentionLinks}>
              <li>
                <Link href="/admin/messages?show=waiting">Show messages not handled</Link>
              </li>
            </ul>
          </div>
        </section>
      ) : (
        <p className={styles.attentionClear}>
          No messages waiting. Messages you have not marked handled are counted here.
        </p>
      )}

      {!emailConfigured() && (
        <div className={`${styles.notice} ${styles.noticeError}`}>
          <p className={styles.noticeTitle}>Contact form messages are not being emailed.</p>
          <p>
            Email is not set up on this server (RESEND_API_KEY is missing), so messages reach you
            only on this page. Check it for new messages and reply from your own email.
          </p>
        </div>
      )}

      <form
        method="get"
        className={`${styles.filters} ${styles.messageFilters}`}
        role="search"
        aria-label="Find messages"
      >
        <div className={styles.field}>
          <label htmlFor="filter-q" className={styles.label}>
            Search by name or email
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
          <label htmlFor="filter-show" className={styles.label}>
            Show
          </label>
          <select id="filter-show" name="show" defaultValue={show} className={styles.select}>
            <option value="all">
              {SHOW.all} ({total})
            </option>
            <option value="waiting">
              {SHOW.waiting} ({waiting})
            </option>
            <option value="handled">
              {SHOW.handled} ({total - waiting})
            </option>
          </select>
        </div>
        <button type="submit" className={`${styles.button} ${styles.secondary}`}>
          Apply
        </button>
      </form>

      <p className={styles.resultCount} aria-live="polite">
        {matching} {matching === 1 ? "message" : "messages"}
        {filtered && (
          <>
            {" "}
            {matching === 1 ? "matches" : "match"}.{" "}
            <Link href="/admin/messages" className={styles.textButton}>
              Clear filters
            </Link>
          </>
        )}
      </p>

      {messages.length === 0 ? (
        <div className={styles.records}>
          <p className={styles.empty}>
            {total === 0
              ? "No messages yet. Messages sent through the contact form appear here straight away."
              : "No messages match. Try another search or clear the filters."}
          </p>
        </div>
      ) : (
        <ul className={`${styles.records} ${styles.messageRecords}`} aria-label="Messages">
          <li className={styles.recordsHead} aria-hidden="true">
            <span>From</span>
            <span>Message</span>
            <span>Received</span>
            <span>Emailed to you</span>
            <span>Status</span>
          </li>
          {messages.map((message) => (
            <li key={message.id} className={styles.record}>
              <div className={styles.recordCell}>
                <Link href={`/admin/messages/${message.id}`} className={styles.recordName}>
                  {message.name}
                </Link>
                <span className={styles.recordSub}>{message.email}</span>
                {message.phone && <span className={styles.recordSub}>{message.phone}</span>}
              </div>
              <div className={styles.recordMeta}>
                <span className={styles.recordCell}>
                  <span className={styles.recordLabel}>Message: </span>
                  <span className={styles.messagePreview}>{message.message}</span>
                </span>
                <span className={styles.recordCell}>
                  <span className={styles.recordLabel}>Received: </span>
                  {formatStoreDateTime(message.createdAt)}
                </span>
                <span className={styles.recordCell}>
                  <span className={styles.recordLabel}>Emailed to you: </span>
                  {message.sentAt ? (
                    <>Yes, {formatStoreDate(message.sentAt)}</>
                  ) : (
                    <>
                      <WarningBadge>Not emailed</WarningBadge>
                      <span className={styles.recordWarn}>
                        This message did not reach your inbox. It is only here.
                      </span>
                    </>
                  )}
                </span>
                <span className={styles.recordCell}>
                  <span className={styles.recordLabel}>Status: </span>
                  <HandledBadge handled={message.handledAt !== null} />
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}

      {pages > 1 && (
        <nav className={styles.pager} aria-label="Message pages">
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
