import type {InvalidPromotion} from "../types/promotion";

export function isWarningsVisible(): boolean {
  if (import.meta.env.DEV) return true;
  return new URLSearchParams(location.search).get("promo_debug") === "1";
}

/** Показывает только ошибки, которые нельзя безопасно восстановить нормализатором. */
export function collectConfigWarnings(
  _promotions: readonly unknown[],
  invalid: InvalidPromotion[] = [],
): string[] {
  const messages = invalid.map(({name, missing}) =>
    missing.length
      ? `${name} — не отрисована, нет полей: ${missing.join(", ")}`
      : `${name} — не отрисована из-за дублирующегося id`,
  );

  if (messages.length) {
    console.warn("[info-actions] проблемы в конфиге акций:", messages);
  }

  return messages;
}
