import {describe, expect, it} from "vitest";

import {resolveErid} from "./usePromotionContext";

describe("resolveErid", () => {
  const promotion = {erid: "web-erid", appErid: "app-erid"};

  it("использует обычный erid вне приложения", () => {
    expect(resolveErid(promotion, false)).toBe("web-erid");
  });

  it("использует app_erid при mw=true", () => {
    expect(resolveErid(promotion, true)).toBe("app-erid");
  });

  it("не активирует app-логику без app_erid", () => {
    expect(resolveErid({erid: "web-erid", appErid: ""}, true)).toBe("web-erid");
  });
});
