import type {
  InvalidPromotion,
  NormalizedPromotions,
  Promotion,
  PromotionConfig,
  PromotionConfigInput,
} from "../types/promotion";

export const REQUIRED_FIELDS = ["name", "visual"] as const satisfies ReadonlyArray<
  keyof PromotionConfig
>;

const ALLOWED_LINE_BREAK = /<br\s*\/?>/gi;

function normalizeString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function isPromotionConfigInput(value: unknown): value is PromotionConfigInput {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

/** Экранирует весь HTML, сохраняя только безопасный перенос строки. */
export function sanitizePromotionHtml(value: unknown): string {
  return normalizeString(value)
    .split(ALLOWED_LINE_BREAK)
    .map(escapeHtml)
    .join("<br>");
}

function htmlToText(value: unknown): string {
  return normalizeString(value).replace(ALLOWED_LINE_BREAK, " ");
}

function missingRequired(promo: PromotionConfigInput): InvalidPromotion["missing"] {
  return REQUIRED_FIELDS.filter(field => !normalizeString(promo[field]));
}

function parseFilters(promo: PromotionConfigInput): string[] {
  const rawFilters = promo.filters ?? promo.filter ?? [];
  const values = Array.isArray(rawFilters) ? rawFilters : String(rawFilters).split(",");
  return [...new Set(values.map(normalizeString).filter(Boolean))];
}

function isBonusPromotion(promo: PromotionConfigInput, filters: string[]): boolean {
  if (typeof promo.analytics?.bonusImpression === "boolean") {
    return promo.analytics.bonusImpression;
  }

  const legacyIdentity = [...filters, promo.name, promo.url]
    .map(normalizeString)
    .join(" ");

  return /(coralbonus|sunmarbonus|(?:^|[/?&_-])cb(?:[/?&=_-]|$))/i.test(
    legacyIdentity,
  );
}

function normalizePromotion(
  promo: PromotionConfigInput,
  filters: string[],
): Promotion {
  const name = normalizeString(promo.name);

  return Object.freeze({
    name,
    nameText: htmlToText(name),
    nameHtml: sanitizePromotionHtml(name),
    descriptionHtml: sanitizePromotionHtml(promo.description),
    descriptionText: htmlToText(promo.description),
    visual: normalizeString(promo.visual),
    url: normalizeString(promo.url),
    filters,
    legal: normalizeString(promo.legal ?? promo.ligal),
    erid: normalizeString(promo.erid),
    appErid: normalizeString(promo.app_erid),
    promoStart: normalizeString(promo.promo_start),
    promoEnd: normalizeString(promo.promo_end),
    analytics: Object.freeze({
      bonusImpression: isBonusPromotion(promo, filters),
    }),
  });
}

export function normalizePromotions(list: readonly unknown[]): NormalizedPromotions {
  const promotions: Promotion[] = [];
  const invalid: InvalidPromotion[] = [];
  const names = new Set<string>();

  list.forEach((value, index) => {
    if (!isPromotionConfigInput(value)) {
      invalid.push({
        name: `запись #${index + 1}`,
        missing: [...REQUIRED_FIELDS],
      });
      return;
    }

    const promo = value;
    const missing = missingRequired(promo);
    if (missing.length) {
      invalid.push({
        name: normalizeString(promo.name) || `запись #${index + 1}`,
        missing,
      });
      return;
    }

    const promotion = normalizePromotion(promo, parseFilters(promo));
    if (names.has(promotion.nameText)) {
      invalid.push({name: promotion.name, missing: []});
      console.warn(
        `[info-actions] Дублирующееся название ${promotion.nameText}; запись пропущена.`,
      );
      return;
    }

    names.add(promotion.nameText);
    promotions.push(promotion);
  });

  return {promotions, invalid};
}
