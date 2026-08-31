import type {PromotionConfigInput} from "../types/promotion";

const GLOBAL_KEY = "_promotion_settings";

declare global {
  interface Window {
    _promotion_settings?: unknown;
  }
}

function readGlobal(): PromotionConfigInput[] | null {
  const value = window[GLOBAL_KEY];
  return Array.isArray(value) && value.length
    ? (value as PromotionConfigInput[])
    : null;
}

/**
 * Возвращает сырой список акций: внешний конфиг на проде или DEV-фикстуру.
 * Проверка отдельных записей выполняется в `normalizePromotions`.
 */
export async function loadPromotions(): Promise<PromotionConfigInput[]> {
  const external = readGlobal();
  if (external) return external;

  if (import.meta.env.DEV) {
    const {PROMOTIONS_DEV} = await import("./promotions.dev.js");
    console.info(
      `[info-actions] window.${GLOBAL_KEY} не найден — используется dev-фикстура ` +
        `(${PROMOTIONS_DEV.length} записей). На проде данные придут из внешнего скрипта.`,
    );
    return PROMOTIONS_DEV as PromotionConfigInput[];
  }

  console.warn(
    `[info-actions] window.${GLOBAL_KEY} не найден — акции не отрисованы.`,
  );
  return [];
}
