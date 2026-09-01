import {effectScope, nextTick, ref} from "vue";
import {describe, expect, it} from "vitest";

import {ENDING_SOON_FILTER, usePromotions} from "./usePromotions";

describe("usePromotions", () => {
  it("сбрасывает выбранный фильтр, когда его последняя акция завершилась", async () => {
    const currentTime = ref(new Date("2026-09-01T08:00:00Z"));
    const scope = effectScope();
    const state = scope.run(() =>
      usePromotions([
        {
          id: "timed",
          name: "Ограниченная акция",
          visual: "timed.webp",
          filter: "Скоро закончится",
          promo_end: "2026-09-01 11:01",
        },
        {
          id: "stable",
          name: "Постоянная акция",
          visual: "stable.webp",
          filter: "Постоянные",
        },
      ], currentTime),
    );

    expect(state).toBeDefined();
    if (!state) return;

    state.currentFilter.value = "Скоро закончится";
    expect(state.filteredPromotions.value).toHaveLength(1);

    currentTime.value = new Date("2026-09-01T08:02:00Z");
    await nextTick();

    expect(state.filters.value).not.toContain("Скоро закончится");
    expect(state.currentFilter.value).toBe("Все акции");
    expect(state.filteredPromotions.value.map(promotion => promotion.id)).toEqual(["stable"]);

    scope.stop();
  });

  it("добавляет сроковой фильтр и сортирует его по ближайшему завершению", () => {
    const state = usePromotions([
      {
        id: "later",
        name: "Поздняя",
        visual: "later.webp",
        promo_end: "2026-09-25 23:59",
      },
      {
        id: "sooner",
        name: "Ближайшая",
        visual: "sooner.webp",
        promo_end: "2026-09-10 23:59",
      },
      {
        id: "long",
        name: "Долгая",
        visual: "long.webp",
        promo_end: "2026-12-31 23:59",
      },
    ], ref(new Date("2026-09-01T09:00:00Z")));

    expect(state.filters.value).toContain(ENDING_SOON_FILTER);
    state.currentFilter.value = ENDING_SOON_FILTER;
    expect(state.filteredPromotions.value.map(promotion => promotion.id)).toEqual([
      "sooner",
      "later",
    ]);
  });
});
