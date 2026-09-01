import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

import type {Promotion} from "../types/promotion";

dayjs.extend(customParseFormat);
dayjs.extend(utc);
dayjs.extend(timezone);

const TZ = "Europe/Moscow";
const FORMAT = "YYYY-MM-DD HH:mm";
const ENDING_SOON_DAYS = 30;

function parseMsk(value: string) {
  const parsed = dayjs(value, FORMAT, true);
  if (!parsed.isValid()) return parsed;
  return dayjs.tz(value, FORMAT, TZ);
}

export function filterFreshOffers(
  promotion: Pick<Promotion, "promoStart" | "promoEnd">,
  currentTime: Date = new Date(),
): boolean {
  const start = promotion.promoStart ? parseMsk(promotion.promoStart) : null;
  const end = promotion.promoEnd ? parseMsk(promotion.promoEnd) : null;
  const now = dayjs(currentTime);

  if (start && !start.isValid()) return false;
  if (end && !end.isValid()) return false;

  return (!start || !start.isAfter(now)) && (!end || !end.isBefore(now));
}

export function isEndingSoon(
  promotion: Pick<Promotion, "promoEnd">,
  currentTime: Date = new Date(),
  days: number = ENDING_SOON_DAYS,
): boolean {
  if (!promotion.promoEnd) return false;

  const end = parseMsk(promotion.promoEnd);
  if (!end.isValid()) return false;

  const now = dayjs(currentTime);
  return !end.isBefore(now) && !end.isAfter(now.add(days, "day"));
}

export function getPromotionEndTimestamp(
  promotion: Pick<Promotion, "promoEnd">,
): number {
  const end = parseMsk(promotion.promoEnd);
  return end.isValid() ? end.valueOf() : Number.POSITIVE_INFINITY;
}
