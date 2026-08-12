import {useIntersectionObserver} from "@vueuse/core";

import {METRIKA, reachGoal} from "../config/brand.js";

/**
 * v-bonus="'название акции'" — отправляет цель показа бонусной акции,
 * когда карточка появилась во вьюпорте.
 *
 * Что было сломано раньше:
 * 1. Элемент помечался как «отправлено» и observer останавливался ДО проверки
 *    доступности `window.ym`. Счётчик на проде грузится асинхронно, карточки
 *    первого экрана пересекали вьюпорт раньше — цель не уходила никогда,
 *    без ретрая и без ошибки в консоли.
 * 2. Дедупликация жила в `WeakSet` по DOM-элементу и обнулялась в `unmounted`.
 *    При переключении табов элементы пересоздавались → один и тот же показ
 *    отправлялся повторно, данные завышались.
 * 3. Не было хука `updated`: при реюзе DOM-узла под другую акцию в Метрику
 *    уходило название предыдущего баннера.
 */

/**
 * Дедупликация по ИДЕНТИФИКАТОРУ акции, а не по элементу, и на всё время жизни
 * страницы: показ одной и той же акции считается один раз, сколько бы раз
 * пользователь ни щёлкал табы.
 * @type {Set<string>}
 */
const sent = new Set();

/** Доля карточки во вьюпорте, при которой считаем показ состоявшимся. */
const THRESHOLD = 0.2;

/** Служебное поле: единое соглашение об именовании для всех директив. */
const CLEANUP = Symbol("ymBonusCleanup");

/**
 * @param {unknown} value Значение директивы.
 * @returns {string} Название акции или пустая строка.
 */
function normalize(value) {
  return typeof value === "string" ? value.trim() : "";
}

/**
 * @param {HTMLElement} el
 * @param {string} bannerName
 */
function observe(el, bannerName) {
  if (!bannerName || sent.has(bannerName)) return;

  const {stop} = useIntersectionObserver(
    el,
    ([entry]) => {
      // Проверяем дедуп заново: пока ждали показ, акция могла засчитаться
      // в другой карточке (например, после перерисовки списка).
      if (!entry.isIntersecting || sent.has(bannerName)) return;

      // Сначала отправляем — reachGoal сам буферизует вызов, если счётчик
      // ещё не загрузился, — и только потом помечаем и отключаем наблюдение.
      reachGoal(METRIKA.goals.bonusShow, {
        [location.pathname]: {banner: bannerName},
      });

      sent.add(bannerName);
      stop();
      el[CLEANUP] = undefined;
    },
    {threshold: THRESHOLD}
  );

  el[CLEANUP] = stop;
}

export default {
  mounted(el, binding) {
    observe(el, normalize(binding.value));
  },

  /**
   * Vue может переиспользовать DOM-узел под другую акцию. Без этого хука
   * директива продолжала бы слать название баннера от предыдущей карточки.
   */
  updated(el, binding) {
    const next = normalize(binding.value);
    if (next === normalize(binding.oldValue)) return;

    el[CLEANUP]?.();
    el[CLEANUP] = undefined;
    observe(el, next);
  },

  unmounted(el) {
    el[CLEANUP]?.();
    el[CLEANUP] = undefined;
    // NB: `sent` намеренно не чистим — дедупликация должна пережить
    // размонтирование при переключении табов.
  },
};
