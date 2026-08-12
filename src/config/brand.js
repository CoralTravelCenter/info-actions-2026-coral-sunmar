/**
 * Единственный источник правды по бренду и Яндекс.Метрике.
 *
 * Раньше бренд определялся в трёх местах и разными критериями
 * (`location.origin.includes('coral.ru')` vs `location.host.includes('coral')`),
 * из-за чего на нестандартных хостах цели уходили в чужой счётчик.
 */

/**
 * Матчим домен второго уровня, а не подстроку: `includes('coral')` дал бы
 * ложное срабатывание на чём-нибудь вроде `coralreef-partner.example`.
 * Учитываем поддомены (`www.coral.ru`, `m.coral.ru`) и localhost-варианты
 * вида `coral.localhost`.
 */
const isCoral = /(^|\.)coral\.[a-z]+$/i.test(location.hostname);

/** @type {'coral' | 'sunmar'} */
export const BRAND = isCoral ? "coral" : "sunmar";

/**
 * Настройки Метрики под бренд.
 * `entry` одинаков для обоих брендов — ветвление здесь вырождено, но оставлено
 * явно, чтобы цель можно было развести без правок в директивах.
 */
export const METRIKA = isCoral
  ? {
    counterId: 96674199,
    goals: {bonusShow: "coral-bonus-show", entry: "entry-point"},
  }
  : {
    counterId: 215233,
    goals: {bonusShow: "sunmar-bonus-show", entry: "entry-point"},
  };

/**
 * Отправка цели в Метрику.
 *
 * КЛЮЧЕВОЕ: не проверяем `typeof window.ym === 'function'` и не выходим молча.
 * Счётчик подключается асинхронно (а иногда — после согласия на cookies), поэтому
 * к моменту показа карточек его может ещё не быть. Штатный сниппет Метрики
 * буферизует вызовы в `ym.a` до загрузки `tag.js`; если сниппета нет вовсе —
 * создаём совместимый буфер сами, и вызовы уедут, как только счётчик появится.
 *
 * @param {string} goal Идентификатор цели.
 * @param {object} [params] Параметры визита.
 * @param {() => void} [callback] Вызывается после отправки (для навигации).
 */
export function reachGoal(goal, params, callback) {
  if (!window.ym) {
    window.ym = function (...args) {
      (window.ym.a = window.ym.a || []).push(args);
    };
    window.ym.l = +new Date();
  }

  window.ym(METRIKA.counterId, "reachGoal", goal, params, callback);

  if (import.meta.env.DEV) {
    console.info(`[metrika] reachGoal → ${goal}`, params ?? "");
  }
}
