/**
 * Form handling shared by the admin's server actions: the action state the forms render,
 * and parsers that turn submitted text into typed values with plain-language errors.
 * Pure (no database), so client components can import the types and constants.
 */

export type FormState = {
  status: "idle" | "success" | "error";
  /** One line shown at the top of the form. */
  message?: string;
  /** More about the message, in plain text under it. */
  detail?: string;
  /** Field name → error shown under that field. */
  errors?: Record<string, string>;
  /** Everything submitted, echoed back on error so no typing is lost. */
  values?: Record<string, string>;
  /** Changes on every successful save; forms key their fields on it to reload saved values. */
  savedAt?: number;
};

export const IDLE_STATE: FormState = { status: "idle" };

/** The element id for a field name, shared by the field and the error summary's links. */
export function fieldId(name: string): string {
  return `field-${name.replace(/[^A-Za-z0-9_-]/g, "-")}`;
}

/** Every text entry of a submission (files are skipped), for echoing back on error. */
export function submittedValues(form: FormData): Record<string, string> {
  const values: Record<string, string> = {};
  for (const [key, value] of form.entries()) {
    if (typeof value === "string") {
      values[key] = key in values ? `${values[key]}\n${value}` : value;
    }
  }
  return values;
}

export function errorState(
  errors: Record<string, string>,
  form: FormData,
  message = "Nothing was saved. Fix the fields marked below, then save again.",
): FormState {
  return { status: "error", message, errors, values: submittedValues(form) };
}

export function successState(message: string): FormState {
  return { status: "success", message, savedAt: Date.now() };
}

/** Trimmed text, "" when absent. */
export function text(form: FormData, name: string): string {
  const value = form.get(name);
  return typeof value === "string" ? value.trim() : "";
}

/** Trimmed text, or null when blank. */
export function optionalText(form: FormData, name: string): string | null {
  const value = text(form, name);
  return value === "" ? null : value;
}

export function checkbox(form: FormData, name: string): boolean {
  return form.get(name) === "on";
}

/* -------------------------------------------------------------------------- */
/*  Numbers and money                                                         */
/* -------------------------------------------------------------------------- */

/** "45", "45.5", "$1,045.00" → cents. Null when it is not a dollar amount. */
export function parseDollars(input: string): number | null {
  const cleaned = input.replace(/[$,\s]/g, "");
  if (!/^\d{1,7}(\.\d{1,2})?$/.test(cleaned)) {
    return null;
  }
  const [dollars, fraction = ""] = cleaned.split(".");
  return Number(dollars) * 100 + Number(fraction.padEnd(2, "0"));
}

/** Cents → "45.00" for a form field. */
export function centsToInput(cents: number | null): string {
  return cents === null ? "" : (cents / 100).toFixed(2);
}

/** Whole number within [min, max], or null. */
export function parseWholeNumber(input: string, min: number, max: number): number | null {
  if (!/^-?\d{1,9}$/.test(input)) {
    return null;
  }
  const value = Number(input);
  return value >= min && value <= max ? value : null;
}

/** "14.97" → 1497 basis points (two decimals at most). Null when not a percentage. */
export function parsePercentToBps(input: string): number | null {
  const cleaned = input.replace(/[%\s]/g, "");
  if (!/^\d{1,3}(\.\d{1,2})?$/.test(cleaned)) {
    return null;
  }
  const [whole, fraction = ""] = cleaned.split(".");
  return Number(whole) * 100 + Number(fraction.padEnd(2, "0"));
}

export function bpsToInput(bps: number): string {
  return (bps / 100).toFixed(2);
}

/* -------------------------------------------------------------------------- */
/*  Slugs and links                                                           */
/* -------------------------------------------------------------------------- */

export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
export const SLUG_MAX_LENGTH = 80;

/** "NAD+" → "nad-plus", "CJC-1295 (No DAC) / Ipamorelin" → "cjc-1295-no-dac-ipamorelin". */
export function slugify(name: string): string {
  return name
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/\+/g, " plus ")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, SLUG_MAX_LENGTH)
    .replace(/-+$/g, "");
}

/** Error text for an invalid slug, or null when it is fine. */
export function slugError(slug: string): string | null {
  if (slug === "") {
    return "Enter a slug, or clear it and save to generate one from the name.";
  }
  if (slug.length > SLUG_MAX_LENGTH) {
    return `Keep the slug to ${SLUG_MAX_LENGTH} characters or fewer.`;
  }
  if (!SLUG_PATTERN.test(slug)) {
    return "Use lowercase letters, numbers and single hyphens only, for example bpc-157.";
  }
  return null;
}

/** A full http(s) address, or null. */
export function parseHttpUrl(input: string): string | null {
  try {
    const url = new URL(input);
    return (url.protocol === "https:" || url.protocol === "http:") && url.hostname.includes(".")
      ? url.toString()
      : null;
  } catch {
    return null;
  }
}

/* -------------------------------------------------------------------------- */
/*  Dates: entered and shown in the store's time zone (Calgary)               */
/* -------------------------------------------------------------------------- */

/** The client is in Calgary; sale and discount windows are entered in local time. */
export const STORE_TIME_ZONE = "America/Edmonton";
export const STORE_TIME_ZONE_LABEL = "Calgary time";

function zonedParts(date: Date): Record<string, number> {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: STORE_TIME_ZONE,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(date);
  const values: Record<string, number> = {};
  for (const part of parts) {
    if (part.type !== "literal") {
      values[part.type] = Number(part.value);
    }
  }
  return values;
}

/** Minutes the store's clock is ahead of UTC at that instant (negative in Canada). */
function offsetMinutes(date: Date): number {
  const p = zonedParts(date);
  const asUtc = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second);
  return (asUtc - Math.floor(date.getTime() / 1000) * 1000) / 60000;
}

/** "2026-11-27T09:00" in Calgary time → the UTC instant. Null when not a real date. */
export function parseStoreDateTime(input: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(input);
  if (!match) {
    return null;
  }
  const [year, month, day, hour, minute] = match.slice(1).map(Number);
  const wall = Date.UTC(year, month - 1, day, hour, minute);
  const check = new Date(wall);
  if (check.getUTCMonth() !== month - 1 || check.getUTCDate() !== day || hour > 23) {
    return null;
  }
  // Two passes settle the offset across daylight-saving changes.
  let instant = wall - offsetMinutes(new Date(wall)) * 60000;
  instant = wall - offsetMinutes(new Date(instant)) * 60000;
  return new Date(instant);
}

/** UTC instant → "2026-11-27T09:00" in Calgary time, for a datetime-local field. */
export function toStoreDateTimeInput(date: Date | null): string {
  if (date === null) {
    return "";
  }
  const p = zonedParts(date);
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${p.year}-${pad(p.month)}-${pad(p.day)}T${pad(p.hour)}:${pad(p.minute)}`;
}

/** "27 Nov 2026, 9:00 a.m." in Calgary time. */
export function formatStoreDateTime(date: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: STORE_TIME_ZONE,
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

/** "27 Nov 2026" in Calgary time. */
export function formatStoreDate(date: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: STORE_TIME_ZONE,
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

/** Optional datetime field: null when blank, an error when it cannot be read. */
export function optionalStoreDateTime(
  form: FormData,
  name: string,
): { value: Date | null; error: string | null } {
  const raw = text(form, name);
  if (raw === "") {
    return { value: null, error: null };
  }
  const value = parseStoreDateTime(raw);
  return value
    ? { value, error: null }
    : { value: null, error: "Enter a date and time, for example 2026-11-27 09:00." };
}
