"use server";

import { Prisma } from "@prisma/client";
import { requireAdmin } from "@/lib/admin/auth";
import {
  checkbox,
  errorState,
  optionalStoreDateTime,
  optionalText,
  parseWholeNumber,
  successState,
  text,
  type FormState,
} from "@/lib/admin/forms";
import { refreshAdmin } from "@/lib/admin/revalidate";
import { prisma } from "@/lib/db";

const TRANSACTION_OPTIONS = { timeout: 20000, maxWait: 10000 };
const CODE_PATTERN = /^[A-Za-z0-9%_-]{2,40}$/;
const NOTE_LIMIT = 500;

/* -------------------------------------------------------------------------- */
/*  Discount codes                                                            */
/* -------------------------------------------------------------------------- */

type ParsedCode = {
  id: string | null;
  code: string;
  percentOff: number;
  isActive: boolean;
  startsAt: Date | null;
  endsAt: Date | null;
  maxRedemptions: number | null;
  stacksWithVolume: boolean;
  note: string | null;
};

export async function saveDiscountCodes(_previous: FormState, form: FormData): Promise<FormState> {
  await requireAdmin();
  const existing = await prisma.discountCode.findMany();
  const errors: Record<string, string> = {};
  const parsed: ParsedCode[] = [];
  const deletions: string[] = [];

  const rows: { key: string; id: string | null; redeemed: number; label: string }[] = [
    ...existing.map((code) => ({
      key: code.id,
      id: code.id,
      redeemed: code.timesRedeemed,
      label: code.code,
    })),
    { key: "new", id: null, redeemed: 0, label: "New code" },
  ];

  for (const row of rows) {
    const field = (name: string) => `codes.${row.key}.${name}`;
    if (row.id && checkbox(form, field("delete"))) {
      deletions.push(row.id);
      continue;
    }
    const code = text(form, field("code"));
    const percentText = text(form, field("percentOff"));
    const maxText = text(form, field("maxRedemptions"));
    const note = optionalText(form, field("note"));
    const startsText = text(form, field("startsAt"));
    const endsText = text(form, field("endsAt"));
    if (
      row.id === null &&
      ![code, percentText, maxText, note, startsText, endsText].some(Boolean)
    ) {
      continue;
    }
    const label = code || row.label;

    if (!CODE_PATTERN.test(code)) {
      errors[field("code")] =
        `${label}: use 2 to 40 letters, numbers, hyphens, underscores or %, with no spaces.`;
    }
    const percentOff = parseWholeNumber(percentText, 1, 100);
    if (percentOff === null) {
      errors[field("percentOff")] =
        `${label}: enter the percentage off as a whole number from 1 to 100.`;
    }
    const starts = optionalStoreDateTime(form, field("startsAt"));
    const ends = optionalStoreDateTime(form, field("endsAt"));
    if (starts.error) {
      errors[field("startsAt")] = `${label}: ${starts.error}`;
    }
    if (ends.error) {
      errors[field("endsAt")] = `${label}: ${ends.error}`;
    }
    if (starts.value && ends.value && ends.value <= starts.value) {
      errors[field("endsAt")] = `${label}: the end must be after the start.`;
    }
    let maxRedemptions: number | null = null;
    if (maxText !== "") {
      maxRedemptions = parseWholeNumber(maxText, 1, 1_000_000);
      if (maxRedemptions === null) {
        errors[field("maxRedemptions")] =
          `${label}: enter a whole number of uses, or leave it blank for no limit.`;
      } else if (maxRedemptions < row.redeemed) {
        errors[field("maxRedemptions")] =
          `${label}: it has already been used ${row.redeemed} times.`;
      }
    }
    if (note !== null && note.length > NOTE_LIMIT) {
      errors[field("note")] = `${label}: keep the note to ${NOTE_LIMIT} characters or fewer.`;
    }

    parsed.push({
      id: row.id,
      code,
      percentOff: percentOff ?? 0,
      isActive: checkbox(form, field("isActive")),
      startsAt: starts.value,
      endsAt: ends.value,
      maxRedemptions,
      stacksWithVolume: checkbox(form, field("stacksWithVolume")),
      note,
    });
  }

  // Codes match without regard to case at checkout, so "KIN-15" and "Kin-15" would clash.
  const seen = new Map<string, string>();
  for (const item of parsed) {
    const folded = item.code.toLowerCase();
    const key = `codes.${item.id ?? "new"}.code`;
    if (item.code && seen.has(folded) && !errors[key]) {
      errors[key] =
        `${item.code}: the code “${seen.get(folded)}” already exists (codes are not case sensitive).`;
    }
    seen.set(folded, item.code);
  }

  if (Object.keys(errors).length > 0) {
    return errorState(errors, form);
  }

  try {
    await prisma.$transaction(async (tx) => {
      if (deletions.length > 0) {
        await tx.discountCode.deleteMany({ where: { id: { in: deletions } } });
      }
      // Rename in two steps so swapping two codes' names cannot trip the unique index.
      for (const item of parsed.filter((code) => code.id !== null)) {
        await tx.discountCode.update({ where: { id: item.id! }, data: { code: `~${item.id}` } });
      }
      for (const item of parsed) {
        const data = {
          code: item.code,
          percentOff: item.percentOff,
          isActive: item.isActive,
          startsAt: item.startsAt,
          endsAt: item.endsAt,
          maxRedemptions: item.maxRedemptions,
          stacksWithVolume: item.stacksWithVolume,
          note: item.note,
        };
        if (item.id) {
          await tx.discountCode.update({ where: { id: item.id }, data });
        } else {
          await tx.discountCode.create({ data });
        }
      }
    }, TRANSACTION_OPTIONS);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return errorState(
        {},
        form,
        "Nothing was saved: two codes ended up with the same name. Check them and save again.",
      );
    }
    throw error;
  }

  refreshAdmin();
  const active = parsed.filter((code) => code.isActive).length;
  return successState(
    `Discount codes saved. ${active === 0 ? "No code is switched on." : `${active} switched on.`} Nothing on the site uses them until checkout is built.`,
  );
}

