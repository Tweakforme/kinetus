import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { parseSort, sortListing, withSort } from "./sort.ts";

const ITEMS = [
  { name: "TB-500", lowestPriceCents: 6500 },
  { name: "AOD-9604", lowestPriceCents: 9000 },
  { name: "ahk-cu", lowestPriceCents: 3000 },
  { name: "No Price", lowestPriceCents: null },
  { name: "BPC-157", lowestPriceCents: 3000 },
];
const names = (items: typeof ITEMS) => items.map((item) => item.name);

describe("sortListing", () => {
  it("keeps the catalogue order without a sort", () => {
    assert.deepEqual(names(sortListing(ITEMS, null)), names(ITEMS));
  });
  it("sorts by name, ignoring case", () => {
    assert.deepEqual(names(sortListing(ITEMS, "name-asc")), [
      "ahk-cu",
      "AOD-9604",
      "BPC-157",
      "No Price",
      "TB-500",
    ]);
    assert.deepEqual(names(sortListing(ITEMS, "name-desc")), [
      "TB-500",
      "No Price",
      "BPC-157",
      "AOD-9604",
      "ahk-cu",
    ]);
  });
  it("sorts by lowest price with name ties and unpriced items last", () => {
    assert.deepEqual(names(sortListing(ITEMS, "price-asc")), [
      "ahk-cu",
      "BPC-157",
      "TB-500",
      "AOD-9604",
      "No Price",
    ]);
    assert.deepEqual(names(sortListing(ITEMS, "price-desc")), [
      "AOD-9604",
      "TB-500",
      "ahk-cu",
      "BPC-157",
      "No Price",
    ]);
  });
  it("does not mutate its input", () => {
    const copy = [...ITEMS];
    sortListing(ITEMS, "name-asc");
    assert.deepEqual(ITEMS, copy);
  });
});

describe("parseSort and withSort", () => {
  it("accepts only known values", () => {
    assert.equal(parseSort("price-asc"), "price-asc");
    assert.equal(parseSort(["name-desc", "x"]), "name-desc");
    assert.equal(parseSort("price"), null);
    assert.equal(parseSort(undefined), null);
  });
  it("builds hrefs", () => {
    assert.equal(withSort("/products/page/2", "price-asc"), "/products/page/2?sort=price-asc");
    assert.equal(withSort("/products", null), "/products");
    assert.equal(withSort("/products?page=2", "price-asc"), "/products?page=2&sort=price-asc");
  });
});
