import {describe, expect, it, vi} from "vitest";

import {normalizePromotions, sanitizePromotionHtml} from "./promoSchema";

describe("promoSchema", () => {
  it("экранирует HTML и сохраняет только переносы br", () => {
    expect(sanitizePromotionHtml('Акция<br><script>alert("x")</script>')).toBe(
      "Акция<br>&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt;",
    );
  });

  it("нормализует фильтры и legacy-поле ligal", () => {
    vi.spyOn(console, "warn").mockImplementation(() => undefined);

    const {promotions, invalid} = normalizePromotions([
      {
        id: "promo-1",
        name: "Акция",
        visual: "image.webp",
        filter: "По направлениям, CoralBonus, CoralBonus",
        ligal: "ООО «Компания»",
      },
    ]);

    expect(invalid).toEqual([]);
    expect(promotions[0]).toMatchObject({
      id: "promo-1",
      filters: ["По направлениям", "CoralBonus"],
      legal: "ООО «Компания»",
    });
  });

  it("отбрасывает записи без обязательных полей и повторяющиеся id", () => {
    vi.spyOn(console, "warn").mockImplementation(() => undefined);

    const result = normalizePromotions([
      {id: "same", name: "Первая", visual: "first.webp"},
      {id: "same", name: "Вторая", visual: "second.webp"},
      {name: "Без изображения"},
    ]);

    expect(result.promotions).toHaveLength(1);
    expect(result.invalid).toEqual([
      {name: "Вторая", missing: []},
      {name: "Без изображения", missing: ["visual"]},
    ]);
  });

  it("безопасно отбрасывает null, массивы и примитивы", () => {
    const result = normalizePromotions([null, "акция", 42, []]);

    expect(result.promotions).toEqual([]);
    expect(result.invalid).toEqual([
      {name: "запись #1", missing: ["name", "visual"]},
      {name: "запись #2", missing: ["name", "visual"]},
      {name: "запись #3", missing: ["name", "visual"]},
      {name: "запись #4", missing: ["name", "visual"]},
    ]);
  });

  it("создаёт детерминированный fallback id", () => {
    vi.spyOn(console, "warn").mockImplementation(() => undefined);
    const config = [{name: "Акция", visual: "image.webp", url: "/offer"}];

    const firstId = normalizePromotions(config).promotions[0]?.id;
    const secondId = normalizePromotions(config).promotions[0]?.id;

    expect(firstId).toMatch(/^promotion-/);
    expect(secondId).toBe(firstId);
  });
});
