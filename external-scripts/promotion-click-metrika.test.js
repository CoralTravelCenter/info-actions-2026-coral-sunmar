import {beforeEach, describe, expect, it, vi} from "vitest";

const cases = [
  {
    file: "./promotion-click-metrika-coral.js",
    counterId: 96674199,
    goalName: "entry-point",
    promotions: [
      ["asian-weeks-2026", "asian_weeks"],
      ["new-year-program-2026", "ny_normal_27"],
    ],
  },
  {
    file: "./promotion-click-metrika-sunmar.js",
    counterId: 215233,
    goalName: "entry_point",
    promotions: [
      ["family-early-booking-2027", "eb_winter_27"],
      ["new-year-ready-2026", "NY_26_27"],
    ],
  },
];

describe.each(cases)("$file", ({file, counterId, goalName, promotions}) => {
  let clickListener;
  let ym;

  beforeEach(async () => {
    vi.resetModules();
    clickListener = undefined;
    ym = vi.fn();

    vi.stubGlobal("window", {ym});
    vi.stubGlobal("document", {
      addEventListener: vi.fn((_eventName, listener) => {
        clickListener = listener;
      }),
    });

    await import(file);
  });

  it.each(promotions)("передаёт код для %s", (id, entryPoint) => {
    clickListener({detail: {id}});

    expect(ym).toHaveBeenCalledWith(counterId, "reachGoal", goalName, {
      name_stock: {
        [entryPoint]: {name_point: "promo_page"},
      },
    });
  });

  it("не вызывает Метрику для неизвестной акции", () => {
    clickListener({detail: {id: "another-promotion"}});

    expect(ym).not.toHaveBeenCalled();
  });

  it("игнорирует событие без корректного detail", () => {
    expect(() => clickListener({})).not.toThrow();
    expect(() => clickListener({detail: {id: null}})).not.toThrow();
    expect(ym).not.toHaveBeenCalled();
  });

  it("не падает, если Метрика ещё не готова", () => {
    window.ym = undefined;

    expect(() => clickListener({detail: {id: promotions[0][0]}})).not.toThrow();
  });
});
