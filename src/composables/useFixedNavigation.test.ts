import {describe, expect, it} from "vitest";
import {resolveNavigationState} from "./useFixedNavigation";

const fixedVisible = {
  isFixed: true,
  isVisible: true,
  downwardConfirmations: 0,
};

describe("resolveNavigationState", () => {
  it("не фиксирует навигацию до достижения верхнего отступа", () => {
    expect(resolveNavigationState(fixedVisible, {
      anchorTop: 65,
      topOffset: 64,
      scrollDelta: 20,
      hideStep: 48,
      showDistance: 24,
      hideConfirmations: 2,
      distanceSinceFixed: 100,
      initialHideDistance: 64,
    })).toEqual({
      isFixed: false,
      isVisible: true,
      downwardConfirmations: 0,
    });
  });

  it("при первом закреплении оставляет навигацию видимой", () => {
    expect(resolveNavigationState(
      {isFixed: false, isVisible: true, downwardConfirmations: 0},
      {
        anchorTop: 64,
        topOffset: 64,
        scrollDelta: 20,
        hideStep: 48,
        showDistance: 24,
        hideConfirmations: 2,
        distanceSinceFixed: 0,
        initialHideDistance: 64,
      },
    )).toEqual(fixedVisible);
  });

  it("не скрывает навигацию до прохождения её высоты", () => {
    expect(resolveNavigationState(fixedVisible, {
      anchorTop: -20,
      topOffset: 0,
      scrollDelta: 20,
      hideStep: 48,
      showDistance: 24,
      hideConfirmations: 2,
      distanceSinceFixed: 63,
      initialHideDistance: 64,
    })).toEqual(fixedVisible);
  });

  it("скрывает после второго движения вниз и показывает вверх", () => {
    const armed = resolveNavigationState(fixedVisible, {
      anchorTop: -100,
      topOffset: 0,
      scrollDelta: 48,
      hideStep: 48,
      showDistance: 24,
      hideConfirmations: 2,
      distanceSinceFixed: 64,
      initialHideDistance: 64,
    });
    expect(armed).toEqual({
      isFixed: true,
      isVisible: true,
      downwardConfirmations: 1,
    });

    const hidden = resolveNavigationState(armed, {
      anchorTop: -148,
      topOffset: 0,
      scrollDelta: 48,
      hideStep: 48,
      showDistance: 24,
      hideConfirmations: 2,
      distanceSinceFixed: 112,
      initialHideDistance: 64,
    });
    expect(hidden).toEqual({
      isFixed: true,
      isVisible: false,
      downwardConfirmations: 2,
    });

    expect(resolveNavigationState(hidden, {
      anchorTop: -100,
      topOffset: 0,
      scrollDelta: -23,
      hideStep: 48,
      showDistance: 24,
      hideConfirmations: 2,
      distanceSinceFixed: 80,
      initialHideDistance: 64,
    })).toEqual(hidden);

    expect(resolveNavigationState(hidden, {
      anchorTop: -100,
      topOffset: 0,
      scrollDelta: -24,
      hideStep: 48,
      showDistance: 24,
      hideConfirmations: 2,
      distanceSinceFixed: 80,
      initialHideDistance: 64,
    })).toEqual(fixedVisible);
  });
});
