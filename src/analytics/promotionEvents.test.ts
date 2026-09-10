import {afterEach, describe, expect, it, vi} from "vitest";

import {dispatchPromotionClick, PROMOTION_CLICK_EVENT} from "./promotionEvents";

describe("dispatchPromotionClick", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("передаёт нейтральные данные акции во внешнее событие", () => {
    const dispatchEvent = vi.fn();
    class CustomEventStub<T> {
      constructor(
        public readonly type: string,
        public readonly init: {detail: T},
      ) {}

      get detail(): T {
        return this.init.detail;
      }
    }

    vi.stubGlobal("document", {dispatchEvent});
    vi.stubGlobal("CustomEvent", CustomEventStub);

    dispatchPromotionClick({
      id: "asian-weeks-2026",
      name: "Азиатские недели",
      url: "/offers/asian-weeks/",
    });

    expect(dispatchEvent).toHaveBeenCalledOnce();
    const event = dispatchEvent.mock.calls[0]?.[0] as CustomEventStub<{
      id: string;
      name: string;
      url: string;
    }>;
    expect(event.type).toBe(PROMOTION_CLICK_EVENT);
    expect(event.detail).toEqual({
      id: "asian-weeks-2026",
      name: "Азиатские недели",
      url: "/offers/asian-weeks/",
    });
  });
});
