import type {
  InvalidPromotion,
  NormalizedPromotions,
  Promotion,
  PromotionConfig,
  PromotionConfigInput,
} from "../types/promotion";

/** Поля, без которых карточку нечем нарисовать. */
export const REQUIRED_FIELDS = ["name", "visual"] as const satisfies ReadonlyArray<
  keyof PromotionConfig
>;

/** Фильтр бонусной программы: явное значение вместо regex `/bonus/i`. */
export const BONUS_FILTER = "CoralBonus";

function missingRequired(
  promo: PromotionConfigInput,
): InvalidPromotion["missing"] {
  return REQUIRED_FIELDS.filter(
    (field) => !String(promo[field] ?? "").trim(),
  );
}

function parseFilters(filter?: PromotionConfig["filter"]): string[] {
  if (filter == null) return [];

  const values = Array.isArray(filter) ? filter : filter.split(",");
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))];
}

/**
 * Проверяет обязательные поля и добавляет значения, нужные слою отображения.
 * Необязательные поля сохраняются без подстановки пустых значений.
 */
export function normalizePromotions(
  list: PromotionConfigInput[],
): NormalizedPromotions {
  const promotions: Promotion[] = [];
  const invalid: InvalidPromotion[] = [];

  list.forEach((promo, index) => {
    const missing = missingRequired(promo);

    if (missing.length) {
      invalid.push({
        name: String(promo.name ?? "").trim() || `запись #${index + 1}`,
        missing,
      });
      return;
    }

    // После missingRequired обе строки гарантированно существуют и непусты.
    const validPromo = promo as PromotionConfig;
    const filtersArr = parseFilters(validPromo.filter);

    promotions.push({
      ...validPromo,
      filtersArr,
      id: validPromo.id ?? `${validPromo.name}|${validPromo.url ?? ""}`,
      isBonus: filtersArr.includes(BONUS_FILTER),
    });
  });

  return {promotions, invalid};
}
