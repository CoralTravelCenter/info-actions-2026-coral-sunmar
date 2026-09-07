export interface PromotionAnalyticsConfig {
  bonusImpression?: boolean;
}

/** Сырой объект акции из внешнего конфига. */
export interface PromotionConfig {
  name: string;
  visual: string;
  /** Историческое поле; поддерживается до миграции внешнего конфига. */
  filter?: string | string[];
  /** Канонический формат фильтров. */
  filters?: string[];
  description?: string;
  url?: string;
  promo_start?: string;
  promo_end?: string;
  erid?: string;
  app_erid?: string;
  legal?: string;
  /** Историческое имя; поддерживается до миграции внешнего конфига. */
  ligal?: string;
  analytics?: PromotionAnalyticsConfig;
}

/** Полностью нормализованная внутренняя модель. */
export interface Promotion {
  name: string;
  nameText: string;
  nameHtml: string;
  descriptionHtml: string;
  descriptionText: string;
  visual: string;
  url: string;
  filters: string[];
  legal: string;
  erid: string;
  appErid: string;
  promoStart: string;
  promoEnd: string;
  analytics: {
    bonusImpression: boolean;
  };
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
