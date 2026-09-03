import {beforeEach, describe, expect, it, vi} from "vitest";

const cases = [
  {
    file: "./promotion-click-metrika-coral.js",
    counterId: 96674199,
    promotions: [
      ["Азиатские недели с Coral Travel", "asian_weeks"],
      ["Зажгите новогоднее настроение", "ny_normal_27"],
      ["Выгодные путешествия летом!", "june_26"],
    ],
  },
  {
    file: "./promotion-click-metrika-sunmar.js",
    counterId: 215233,
    promotions: [
      ["На всё готовое — в Новый год", "NY_26_27"],
      ["Ловите двойную волну выгоды!", "hotels_of_the_week"],
      ["Хотим на море!", "june_26"],
    ],
  },
];

describe.each(cases)("$file", ({file, counterId, promotions}) => {
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

  it.each(promotions)("передаёт код для %s", (name, entryPoint) => {
    clickListener({detail: {name}});

    expect(ym).toHaveBeenCalledWith(counterId, "reachGoal", "entry-point", {
      name_stock: {
        [entryPoint]: {name_point: "promo_page"},
      },
    });
  });

  it("не вызывает Метрику для неизвестной акции", () => {
    clickListener({detail: {name: "Другая акция"}});

    expect(ym).not.toHaveBeenCalled();
  });
});
