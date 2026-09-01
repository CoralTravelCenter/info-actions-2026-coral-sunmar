import {describe, expect, it} from "vitest";

import {detectBrand} from "./brand";

describe("detectBrand", () => {
  it.each([
    ["coral.ru", "coral"],
    ["www.coral.ru", "coral"],
    ["sunmar.ru", "sunmar"],
    ["offers.sunmar.ru", "sunmar"],
  ] as const)("определяет %s как %s", (hostname, brand) => {
    expect(detectBrand(hostname)).toBe(brand);
  });

  it("не включает аналитику на постороннем домене", () => {
    expect(detectBrand("coral.example.com")).toBeNull();
  });
});
