import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { AGE_GATE_ATTRIBUTE, AGE_GATE_SCRIPT } from "./age-gate.ts";

/** Runs the inline script against a cookie string; true when it would show the gate. */
function showsGate(cookie: string): boolean {
  const attributes = new Map<string, string>();
  const document = {
    cookie,
    documentElement: { setAttribute: (name: string, value: string) => attributes.set(name, value) },
  };
  new Function("document", AGE_GATE_SCRIPT)(document);
  return attributes.get(AGE_GATE_ATTRIBUTE) === "show";
}

describe("AGE_GATE_SCRIPT", () => {
  it("shows the gate without the cookie", () => {
    assert.equal(showsGate(""), true);
    assert.equal(showsGate("kinetus_cart=%5B%5D"), true);
    assert.equal(showsGate("kinetus_age=0"), true);
    assert.equal(showsGate("xkinetus_age=1"), true);
  });
  it("stays hidden with the cookie wherever it sits in the string", () => {
    assert.equal(showsGate("kinetus_age=1"), false);
    assert.equal(showsGate("kinetus_cart=%5B%5D; kinetus_age=1"), false);
    assert.equal(showsGate("a=b; kinetus_age=1; c=d"), false);
  });
});
