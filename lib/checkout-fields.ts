/**
 * Checkout form fields and their validation. Pure (no Next, no Prisma), so the browser
 * form and the server action share one set of rules and node:test can run them
 * (lib/checkout-fields.test.ts). The server action always validates again; the browser
 * check is a convenience only.
 */

export const PROVINCES = [
  { code: "AB", name: "Alberta" },
  { code: "BC", name: "British Columbia" },
  { code: "MB", name: "Manitoba" },
  { code: "NB", name: "New Brunswick" },
  { code: "NL", name: "Newfoundland and Labrador" },
  { code: "NS", name: "Nova Scotia" },
  { code: "NT", name: "Northwest Territories" },
  { code: "NU", name: "Nunavut" },
  { code: "ON", name: "Ontario" },
  { code: "PE", name: "Prince Edward Island" },
  { code: "QC", name: "Quebec" },
  { code: "SK", name: "Saskatchewan" },
  { code: "YT", name: "Yukon" },
] as const;

export type ProvinceCode = (typeof PROVINCES)[number]["code"];

export function provinceName(code: string): string {
  return PROVINCES.find((province) => province.code === code)?.name ?? code;
}

/** The research-use and age statements, from the client's Terms. Never pre-ticked. */
export const AGE_STATEMENT = "I am 18 years of age or older.";
export const RESEARCH_STATEMENT =
  "I confirm these materials are for laboratory research use only, and not for human or animal consumption.";

/** Field names, shared by the form markup and the server action. */
export const FIELD = {
  name: "fullName",
  email: "email",
  phone: "phone",
  line1: "line1",
  line2: "line2",
  city: "city",
  province: "province",
  postalCode: "postalCode",
  note: "note",
  age: "ageConfirmed",
  research: "researchUse",
  /** Honeypot: hidden from people, left empty by them, often filled by bots. */
  honeypot: "website",
} as const;

export type CheckoutDetails = {
  name: string;
  email: string;
  phone: string;
  line1: string;
  line2: string | null;
  city: string;
  province: ProvinceCode;
  postalCode: string;
  note: string | null;
  ageConfirmed: true;
  researchUse: true;
};

export type FieldErrors = Partial<Record<(typeof FIELD)[keyof typeof FIELD], string>>;

export type CheckoutValidation =
  { ok: true; details: CheckoutDetails } | { ok: false; errors: FieldErrors };

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
/** Canadian postal code: letter digit letter, optional space, digit letter digit. D F I O Q U never appear; W and Z never lead. */
const POSTAL_PATTERN = /^[ABCEGHJ-NPRSTVXY]\d[ABCEGHJ-NPRSTV-Z] ?\d[ABCEGHJ-NPRSTV-Z]\d$/;

const LIMITS = { name: 120, email: 254, line: 200, city: 100, note: 1000 } as const;

/** "t2p1j9" → "T2P 1J9", or null when it is not a Canadian postal code. */
export function normalisePostalCode(input: string): string | null {
  const compact = input.toUpperCase().replace(/[\s-]/g, "");
  if (!POSTAL_PATTERN.test(compact)) {
    return null;
  }
  return `${compact.slice(0, 3)} ${compact.slice(3)}`;
}

/** Ten digits, optionally led by a 1 or +1; returned as "403-555-0123". */
export function normalisePhone(input: string): string | null {
  let digits = input.replace(/\D/g, "");
  if (digits.length === 11 && digits.startsWith("1")) {
    digits = digits.slice(1);
  }
  if (digits.length !== 10) {
    return null;
  }
  return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
}

type Source = (name: string) => string;

/** Validates the submitted fields. `get` returns the raw string value ("" when absent). */
export function validateCheckout(get: Source): CheckoutValidation {
  const errors: FieldErrors = {};
  const text = (name: string) => get(name).trim().replace(/\s+/g, " ");

  const name = text(FIELD.name);
  if (!name) {
    errors[FIELD.name] = "Enter your full name.";
  } else if (name.length > LIMITS.name) {
    errors[FIELD.name] = `Keep your name to ${LIMITS.name} characters or fewer.`;
  }

  const email = get(FIELD.email).trim().toLowerCase();
  if (!email) {
    errors[FIELD.email] = "Enter your email address.";
  } else if (email.length > LIMITS.email || !EMAIL_PATTERN.test(email)) {
    errors[FIELD.email] = "Enter an email address like name@example.com.";
  }

  const phoneInput = text(FIELD.phone);
  const phone = normalisePhone(phoneInput);
  if (!phoneInput) {
    errors[FIELD.phone] = "Enter a phone number.";
  } else if (!phone) {
    errors[FIELD.phone] = "Enter a 10-digit Canadian phone number.";
  }

  const line1 = text(FIELD.line1);
  if (!line1) {
    errors[FIELD.line1] = "Enter the street address.";
  } else if (line1.length > LIMITS.line) {
    errors[FIELD.line1] = `Keep the address line to ${LIMITS.line} characters or fewer.`;
  }

  const line2 = text(FIELD.line2);
  if (line2.length > LIMITS.line) {
    errors[FIELD.line2] = `Keep the address line to ${LIMITS.line} characters or fewer.`;
  }

  const city = text(FIELD.city);
  if (!city) {
    errors[FIELD.city] = "Enter the city.";
  } else if (city.length > LIMITS.city) {
    errors[FIELD.city] = `Keep the city to ${LIMITS.city} characters or fewer.`;
  }

  const provinceInput = get(FIELD.province).trim().toUpperCase();
  const province = PROVINCES.find((candidate) => candidate.code === provinceInput)?.code ?? null;
  if (!province) {
    errors[FIELD.province] = "Choose a province or territory.";
  }

  const postalInput = text(FIELD.postalCode);
  const postalCode = normalisePostalCode(postalInput);
  if (!postalInput) {
    errors[FIELD.postalCode] = "Enter the postal code.";
  } else if (!postalCode) {
    errors[FIELD.postalCode] = "Enter a Canadian postal code like T2P 1J9.";
  }

  const note = get(FIELD.note).trim();
  if (note.length > LIMITS.note) {
    errors[FIELD.note] = `Keep the note to ${LIMITS.note} characters or fewer.`;
  }

  if (get(FIELD.age) !== "on") {
    errors[FIELD.age] = "Confirm that you are 18 or older.";
  }
  if (get(FIELD.research) !== "on") {
    errors[FIELD.research] = "Confirm that the materials are for laboratory research use only.";
  }

  if (Object.keys(errors).length > 0 || !province || !phone || !postalCode) {
    return { ok: false, errors };
  }
  return {
    ok: true,
    details: {
      name,
      email,
      phone,
      line1,
      line2: line2 || null,
      city,
      province,
      postalCode,
      note: note || null,
      ageConfirmed: true,
      researchUse: true,
    },
  };
}

/** "KIN-2026-0001": four digits, more once a year passes 9999 orders. */
export function formatReference(year: number, sequence: number): string {
  return `KIN-${year}-${String(sequence).padStart(4, "0")}`;
}

export const REFERENCE_PATTERN = /^KIN-\d{4}-\d{4,}$/;
