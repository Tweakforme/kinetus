import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createInFlight } from "./in-flight.ts";

/** The product page's Add to cart handler, reduced to what the guard decides. */
function addButton(send: () => Promise<void>) {
  const flight = createInFlight();
  return () => {
    if (!flight.start()) {
      return;
    }
    send()
      .finally(() => flight.finish())
      .catch(() => {});
  };
}

describe("createInFlight", () => {
  it("refuses a second start until the first finishes", () => {
    const flight = createInFlight();
    assert.equal(flight.start(), true);
    assert.equal(flight.start(), false);
    flight.finish();
    assert.equal(flight.start(), true);
  });

  it("two activations in one task send once (the double add-to-cart path)", async () => {
    let sent = 0;
    let release!: () => void;
    const onAdd = addButton(() => {
      sent += 1;
      return new Promise<void>((resolve) => (release = resolve));
    });
    onAdd();
    onAdd();
    assert.equal(sent, 1);
    release();
    await new Promise((resolve) => setImmediate(resolve));
    onAdd();
    assert.equal(sent, 2, "a later, separate press still adds");
  });

  it("frees the button when the action fails", async () => {
    let sent = 0;
    const onAdd = addButton(() => {
      sent += 1;
      return Promise.reject(new Error("network"));
    });
    onAdd();
    await new Promise((resolve) => setImmediate(resolve));
    onAdd();
    assert.equal(sent, 2);
  });
});
