import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  FIELD,
  formatReference,
  normalisePhone,
  normalisePostalCode,
  validateCheckout,
} from "./checkout-fields.ts";

const VALID: Record<string, string> = {
  [FIELD.name]: "Test Researcher",
  [FIELD.email]: "Researcher@Example.com",
  [FIELD.phone]: "(403) 555-0123",
  [FIELD.line1]: "100 Test Street",
  [FIELD.line2]: "",
  [FIELD.city]: "Calgary",
  [FIELD.province]: "AB",
  [FIELD.postalCode]: "t2p1j9",
  [FIELD.note]: "",
  [FIELD.age]: "on",
  [FIELD.research]: "on",
};

const from = (values: Record<string, string>) => (name: string) => values[name] ?? "";

describe("validateCheckout", () => {
  it("accepts a complete form and normalises it", () => {
    const result = validateCheckout(from(VALID));
    assert.equal(result.ok, true);
    if (result.ok) {
      assert.equal(result.details.email, "researcher@example.com");
      assert.equal(result.details.postalCode, "T2P 1J9");
      assert.equal(result.details.phone, "403-555-0123");
      assert.equal(result.details.line2, null);
    }
  });

  it("requires both checkboxes", () => {
    const result = validateCheckout(from({ ...VALID, [FIELD.age]: "", [FIELD.research]: "" }));
    assert.equal(result.ok, false);
    if (!result.ok) {
      assert.ok(result.errors[FIELD.age]);
      assert.ok(result.errors[FIELD.research]);
    }
  });

  it("rejects a bad email, postal code, phone and province", () => {
    const result = validateCheckout(
      from({
        ...VALID,
        [FIELD.email]: "not-an-email",
        [FIELD.postalCode]: "90210",
        [FIELD.phone]: "12345",
        [FIELD.province]: "WA",
      }),
    );
    assert.equal(result.ok, false);
    if (!result.ok) {
      assert.deepEqual(
        Object.keys(result.errors).sort(),
        [FIELD.email, FIELD.phone, FIELD.postalCode, FIELD.province].sort(),
      );
    }
  });
});

describe("normalisers", () => {
  it("postal codes", () => {
    assert.equal(normalisePostalCode("k1a 0b1"), "K1A 0B1");
    assert.equal(normalisePostalCode("D1A 0B1"), null);
  });
  it("phones", () => {
    assert.equal(normalisePhone("+1 403 555 0123"), "403-555-0123");
    assert.equal(normalisePhone("555-0123"), null);
  });
  it("references", () => {
    assert.equal(formatReference(2026, 7), "KIN-2026-0007");
    assert.equal(formatReference(2026, 12345), "KIN-2026-12345");
  });
});
