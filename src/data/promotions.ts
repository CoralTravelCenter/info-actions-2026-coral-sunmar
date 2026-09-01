const GLOBAL_KEY = "_promotion_settings";

declare global {
  interface Window {
    _promotion_settings?: unknown;
  }
}

function readGlobal(): unknown[] | null {
  const value = window[GLOBAL_KEY];
  return Array.isArray(value) && value.length ? value : null;
}

/** Читает конфиг, подключённый до запуска Vue-приложения. */
export function getPromotions(): unknown[] {
  const promotions = readGlobal();
  if (promotions) return promotions;

  console.warn(`[info-actions] window.${GLOBAL_KEY} не найден — акции не отрисованы.`);
  return [];
}
