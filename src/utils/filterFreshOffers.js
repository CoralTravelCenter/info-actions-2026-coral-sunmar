import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(customParseFormat);
dayjs.extend(utc);
dayjs.extend(timezone);

/**
 * Даты в конфиге заданы по Москве. Без явной таймзоны dayjs парсил бы их
 * в локальной зоне пользователя: акция «с 00:00» стартовала бы во Владивостоке
 * на 7 часов раньше, а в Калининграде — на час позже.
 */
const TZ = "Europe/Moscow";
const FORMAT = "YYYY-MM-DD HH:mm";

/**
 * @param {string} value Дата вида "YYYY-MM-DD HH:mm" по МСК.
 * @returns {import('dayjs').Dayjs}
 */
function parseMsk(value) {
  return dayjs.tz(value, FORMAT, TZ);
}

/**
 * Проверяет, действует ли акция в данный момент.
 *
 * Сравнение — в абсолютном времени (timestamp), поэтому часовой пояс
 * пользователя на результат не влияет.
 *
 * @param {object} o Объект акции; поля promo_start / promo_end необязательны.
 * @param {import('dayjs').Dayjs} [now] Момент, на который проверяем.
 * @returns {boolean}
 */
export function filterFreshOffers(o, now = dayjs()) {
  const start = o.promo_start ? parseMsk(o.promo_start) : null;
  const end = o.promo_end ? parseMsk(o.promo_end) : null;

  // Невалидная дата в конфиге — акцию не показываем (лучше скрыть, чем показать вечно).
  if (start && !start.isValid()) return false;
  if (end && !end.isValid()) return false;

  const isStarted = !start || !start.isAfter(now);
  const isNotEnded = !end || !end.isBefore(now);

  return isStarted && isNotEnded;
}
