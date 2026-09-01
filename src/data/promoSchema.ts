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

function hashString(value: string): string {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(36);
}

function createPromotionId(promo: PromotionConfigInput): string {
  const explicitId = normalizeString(promo.id);
  if (explicitId) return explicitId;

  return `promotion-${hashString(
    [promo.name, promo.url, promo.visual].map(normalizeString).join("|"),
  )}`;
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
    id: createPromotionId(promo),
    name,
    nameText: htmlToText(name),
    nameHtml: sanitizePromotionHtml(name),
    descriptionHtml: sanitizePromotionHtml(promo.description),
    visual: normalizeString(promo.visual),
    url: normalizeString(promo.url),
    filters,
    legal: normalizeString(promo.legal ?? promo.ligal),
    erid: normalizeString(promo.erid),
    appErid: normalizeString(promo.app_erid),
    promoStart: normalizeString(promo.promo_start),
    promoEnd: normalizeString(promo.promo_end),
    promoEndText: normalizeString(promo.promo_end_text),
    analytics: Object.freeze({
      bonusImpression: isBonusPromotion(promo, filters),
    }),
  });
}

export function normalizePromotions(list: readonly unknown[]): NormalizedPromotions {
  const promotions: Promotion[] = [];
  const invalid: InvalidPromotion[] = [];
  const ids = new Set<string>();
  let fallbackIdCount = 0;

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

    if (!normalizeString(promo.id)) fallbackIdCount += 1;

    const promotion = normalizePromotion(promo, parseFilters(promo));
    if (ids.has(promotion.id)) {
      invalid.push({name: promotion.name, missing: []});
      console.warn(`[info-actions] Дублирующийся id ${promotion.id}; запись пропущена.`);
      return;
    }

    ids.add(promotion.id);
    promotions.push(promotion);
  });

  if (fallbackIdCount > 0) {
    console.warn(
      `[info-actions] У ${fallbackIdCount} записей отсутствует id; ` +
        "использованы детерминированные fallback ID.",
    );
  }

  return {promotions, invalid};
}
