import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { CONTACT_FIELD, validateContact } from "./contact-fields.ts";

const VALID: Record<string, string> = {
  [CONTACT_FIELD.name]: "  Test   Researcher ",
  [CONTACT_FIELD.email]: "Researcher@Example.com",
  [CONTACT_FIELD.phone]: "",
  [CONTACT_FIELD.message]: "A question about documentation.",
};
const from = (values: Record<string, string>) => (name: string) => values[name] ?? "";

describe("validateContact", () => {
  it("accepts a complete message and normalises it", () => {
    const result = validateContact(from(VALID));
    assert.equal(result.ok, true);
    if (result.ok) {
      assert.equal(result.details.name, "Test Researcher");
      assert.equal(result.details.email, "researcher@example.com");
      assert.equal(result.details.phone, null);
    }
  });

  it("requires name, email and message; phone is optional but checked", () => {
    const result = validateContact(from({ phone: "abc" }));
    assert.equal(result.ok, false);
    if (!result.ok) {
      assert.deepEqual(Object.keys(result.errors).sort(), ["email", "message", "name", "phone"]);
    }
  });

  it("rejects a malformed email and an oversized message", () => {
    const result = validateContact(from({ ...VALID, email: "nope@", message: "x".repeat(5001) }));
    assert.equal(result.ok, false);
    if (!result.ok) {
      assert.ok(result.errors.email);
      assert.ok(result.errors.message);
    }
  });

  it("accepts a formatted phone number", () => {
    const result = validateContact(from({ ...VALID, phone: "+1 (403) 555-0123" }));
    assert.equal(result.ok, true);
  });
});
