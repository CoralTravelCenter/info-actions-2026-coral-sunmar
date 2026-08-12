/**
 * Контракт записи об акции: какие поля обязательные, какие необязательные,
 * и что считается производным.
 *
 * Зачем отдельный модуль: данные приходят из внешнего скрипта сайта, то есть
 * контракт — это граница между чужой системой и нашим рендером. Раньше эта
 * граница была размазана: нормализация «на всякий случай» подставляла пустые
 * строки вместо отсутствующих полей, из-за чего терялась разница между
 * «поля нет» и «поле пустое», и приходилось перепроверять сырые данные.
 *
 * Правило: **необязательные поля не подменяем**. Отсутствует — остаётся
 * `undefined`; шаблон и директивы сами решают, что делать (`v-if`, «не трекать»).
 * Подставляем значения только там, где вычисляем производное поле.
 */

/**
 * Запись конфига акции.
 *
 * Обязательные поля — без них карточку нечем нарисовать, запись отбрасывается.
 * Необязательные помечены `[...]`: их отсутствие — нормальный сценарий.
 *
 * @typedef {Object} PromoConfig
 *
 * @property {string} name
 *   ОБЯЗАТЕЛЬНОЕ. Название акции (заголовок, `aria-label`, имя баннера
 *   в Метрике). Допускает `<br>`.
 *
 * @property {string} visual
 *   ОБЯЗАТЕЛЬНОЕ. Абсолютный URL промо-изображения.
 *
 * @property {string} [id]
 *   Явный идентификатор. Если не задан — выводим из `name` + `url`.
 *
 * @property {string|string[]} [filter]
 *   Фильтры-табы: массив или строка через запятую («По направлениям, Акции отелей»).
 *   Нет фильтров — акция видна только в «Все акции».
 *
 * @property {string} [description] Краткий маркетинговый текст. Допускает `<br>`.
 * @property {string} [url] Посадочная страница. Нет ссылки — кнопка вместо `<a>`.
 * @property {string} [promo_start] Старт, "YYYY-MM-DD HH:mm" (МСК). Нет — стартовала.
 * @property {string} [promo_end] Финал, "YYYY-MM-DD HH:mm" (МСК). Нет — бессрочная.
 * @property {string} [promo_end_text] Срок для UI («до 20.09.2026», «Бессрочно»).
 * @property {string} [erid] ERID для веба. Нет — плашка «Реклама» не рисуется.
 * @property {string} [app_erid] ERID для приложения (`?mw=true`).
 * @property {string} [ligal] Юрлицо для плашки. NB: историческая опечатка, верно `legal`.
 *
 * @property {string} [entry_point]
 *   Идентификатор точки входа для цели `entry-point`. Три состояния:
 *   поля нет — трекинг не нужен; `""` — забыли заполнить (ругаемся в интерфейсе);
 *   непустая строка — трекаем. Фолбэка на `name` нет намеренно: он маскировал бы
 *   недозаполненный конфиг и портил статистику непредсказуемыми значениями.
 */

/**
 * Производные поля, которые добавляет `normalizePromotions()`.
 *
 * @typedef {PromoConfig & {
 *   id: string,
 *   filtersArr: string[],
 *   isBonus: boolean
 * }} Promo
 */

/** Поля, без которых карточку нечем нарисовать. */
export const REQUIRED_FIELDS = ["name", "visual"];

/** Фильтр бонусной программы: явное значение вместо regex `/bonus/i`. */
export const BONUS_FILTER = "CoralBonus";

/**
 * Проверяет наличие обязательных полей.
 *
 * @param {Partial<PromoConfig>} promo
 * @returns {string[]} Имена отсутствующих полей.
 */
function missingRequired(promo) {
	return REQUIRED_FIELDS.filter(field => !String(promo?.[field] ?? "").trim());
}

/**
 * Разбирает `filter` в массив: поддерживаются и массив, и строка через запятую.
 *
 * @param {string|string[]} [filter]
 * @returns {string[]}
 */
function parseFilters(filter) {
	if (filter == null) return [];

	const arr = Array.isArray(filter)
			? filter
			: String(filter).split(",");

	return [...new Set(arr.map(s => String(s).trim()).filter(Boolean))];
}

/**
 * Приводит сырые записи к виду, удобному для рендера: считает производные поля
 * один раз при загрузке, а не в реактивном слое на каждый ререндер.
 *
 * Записи без обязательных полей отбрасываются — это лучше, чем карточка
 * с битой картинкой и пустым заголовком.
 *
 * @param {Array<Partial<PromoConfig>>} list Сырые данные из конфига.
 * @returns {{promotions: Promo[], invalid: Array<{name: string, missing: string[]}>}}
 */
export function normalizePromotions(list) {
	/** @type {Promo[]} */
	const promotions = [];
	/** @type {Array<{name: string, missing: string[]}>} */
	const invalid = [];

	list.forEach((promo, index) => {
		const missing = missingRequired(promo);

		if (missing.length) {
			invalid.push({
				name: String(promo?.name ?? "").trim() || `запись #${index + 1}`,
				missing,
			});
			return;
		}

		const filtersArr = parseFilters(promo.filter);

		promotions.push({
			// Необязательные поля переносим как есть: `undefined` остаётся
			// `undefined`, чтобы не терять разницу с пустой строкой.
			...promo,
			filtersArr,
			// Пара name+url уникальна даже при дублях name — у них разные посадочные.
			// Уникальный ключ критичен: иначе Vue переиспользует DOM под другую
			// акцию и в Метрику уходит название чужого баннера.
			id: promo.id ?? `${promo.name}|${promo.url ?? ""}`,
			isBonus: filtersArr.includes(BONUS_FILTER),
		});
	});

	return {promotions, invalid};
}
