export const BRAND_OPTIONS = Object.freeze({CORAL: "coral", SUNMAR: "sunmar"} as const);
export type Brand = (typeof BRAND_OPTIONS)[keyof typeof BRAND_OPTIONS];

type BonusGoalParams = Record<
  string,
  {banner: string}
>;

type YmFunction = ((...args: unknown[]) => void) & {
  a?: unknown[][];
  l?: number;
};

declare global {
  interface Window {
    ym?: YmFunction;
  }
}

export function detectBrand(
  hostname: string = globalThis.location?.hostname ?? "",
): Brand | null {
  const host = String(hostname).toLowerCase();
  if (/(^|\.)coral\.(ru|localhost)$/i.test(host)) return BRAND_OPTIONS.CORAL;
  if (/(^|\.)sunmar\.(ru|localhost)$/i.test(host)) return BRAND_OPTIONS.SUNMAR;
  return null;
}

/** Неизвестный домен получает только визуальную Coral-тему, но не аналитику. */
export const ANALYTICS_BRAND = detectBrand();
export const BRAND = ANALYTICS_BRAND ?? BRAND_OPTIONS.CORAL;

const METRIKA_BY_BRAND = Object.freeze({
  [BRAND_OPTIONS.CORAL]: Object.freeze({
    counterId: 96674199,
    bonusShowGoal: "coral-bonus-show",
  }),
  [BRAND_OPTIONS.SUNMAR]: Object.freeze({
    counterId: 215233,
    bonusShowGoal: "sunmar-bonus-show",
  }),
});

export const METRIKA = ANALYTICS_BRAND
  ? METRIKA_BY_BRAND[ANALYTICS_BRAND]
  : null;

/** Буферизует цель до загрузки Метрики. На неизвестном домене ничего не отправляет. */
export function reachBonusGoal(params: BonusGoalParams): boolean {
  if (!METRIKA) return false;

  if (!window.ym) {
    const ym: YmFunction = (...args: unknown[]) => {
      (ym.a ??= []).push(args);
    };
    ym.l = Date.now();
    window.ym = ym;
  }

  window.ym?.(METRIKA.counterId, "reachGoal", METRIKA.bonusShowGoal, params);

  if (import.meta.env.DEV) {
    console.info(`[metrika] reachGoal → ${METRIKA.bonusShowGoal}`, params);
  }

  return true;
}
