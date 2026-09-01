import {describe, expect, it} from "vitest";

import {filterFreshOffers, isEndingSoon} from "./filterFreshOffers";

describe("filterFreshOffers", () => {
  it("считает московские границы включительно", () => {
    const promotion = {
      promoStart: "2026-09-01 00:00",
      promoEnd: "2026-09-01 23:59",
    };

    expect(filterFreshOffers(promotion, new Date("2026-08-31T20:59:59Z"))).toBe(false);
    expect(filterFreshOffers(promotion, new Date("2026-08-31T21:00:00Z"))).toBe(true);
    expect(filterFreshOffers(promotion, new Date("2026-09-01T20:59:00Z"))).toBe(true);
    expect(filterFreshOffers(promotion, new Date("2026-09-01T20:59:01Z"))).toBe(false);
  });

  it("считает акцию без дат бессрочной", () => {
    expect(filterFreshOffers({promoStart: "", promoEnd: ""})).toBe(true);
  });

  it("отбрасывает акцию с некорректной датой", () => {
    expect(filterFreshOffers({promoStart: "не дата", promoEnd: ""})).toBe(false);
  });

  it("определяет акции, завершающиеся в ближайшие 30 дней", () => {
    const now = new Date("2026-09-01T09:00:00Z");

    expect(isEndingSoon({promoEnd: "2026-09-20 12:00"}, now)).toBe(true);
    expect(isEndingSoon({promoEnd: "2026-10-02 12:01"}, now)).toBe(false);
    expect(isEndingSoon({promoEnd: ""}, now)).toBe(false);
  });
});