/* -------------------------------------------------------------------------- */
/*  Volume tiers                                                              */
/* -------------------------------------------------------------------------- */

export async function saveVolumeTiers(_previous: FormState, form: FormData): Promise<FormState> {
  await requireAdmin();
  const existing = await prisma.volumeDiscountTier.findMany();
  const errors: Record<string, string> = {};
  const parsed: {
    id: string | null;
    minQuantity: number;
    percentOff: number;
    isActive: boolean;
  }[] = [];
  const deletions: string[] = [];

  const rows = [
    ...existing.map((tier) => ({ key: tier.id, id: tier.id as string | null })),
    { key: "new", id: null as string | null },
  ];
  for (const row of rows) {
    const field = (name: string) => `tiers.${row.key}.${name}`;
    if (row.id && checkbox(form, field("delete"))) {
      deletions.push(row.id);
      continue;
    }
    const minText = text(form, field("minQuantity"));
    const percentText = text(form, field("percentOff"));
    if (row.id === null && !minText && !percentText) {
      continue;
    }
    const label = row.id ? `Tier from ${minText || "?"} units` : "New tier";
    const minQuantity = parseWholeNumber(minText, 2, 1000);
    if (minQuantity === null) {
      errors[field("minQuantity")] =
        `${label}: enter the minimum quantity as a whole number from 2 to 1000.`;
    }
    const percentOff = parseWholeNumber(percentText, 1, 100);
    if (percentOff === null) {
      errors[field("percentOff")] =
        `${label}: enter the percentage off as a whole number from 1 to 100.`;
    }
    parsed.push({
      id: row.id,
      minQuantity: minQuantity ?? 0,
      percentOff: percentOff ?? 0,
      isActive: checkbox(form, field("isActive")),
    });
  }

  const quantities = new Set<number>();
  for (const tier of parsed) {
    const key = `tiers.${tier.id ?? "new"}.minQuantity`;
    if (tier.minQuantity && quantities.has(tier.minQuantity) && !errors[key]) {
      errors[key] =
        `Two tiers start at ${tier.minQuantity} units. Each tier needs its own minimum quantity.`;
    }
    quantities.add(tier.minQuantity);
  }

  if (Object.keys(errors).length > 0) {
    return errorState(errors, form);
  }

  await prisma.$transaction(async (tx) => {
    if (deletions.length > 0) {
      await tx.volumeDiscountTier.deleteMany({ where: { id: { in: deletions } } });
    }
    for (const tier of parsed) {
      const data = {
        minQuantity: tier.minQuantity,
        percentOff: tier.percentOff,
        isActive: tier.isActive,
      };
      if (tier.id) {
        await tx.volumeDiscountTier.update({ where: { id: tier.id }, data });
      } else {
        await tx.volumeDiscountTier.create({ data });
      }
    }
  }, TRANSACTION_OPTIONS);

  refreshAdmin();
  return successState("Volume tiers saved. Nothing on the site uses them until checkout is built.");
}
