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
        id: "promotion",
        name: "Акция",
        visual: "image.webp",
        filter: "По направлениям, CoralBonus, CoralBonus",
        ligal: "ООО «Компания»",
      },
    ]);

    expect(invalid).toEqual([]);
    expect(promotions[0]).toMatchObject({
      filters: ["По направлениям", "CoralBonus"],
      legal: "ООО «Компания»",
    });
  });

  it("отбрасывает записи без обязательных полей и повторяющиеся id", () => {
    vi.spyOn(console, "warn").mockImplementation(() => undefined);

    const result = normalizePromotions([
      {id: "same", name: "Первая акция", visual: "first.webp"},
      {id: "same", name: "Вторая акция", visual: "second.webp"},
      {id: "without-image", name: "Без изображения"},
      {name: "Без id", visual: "image.webp"},
    ]);

    expect(result.promotions).toHaveLength(1);
    expect(result.invalid).toEqual([
      {id: "same", name: "Вторая акция", missing: []},
      {name: "Без изображения", missing: ["visual"]},
      {name: "Без id", missing: ["id"]},
    ]);
  });

  it("безопасно отбрасывает null, массивы и примитивы", () => {
    const result = normalizePromotions([null, "акция", 42, []]);

    expect(result.promotions).toEqual([]);
    expect(result.invalid).toEqual([
      {name: "запись #1", missing: ["id", "name", "visual"]},
      {name: "запись #2", missing: ["id", "name", "visual"]},
      {name: "запись #3", missing: ["id", "name", "visual"]},
      {name: "запись #4", missing: ["id", "name", "visual"]},
    ]);
  });

  it("разрешает одинаковые названия при разных id", () => {
    const result = normalizePromotions([
      {id: "first", name: "Одинаковая акция", visual: "first.webp"},
      {id: "second", name: "Одинаковая акция", visual: "second.webp"},
    ]);

    expect(result.invalid).toEqual([]);
    expect(result.promotions.map(promotion => promotion.id)).toEqual(["first", "second"]);
  });

  it("нормализует id и отклоняет запись без него", () => {
    const result = normalizePromotions([
      {id: "  stable-id  ", name: "Акция", visual: "image.webp"},
      {name: "Без id", visual: "image.webp"},
    ]);

    expect(result.promotions[0]?.id).toBe("stable-id");
    expect(result.invalid).toEqual([{name: "Без id", missing: ["id"]}]);
  });
});
