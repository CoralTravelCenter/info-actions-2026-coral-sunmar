/**
 * Источник данных об акциях.
 *
 * PROD: данные приходят из внешнего скрипта сайта, который кладёт массив в
 *       `window._promotion_settings`. В бандл лендинга данные НЕ входят.
 * DEV:  внешнего скрипта нет, поэтому подгружается локальная фикстура
 *       `promotions.dev.js` — динамическим `import()` внутри ветки
 *       `import.meta.env.DEV`, которая при `build` вырезается как мёртвый код
 *       (Vite подставляет `false`), и чанк с фикстурой не эмитится.
 */

/**
 * Контракт записи (обязательные/необязательные поля) описан в `promoSchema.js` —
 * там же живёт `normalizePromotions()`. Здесь только доставка данных.
 *
 * @typedef {import('./promoSchema.js').PromoConfig} PromoConfig
 */

/** Имя глобала, в который внешний скрипт сайта кладёт данные. */
const GLOBAL_KEY = "_promotion_settings";

/** @returns {PromoConfig[] | null} */
function readGlobal() {
  const value = window[GLOBAL_KEY];
  return Array.isArray(value) && value.length ? value : null;
}

/**
 * Возвращает список акций: из внешнего скрипта на проде, из фикстуры в dev.
 *
 * NB: глобал читается синхронно, без ожидания. Скрипт с данными должен быть
 * подключён на странице ДО скрипта лендинга (обычный `<script>` в разметке или
 * `defer` выше по документу).
 *
 * @returns {Promise<PromoConfig[]>}
 */
export async function loadPromotions() {
  const external = readGlobal();
  if (external) return external;

  if (import.meta.env.DEV) {
    const {PROMOTIONS_DEV} = await import("./promotions.dev.js");
    console.info(
      `[info-actions] window.${GLOBAL_KEY} не найден — используется dev-фикстура ` +
      `(${PROMOTIONS_DEV.length} записей). На проде данные придут из внешнего скрипта.`
    );
    return PROMOTIONS_DEV;
  }

  console.warn(`[info-actions] window.${GLOBAL_KEY} не найден — акции не отрисованы.`);
  return [];
}
