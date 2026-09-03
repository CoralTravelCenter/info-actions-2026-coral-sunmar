import type {InvalidPromotion, PromotionConfigInput} from "../types/promotion";

const PROMOTION_DATE_PATTERN =
  /^(\d{4})-(\d{2})-(\d{2}) ([01]\d|2[0-3]):([0-5]\d)$/;

function isRecord(value: unknown): value is PromotionConfigInput {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getPromotionLabel(promotion: PromotionConfigInput, index: number): string {
  const name = typeof promotion.name === "string" ? promotion.name.trim() : "";
  return name || `запись #${index + 1}`;
}

function isValidPromotionDate(value: unknown): boolean {
  if (typeof value !== "string") return false;

  const match = PROMOTION_DATE_PATTERN.exec(value.trim());
  if (!match) return false;

  const [, year, month, day, hours, minutes] = match;
  const parsed = new Date(Date.UTC(
    Number(year),
    Number(month) - 1,
    Number(day),
    Number(hours),
    Number(minutes),
  ));

  return parsed.getUTCFullYear() === Number(year)
    && parsed.getUTCMonth() === Number(month) - 1
    && parsed.getUTCDate() === Number(day)
    && parsed.getUTCHours() === Number(hours)
    && parsed.getUTCMinutes() === Number(minutes);
}

function isSupportedUrl(value: unknown): boolean {
  if (typeof value !== "string" || !value.trim()) return false;

  try {
    const url = new URL(value.trim(), "https://config-validation.invalid");
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

/** Диагностика контракта без изменения или отбрасывания восстановимых записей. */
export function collectConfigDiagnostics(promotions: readonly unknown[]): string[] {
  const diagnostics: string[] = [];
  let legacyFilterCount = 0;
  let legacyLegalCount = 0;

  promotions.forEach((value, index) => {
    if (!isRecord(value)) return;

    const label = getPromotionLabel(value, index);
    if ("filter" in value) legacyFilterCount += 1;
    if ("ligal" in value) legacyLegalCount += 1;

    if ("filters" in value && !Array.isArray(value.filters)) {
      diagnostics.push(`${label} — поле filters должно быть массивом строк`);
    }
    if (Array.isArray(value.filters) && value.filters.some(filter => typeof filter !== "string")) {
      diagnostics.push(`${label} — filters содержит значение не строкового типа`);
    }
    if ("filter" in value && "filters" in value) {
      diagnostics.push(`${label} — одновременно заданы filter и filters`);
    }
    if ("ligal" in value && "legal" in value) {
      diagnostics.push(`${label} — одновременно заданы ligal и legal`);
    }

    for (const field of ["promo_start", "promo_end"] as const) {
      const date = value[field];
      if (date != null && date !== "" && !isValidPromotionDate(date)) {
        diagnostics.push(`${label} — некорректное поле ${field}, ожидается YYYY-MM-DD HH:mm`);
      }
    }

    if (
      isValidPromotionDate(value.promo_start)
      && isValidPromotionDate(value.promo_end)
      && String(value.promo_start) > String(value.promo_end)
    ) {
      diagnostics.push(`${label} — promo_start позже promo_end`);
    }

    for (const field of ["visual", "url"] as const) {
      const url = value[field];
      if (url != null && url !== "" && !isSupportedUrl(url)) {
        diagnostics.push(`${label} — поле ${field} содержит неподдерживаемый URL`);
      }
    }

    if (
      value.analytics?.bonusImpression != null
      && typeof value.analytics.bonusImpression !== "boolean"
    ) {
      diagnostics.push(`${label} — analytics.bonusImpression должен быть boolean`);
    }
  });

  if (legacyFilterCount) {
    diagnostics.push(
      `${legacyFilterCount} записей используют legacy-поле filter; каноническое поле — filters`,
    );
  }
  if (legacyLegalCount) {
    diagnostics.push(
      `${legacyLegalCount} записей используют legacy-поле ligal; каноническое поле — legal`,
    );
  }

  return diagnostics;
}

export function isWarningsVisible(): boolean {
  if (import.meta.env.DEV) return true;
  return new URLSearchParams(location.search).get("promo_debug") === "1";
}

/** Показывает только ошибки, которые нельзя безопасно восстановить нормализатором. */
export function collectConfigWarnings(
  promotions: readonly unknown[],
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

  const diagnostics = collectConfigDiagnostics(promotions);
  if (diagnostics.length) {
    console.warn("[info-actions] диагностика контракта акций:", diagnostics);
  }

  return messages;
}
