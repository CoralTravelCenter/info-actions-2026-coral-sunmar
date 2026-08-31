/**
 * Конфиг одной акции, получаемый из внешнего источника.
 *
 * `name` и `visual` обязательны для рендера. Остальные поля опциональны:
 * отсутствие значения является допустимым состоянием и обрабатывается UI.
 */
export interface PromotionConfig {
  name: string;
  visual: string;
  id?: string;
  filter?: string | string[];
  description?: string;
  url?: string;
  promo_start?: string;
  promo_end?: string;
  promo_end_text?: string;
  erid?: string;
  app_erid?: string;
  /** Историческое имя поля. После миграции внешнего конфига заменить на `legal`. */
  ligal?: string;
  entry_point?: string;
}

/** Акция после проверки и нормализации, готовая к рендеру. */
export interface Promotion extends PromotionConfig {
  id: string;
  filtersArr: string[];
  isBonus: boolean;
}

export type PromotionConfigInput = Partial<PromotionConfig>;

export interface InvalidPromotion {
  name: string;
  missing: Array<keyof Pick<PromotionConfig, "name" | "visual">>;
}

export interface NormalizedPromotions {
  promotions: Promotion[];
  invalid: InvalidPromotion[];
}
