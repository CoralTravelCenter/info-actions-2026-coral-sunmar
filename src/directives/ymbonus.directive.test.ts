import {beforeAll, describe, expect, it, vi} from "vitest";

const intersectionCallbacks: Array<
  (entries: Array<{isIntersecting: boolean}>) => void
> = [];

vi.mock("@vueuse/core", () => ({
  useIntersectionObserver: vi.fn(
    (
      _target: unknown,
      callback: (entries: Array<{isIntersecting: boolean}>) => void,
    ) => {
      intersectionCallbacks.push(callback);
      return {stop: vi.fn()};
    },
  ),
}));

const {reachBonusGoal} = vi.hoisted(() => ({
  reachBonusGoal: vi.fn(() => true),
}));

vi.mock("../config/brand", () => ({reachBonusGoal}));

import ymBonus from "./ymbonus.directive";

describe("v-ym-bonus", () => {
  beforeAll(() => {
    vi.stubGlobal("location", {pathname: "/actions/"});
  });

  it("отправляет исходную метку один раз для каждого увиденного баннера", () => {
    const mounted = typeof ymBonus === "object" ? ymBonus.mounted : undefined;
    if (!mounted) throw new Error("У директивы отсутствует mounted-хук");

    const firstBinding = {
      value: {id: "first", name: "Первая акция", enabled: true},
    };
    const secondBinding = {
      value: {id: "second", name: "Вторая акция", enabled: true},
    };

    mounted({} as HTMLElement, firstBinding as never, {} as never, null);
    mounted({} as HTMLElement, secondBinding as never, {} as never, null);

    expect(reachBonusGoal).not.toHaveBeenCalled();

    intersectionCallbacks[0]?.([{isIntersecting: true}]);
    intersectionCallbacks[0]?.([{isIntersecting: true}]);
    intersectionCallbacks[1]?.([{isIntersecting: false}]);
    intersectionCallbacks[1]?.([{isIntersecting: true}]);
    intersectionCallbacks[1]?.([{isIntersecting: true}]);

    expect(reachBonusGoal).toHaveBeenCalledTimes(2);
    expect(reachBonusGoal).toHaveBeenNthCalledWith(1, {
      "/actions/": {banner: "Первая акция"},
    });
    expect(reachBonusGoal).toHaveBeenNthCalledWith(2, {
      "/actions/": {banner: "Вторая акция"},
    });
  });
});
