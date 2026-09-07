import {afterEach, describe, expect, it, vi} from "vitest";

import {waitForAppPrerequisites} from "./waitForAppPrerequisites";

describe("waitForAppPrerequisites", () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it("завершается сразу, когда host и конфиг готовы", async () => {
    const host = {getBoundingClientRect: () => ({height: 100})};
    vi.stubGlobal("document", {querySelector: vi.fn(() => host)});
    vi.stubGlobal("window", {_promotion_settings: []});

    await expect(waitForAppPrerequisites()).resolves.toEqual({
      hostReady: true,
      configReady: true,
      timedOut: false,
    });
  });

  it("дожидается появления конфига", async () => {
    vi.useFakeTimers();
    const host = {getBoundingClientRect: () => ({height: 100})};
    const runtimeWindow: {_promotion_settings?: unknown[]} = {};
    vi.stubGlobal("document", {querySelector: vi.fn(() => host)});
    vi.stubGlobal("window", runtimeWindow);

    const result = waitForAppPrerequisites("#__next > div", 1_000, 50);
    runtimeWindow._promotion_settings = [];
    await vi.advanceTimersByTimeAsync(50);

    await expect(result).resolves.toEqual({
      hostReady: true,
      configReady: true,
      timedOut: false,
    });
  });

  it("возвращает состояние через секунду и прекращает polling", async () => {
    vi.useFakeTimers();
    const querySelector = vi.fn(() => null);
    vi.stubGlobal("document", {querySelector});
    vi.stubGlobal("window", {});

    const result = waitForAppPrerequisites();
    await vi.advanceTimersByTimeAsync(1_000);

    await expect(result).resolves.toEqual({
      hostReady: false,
      configReady: false,
      timedOut: true,
    });
    const callsAfterTimeout = querySelector.mock.calls.length;
    await vi.advanceTimersByTimeAsync(1_000);
    expect(querySelector).toHaveBeenCalledTimes(callsAfterTimeout);
  });
});
