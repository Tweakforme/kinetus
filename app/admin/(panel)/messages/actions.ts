"use server";

import { requireAdmin } from "@/lib/admin/auth";
import { successState, text, type FormState } from "@/lib/admin/forms";
import { refreshAdmin } from "@/lib/admin/revalidate";
import { prisma } from "@/lib/db";

/**
 * Marks a contact message handled, or waiting again. Only changes a message that is not
 * already in that state, so pressing twice (or from two tabs) keeps the first time.
 */
export async function setMessageHandled(_previous: FormState, form: FormData): Promise<FormState> {
  await requireAdmin();
  const id = text(form, "messageId");
  const handled = text(form, "handled") === "1";

  const { count } = await prisma.contactMessage.updateMany({
    where: { id, handledAt: handled ? null : { not: null } },
    data: { handledAt: handled ? new Date() : null },
  });
  refreshAdmin();
  if (count === 1) {
    return successState(
      handled ? "Marked as handled." : "Marked as not handled. It counts as waiting again.",
    );
  }
  const current = await prisma.contactMessage.findUnique({
    where: { id },
    select: { handledAt: true },
  });
  if (!current) {
    return { status: "error", message: "Nothing was changed: this message no longer exists." };
  }
  return successState(
    current.handledAt
      ? "This message was already marked handled."
      : "This message was already waiting.",
  );
}
