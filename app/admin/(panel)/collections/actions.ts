"use server";

import { CollectionKind, CollectionStatus, Prisma, RedirectEntityType } from "@prisma/client";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin/auth";
import {
  checkbox,
  errorState,
  optionalText,
  parseWholeNumber,
  slugError,
  slugify,
  successState,
  text,
  type FormState,
} from "@/lib/admin/forms";
import { recordSlugChange } from "@/lib/admin/redirects";
import { expireCollectionPages } from "@/lib/admin/revalidate";
import { chosenFile, deleteStoredImages, imageFileError, storeImage } from "@/lib/admin/uploads";
import { prisma } from "@/lib/db";

const TRANSACTION_OPTIONS = { timeout: 20000, maxWait: 10000 };
const KINDS = new Set<string>(Object.values(CollectionKind));
const STATUSES = new Set<string>(Object.values(CollectionStatus));

const LIMITS = { name: 80, subtitle: 200, description: 2000, metaTitle: 120, metaDescription: 320 };

export async function saveCollection(_previous: FormState, form: FormData): Promise<FormState> {
  await requireAdmin();

  const collectionId = text(form, "collectionId") || null;
  const existing = collectionId
    ? await prisma.collection.findUnique({
        where: { id: collectionId },
        include: { products: { select: { productId: true } } },
      })
    : null;
  if (collectionId && !existing) {
    return { status: "error", message: "This collection no longer exists. Go back to the list." };
  }

  const errors: Record<string, string> = {};

  const name = text(form, "name");
  if (!name) {
    errors.name = "Enter the collection name.";
  } else if (name.length > LIMITS.name) {
    errors.name = `Keep the name to ${LIMITS.name} characters or fewer.`;
  }

  let slug = text(form, "slug").toLowerCase();
  if (slug === "" && name) {
    slug = slugify(name);
  }
  // With no name there is nothing to generate a slug from; the name error covers it.
  const slugProblem = slug === "" && !name ? null : slugError(slug);
  if (slugProblem) {
    errors.slug = slugProblem;
  } else {
    const clash = await prisma.collection.findFirst({
      where: { slug, ...(collectionId ? { id: { not: collectionId } } : {}) },
      select: { name: true },
    });
    if (clash) {
      errors.slug = `“${clash.name}” already uses the slug “${slug}”. Choose a different one.`;
    }
  }

  const kind = text(form, "kind");
  if (!KINDS.has(kind)) {
    errors.kind = "Choose Range or Category.";
  }
  const status = text(form, "status");
  if (!STATUSES.has(status)) {
    errors.status = "Choose Draft or Published.";
  }

  const subtitle = optionalText(form, "subtitle");
  const description = optionalText(form, "description");
  const metaTitle = optionalText(form, "metaTitle");
  const metaDescription = optionalText(form, "metaDescription");
  const lengths: [string, string | null, number, string][] = [
    ["subtitle", subtitle, LIMITS.subtitle, "subtitle"],
    ["description", description, LIMITS.description, "description"],
    ["metaTitle", metaTitle, LIMITS.metaTitle, "search title"],
    ["metaDescription", metaDescription, LIMITS.metaDescription, "search description"],
  ];
  for (const [field, value, max, label] of lengths) {
    if (value !== null && value.length > max) {
      errors[field] = `Keep the ${label} to ${max} characters or fewer.`;
    }
  }

  const displayOrder = parseWholeNumber(text(form, "displayOrder") || "0", 0, 9999);
  if (displayOrder === null) {
    errors.displayOrder = "Enter a whole number from 0 to 9999.";
  }

  // Artwork: an upload replaces the current file; the checkbox removes it.
  const imageFile = chosenFile(form, "imageFile");
  const iconFile = chosenFile(form, "iconFile");
  if (imageFile) {
    const problem = await imageFileError(imageFile);
    if (problem) {
      errors.imageFile = `Image: ${problem}`;
    }
  }
  if (iconFile) {
    const problem = await imageFileError(iconFile);
    if (problem) {
      errors.iconFile = `Icon: ${problem}`;
    }
  }

  // Membership: order and removal for current products, then additions.
  const currentIds = new Set((existing?.products ?? []).map((link) => link.productId));
  const orders = new Map<string, number>();
  const removals: string[] = [];
  for (const productId of currentIds) {
    if (checkbox(form, `members.${productId}.remove`)) {
      removals.push(productId);
      continue;
    }
    const orderText = text(form, `members.${productId}.order`);
    if (orderText === "") {
      continue;
    }
    const order = parseWholeNumber(orderText, 0, 9999);
    if (order === null) {
      errors[`members.${productId}.order`] = "Enter the order as a whole number from 0 to 9999.";
    } else {
      orders.set(productId, order);
    }
  }
  const additions = form
    .getAll("addProductIds")
    .filter((id): id is string => typeof id === "string" && id !== "" && !currentIds.has(id));
  if (additions.length > 0) {
    const found = await prisma.product.count({ where: { id: { in: additions } } });
    if (found !== additions.length) {
      errors.addProductIds = "Choose products from the list.";
    }
  }

  if (Object.keys(errors).length > 0) {
    return errorState(
      errors,
      form,
      imageFile || iconFile
        ? "Nothing was saved. Fix the fields marked below, then choose the image files again."
        : undefined,
    );
  }

  // Upload artwork before the database change; roll the files back if that change fails.
  const uploaded: { image?: string; icon?: string } = {};
  for (const [key, file, maxEdge] of [
    ["image", imageFile, 1600],
    ["icon", iconFile, 512],
  ] as const) {
    if (!file) {
      continue;
    }
    const stored = await storeImage(file, {
      folder: `collections/${slug}`,
      baseName: key,
      maxEdge,
    });
    if (!stored.ok) {
      await deleteStoredImages(Object.values(uploaded));
      return errorState({ [`${key}File`]: stored.error }, form);
    }
    uploaded[key] = stored.url;
  }

  const imageUrl =
    uploaded.image ?? (checkbox(form, "removeImage") ? null : (existing?.imageUrl ?? null));
  const iconUrl =
    uploaded.icon ?? (checkbox(form, "removeIcon") ? null : (existing?.iconUrl ?? null));

  const data = {
    name,
    slug,
    kind: kind as CollectionKind,
    status: status as CollectionStatus,
    subtitle,
    description,
    metaTitle,
    metaDescription,
    displayOrder: displayOrder ?? 0,
    imageUrl,
    iconUrl,
  };

  let savedId: string;
  try {
    savedId = await prisma.$transaction(async (tx) => {
      const collection = existing
        ? await tx.collection.update({ where: { id: existing.id }, data })
        : await tx.collection.create({ data });
      if (existing && existing.slug !== slug) {
        await recordSlugChange(tx, RedirectEntityType.COLLECTION, existing.slug, slug);
      }

      if (removals.length > 0) {
        await tx.productCollection.deleteMany({
          where: { collectionId: collection.id, productId: { in: removals } },
        });
      }
      for (const [productId, memberOrder] of orders) {
        await tx.productCollection.update({
          where: { productId_collectionId: { productId, collectionId: collection.id } },
          data: { displayOrder: memberOrder },
        });
      }
      const last = await tx.productCollection.aggregate({
        where: { collectionId: collection.id },
        _max: { displayOrder: true },
      });
      let next = (last._max.displayOrder ?? 0) + 1;
      for (const productId of additions) {
        await tx.productCollection.create({
          data: { productId, collectionId: collection.id, displayOrder: next },
        });
        next += 1;
      }
      return collection.id;
    }, TRANSACTION_OPTIONS);
  } catch (error) {
    await deleteStoredImages(Object.values(uploaded));
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return errorState(
        {
          slug: "Another collection took this slug while you were editing. Choose a different one.",
        },
        form,
      );
    }
    throw error;
  }

  // Files no longer referenced.
  await deleteStoredImages([
    existing?.imageUrl !== imageUrl ? existing?.imageUrl : null,
    existing?.iconUrl !== iconUrl ? existing?.iconUrl : null,
  ]);
  expireCollectionPages(slug, ...(existing ? [existing.slug] : []));

  if (!existing) {
    redirect(`/admin/collections/${savedId}?created=1`);
  }
  return successState(
    existing.slug !== slug
      ? `Saved. The address changed to /collections/${slug}; the old address /collections/${existing.slug} now redirects to it.`
      : "Saved. The public pages show the change on their next visit.",
  );
}

export async function deleteCollection(_previous: FormState, form: FormData): Promise<FormState> {
  await requireAdmin();
  const collectionId = text(form, "collectionId");
  const collection = await prisma.collection.findUnique({ where: { id: collectionId } });
  if (!collection) {
    return { status: "error", message: "This collection no longer exists." };
  }
  if (!checkbox(form, "confirmDelete")) {
    return errorState(
      { confirmDelete: "Tick the box to confirm the collection should be deleted." },
      form,
      "The collection was not deleted.",
    );
  }

  await prisma.$transaction([
    prisma.slugRedirect.deleteMany({
      where: { entityType: RedirectEntityType.COLLECTION, toSlug: collection.slug },
    }),
    prisma.collection.delete({ where: { id: collection.id } }),
  ]);
  await deleteStoredImages([collection.imageUrl, collection.iconUrl]);
  expireCollectionPages(collection.slug);
  redirect(`/admin/collections?deleted=${encodeURIComponent(collection.name)}`);
}
