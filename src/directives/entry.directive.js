import {METRIKA, reachGoal} from "../config/brand.js";

/**
 * v-entry="entry_point" — отправляет цель перехода по клику «Подробнее».
 *
 * Контракт по `entry_point` (три состояния):
 * - поля нет в объекте акции → трекинг намеренно не нужен, директива не вешается;
 * - `entry_point: ""`        → поле забыли заполнить: клики теряются, поэтому
 *                              показываем предупреждение в интерфейсе
 *                              (см. utils/configWarnings.js) и не трекаем;
 * - непустая строка          → трекаем.
 *
 * Что было сломано раньше:
 * 1. Цель уходила без гарантии доставки: при переходе в том же табе страница
 *    выгружалась раньше, чем запрос успевал уйти.
 * 2. Не было `updated` — при реюзе DOM-узла отправлялось имя чужой акции.
 */

/** Служебное поле: единое соглашение об именовании для всех директив. */
const CLEANUP = Symbol("entryCleanup");

/** Сколько ждём подтверждения Метрики перед уходом со страницы. */
const NAVIGATE_TIMEOUT_MS = 300;

/**
 * Пустое значение (нет поля или пустая строка) означает «не трекать».
 * Разница между этими случаями разбирается на уровне конфига, а не здесь.
 *
 * @param {unknown} value
 * @returns {string}
 */
function resolveStockName(value) {
  return value == null ? "" : String(value).trim();
}

/**
 * Уходит ли клик с текущей страницы. Для `target="_blank"` и модификаторов
 * (Ctrl/Cmd/средняя кнопка) страница остаётся — ждать отправку не нужно.
 *
 * @param {HTMLElement} el
 * @param {MouseEvent} event
 */
function isSameTabNavigation(el, event) {
  if (event.defaultPrevented) return false;
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return false;
  if (event.button != null && event.button !== 0) return false;

  const href = el.getAttribute("href");
  if (!href) return false;

  const target = (el.getAttribute("target") || "_self").toLowerCase();
  return target === "_self";
}

/**
 * @param {HTMLElement} el
 * @param {string} stockName
 */
function bind(el, stockName) {
  if (!stockName) return;

  const onClick = event => {
    const namePoint = el.getAttribute?.("data-name-point") || "promo_page";
    const params = {name_stock: {[stockName]: {name_point: namePoint}}};

    if (isSameTabNavigation(el, event)) {
      // Переход в том же табе: тормозим навигацию до подтверждения отправки,
      // иначе выгрузка страницы отменит запрос и клик потеряется.
      event.preventDefault();

      const href = el.getAttribute("href");
      let navigated = false;
      const navigate = () => {
        if (navigated) return;
        navigated = true;
        location.assign(href);
      };

      // callback Метрики + страховочный таймаут: не зависаем, если счётчик
      // недоступен или заблокирован адблоком.
      reachGoal(METRIKA.goals.entry, params, navigate);
      setTimeout(navigate, NAVIGATE_TIMEOUT_MS);
    } else {
      reachGoal(METRIKA.goals.entry, params);
    }

    el.dispatchEvent(
      new CustomEvent("redirect", {
        bubbles: true,
        detail: {
          href: el.getAttribute("href") || "",
          target: (el.getAttribute("target") || "_self").toLowerCase(),
          stock: stockName,
        },
      })
    );
  };

  el.addEventListener("click", onClick);
  el[CLEANUP] = () => el.removeEventListener("click", onClick);
}

export default {
  mounted(el, binding) {
    bind(el, resolveStockName(binding.value));
  },

  updated(el, binding) {
    const next = resolveStockName(binding.value);
    if (next === resolveStockName(binding.oldValue)) return;

    el[CLEANUP]?.();
    el[CLEANUP] = undefined;
    bind(el, next);
  },

  unmounted(el) {
    el[CLEANUP]?.();
    el[CLEANUP] = undefined;
  },
};
