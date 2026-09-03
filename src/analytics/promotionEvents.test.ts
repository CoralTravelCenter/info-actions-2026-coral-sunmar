import {afterEach, describe, expect, it, vi} from "vitest";

import {dispatchPromotionClick, PROMOTION_CLICK_EVENT} from "./promotionEvents";

describe("dispatchPromotionClick", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("передаёт во внешнее событие только name", () => {
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

    dispatchPromotionClick({name: "Азиатские недели"});

    expect(dispatchEvent).toHaveBeenCalledOnce();
    const event = dispatchEvent.mock.calls[0]?.[0] as CustomEventStub<{name: string}>;
    expect(event.type).toBe(PROMOTION_CLICK_EVENT);
    expect(event.detail).toEqual({name: "Азиатские недели"});
    expect(Object.keys(event.detail)).toEqual(["name"]);
  });
});
