import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { HandledBadge, WarningBadge } from "@/components/admin/Badges";
import styles from "@/components/admin/admin.module.css";
import { requireAdmin } from "@/lib/admin/auth";
import { formatStoreDateTime } from "@/lib/admin/forms";
import { messageSendProblem, REPLY_SUBJECT } from "@/lib/admin/messages";
import { prisma } from "@/lib/db";
import { HandledForm } from "../HandledForm";

type Props = PageProps<"/admin/messages/[id]">;

/** Message ids are cuids; anything else is not looked up. */
const ID_PATTERN = /^[A-Za-z0-9_-]{1,64}$/;

function findMessage(id: string) {
  return ID_PATTERN.test(id)
    ? prisma.contactMessage.findUnique({
        where: { id },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          message: true,
          sentAt: true,
          sendError: true,
          handledAt: true,
          createdAt: true,
        },
      })
    : null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const message = await findMessage((await params).id);
  return { title: message ? `Message from ${message.name}` : "Message not found" };
}

/**
 * /admin/messages/[id]: one contact message in full, who sent it, whether it was emailed
 * to the client, and the handled mark. Replies go from the client's own email.
 */
export default async function MessageDetailPage({ params }: Props) {
  await requireAdmin();
  const message = await findMessage((await params).id);
  if (!message) {
    notFound();
  }
  const handled = message.handledAt !== null;
  const mailto = `mailto:${message.email}?subject=${encodeURIComponent(REPLY_SUBJECT)}`;

  return (
    <>
      <div className={styles.pageHeader}>
        <div className={styles.pageHeaderText}>
          <Link href="/admin/messages" className={styles.backLink}>
            Back to messages
          </Link>
          <h1 className={styles.pageTitle}>Message from {message.name}</h1>
          <p className={styles.pageIntro}>
            <HandledBadge handled={handled} /> Received {formatStoreDateTime(message.createdAt)}
          </p>
        </div>
      </div>

      {!message.sentAt && (
        <div className={`${styles.notice} ${styles.noticeError}`}>
          <p className={styles.noticeTitle}>This message was not emailed to you.</p>
          <p>
            It reached you only through this page. {messageSendProblem(message.sendError)} Reply to{" "}
            {message.email} from your own email.
          </p>
        </div>
      )}

      <section className={styles.panel} aria-labelledby="message-heading">
        <h2 id="message-heading" className={styles.panelTitle}>
          Message
        </h2>
        <p className={styles.noteText}>{message.message}</p>
      </section>

      <div className={styles.pairs}>
        <section className={styles.panel} aria-labelledby="from-heading">
          <h2 id="from-heading" className={styles.panelTitle}>
            From
          </h2>
          <dl className={`${styles.facts} ${styles.factsSingle}`}>
            <div className={styles.fact}>
              <dt>Name</dt>
              <dd className={styles.selectable}>{message.name}</dd>
            </div>
            <div className={styles.fact}>
              <dt>Email</dt>
              <dd className={styles.selectable}>{message.email}</dd>
            </div>
            <div className={styles.fact}>
              <dt>Phone</dt>
              <dd className={styles.selectable}>{message.phone ?? "Not given"}</dd>
            </div>
          </dl>
          <p className={styles.contactLinks}>
            <a href={mailto} className={styles.textButton}>
              Reply by email
            </a>
            {message.phone && (
              <a href={`tel:${message.phone}`} className={styles.textButton}>
                Call
              </a>
            )}
          </p>
        </section>

        <section className={styles.panel} aria-labelledby="message-status-heading">
          <h2 id="message-status-heading" className={styles.panelTitle}>
            Status
          </h2>
          <dl className={`${styles.facts} ${styles.factsSingle}`}>
            <div className={styles.fact}>
              <dt>Emailed to you</dt>
              <dd>
                {message.sentAt ? (
                  `Yes, ${formatStoreDateTime(message.sentAt)}`
                ) : (
                  <>
                    <WarningBadge>Not emailed</WarningBadge> {messageSendProblem(message.sendError)}
                  </>
                )}
              </dd>
            </div>
            <div className={styles.fact}>
              <dt>Handled</dt>
              <dd>
                {message.handledAt
                  ? `Yes, ${formatStoreDateTime(message.handledAt)}`
                  : "Not yet: it counts as waiting."}
              </dd>
            </div>
            <div className={styles.fact}>
              <dt>Reference</dt>
              <dd className={`${styles.selectable} ${styles.mono}`}>{message.id}</dd>
            </div>
          </dl>
          <HandledForm messageId={message.id} handled={handled} />
        </section>
      </div>
    </>
  );
}
