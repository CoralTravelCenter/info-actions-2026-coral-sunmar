/**
 * Проверки конфига акций.
 *
 * Зачем UI, а не только `console.warn`: конфиг приходит из внешнего скрипта сайта
 * и правят его контент-менеджеры, а не разработчики. В консоль никто не смотрит,
 * поэтому незаполненные поля тихо ломают либо карточку, либо аналитику — и это
 * замечают только по провалу в статистике.
 *
 * Проверки работают по СЫРЫМ данным (до `normalizePromotions()`), потому что
 * именно там ещё видна разница между «поля нет» и «поле пустое»: первое —
 * осознанный отказ от трекинга, второе — забытое значение.
 */

/**
 * Показывать ли предупреждения в интерфейсе.
 *
 * В dev — всегда; на проде — только по флагу `?promo_debug=1`, чтобы можно было
 * проверить боевой конфиг, не показывая служебное сообщение пользователям.
 *
 * @returns {boolean}
 */
export function isWarningsVisible() {
	if (import.meta.env.DEV) return true;
	return new URLSearchParams(location.search).get("promo_debug") === "1";
}

/**
 * Есть ли поле в объекте, но с пустым значением.
 *
 * @param {object} promo
 * @param {string} field
 * @returns {boolean}
 */
function isPresentButEmpty(promo, field) {
	return field in promo && String(promo[field] ?? "").trim() === "";
}

/**
 * Собирает проблемы конфига в список сообщений для интерфейса.
 *
 * Проверяем два класса ошибок:
 * 1. отсутствие обязательных полей — карточка не отрисуется вовсе;
 * 2. пустой `entry_point` — карточка отрисуется, но клики не будут считаться.
 *
 * @param {Array<object>} promotions Сырые записи из конфига.
 * @param {Array<{name: string, missing: string[]}>} [invalid] Отброшенные записи.
 * @returns {string[]} Готовые строки для вывода пользователю.
 */
export function collectConfigWarnings(promotions, invalid = []) {
	const messages = [];

	invalid.forEach(({name, missing}) => {
		messages.push(`${name} — не отрисована, нет полей: ${missing.join(", ")}`);
	});

	promotions
			.filter(p => isPresentButEmpty(p, "entry_point"))
			.forEach(p => {
				const name = String(p.name ?? "").trim() || "без названия";
				messages.push(`${name} — пустой entry_point, клики не отслеживаются`);
			});

	if (messages.length) {
		console.warn("[info-actions] проблемы в конфиге акций:", messages);
	}

	return messages;
}
