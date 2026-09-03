import {describe, expect, it, vi} from "vitest";

import {collectConfigDiagnostics, collectConfigWarnings} from "./promotionDiagnostics";

describe("configWarnings", () => {
  it("диагностирует legacy-поля, не превращая их в UI-ошибки", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    const promotions = [{
      name: "Акция",
      visual: "https://example.com/image.webp",
      filter: "По направлениям",
      ligal: "ООО «Компания»",
    }];

    expect(collectConfigWarnings(promotions)).toEqual([]);
    expect(warn).toHaveBeenCalledWith(
      "[info-actions] диагностика контракта акций:",
      expect.arrayContaining([
        "1 записей используют legacy-поле filter; каноническое поле — filters",
        "1 записей используют legacy-поле ligal; каноническое поле — legal",
      ]),
    );
  });

  it("находит некорректные даты и обратный диапазон", () => {
    expect(collectConfigDiagnostics([
      {
        name: "Невалидная дата",
        visual: "/image.webp",
        promo_start: "2026-02-30 12:00",
      },
      {
        name: "Обратный диапазон",
        visual: "/image.webp",
        promo_start: "2026-09-10 00:00",
        promo_end: "2026-09-09 23:59",
      },
    ])).toEqual([
      "Невалидная дата — некорректное поле promo_start, ожидается YYYY-MM-DD HH:mm",
      "Обратный диапазон — promo_start позже promo_end",
    ]);
  });

  it("проверяет URL и несовместимые значения канонических полей", () => {
    expect(collectConfigDiagnostics([
      {
        name: "Акция",
        visual: "javascript:alert(1)",
        url: "mailto:test@example.com",
        filter: "Старый",
        filters: ["Новый", 42],
        ligal: "Старое значение",
        legal: "Новое значение",
        analytics: {bonusImpression: "yes"},
      },
    ])).toEqual(expect.arrayContaining([
      "Акция — filters содержит значение не строкового типа",
      "Акция — одновременно заданы filter и filters",
      "Акция — одновременно заданы ligal и legal",
      "Акция — поле visual содержит неподдерживаемый URL",
      "Акция — поле url содержит неподдерживаемый URL",
      "Акция — analytics.bonusImpression должен быть boolean",
    ]));
  });
});
