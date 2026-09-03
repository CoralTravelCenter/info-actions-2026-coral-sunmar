# Проверка Спринта 2

Дата: 2026-09-03

Статус: PASS

## Выполнено

- Targeted: `npx vitest run src/utils/configWarnings.test.ts src/data/promoSchema.test.ts src/composables/usePromotions.test.ts` — 3 файла, 10 тестов, PASS.
- TypeScript: `npm run typecheck` — PASS.
- Полный набор: `npm run test:run` — 9 файлов, 28 тестов, PASS.
- Проектная проверка: `npm run check` — PASS.
- Проверка diff: `git diff --check` — PASS.

## Покрытые случаи

- Legacy `filter`/`ligal` диагностируются без UI-ошибок.
- Невозможная календарная дата и обратный диапазон.
- Неподдерживаемые URL-схемы.
- Конфликты canonical/legacy-полей.
- Неверные типы `filters` и `analytics.bonusImpression`.

## Не проверено

- Фактический внешний production-конфиг и browser console на стенде.
- Доступность URL по сети.

---

# Проверка Спринта 3

Дата: 2026-09-03

Статус: PASS

## Выполнено

- TypeScript: `npm run typecheck` — PASS.
- Полный набор: `npm run test:run` — 9 файлов, 28 тестов, PASS.
- Проектная проверка: `npm run check` — PASS.
- Проверка diff: `git diff --check` — PASS.

## Покрытые случаи

- Типы нового prop и допустимость атрибутов изображения проверены `vue-tsc`.
- Существующая фильтрация и пагинация прошли полный набор тестов без регрессий.

## Не проверено

- Lighthouse/Web Vitals на реальной странице-хосте.
- Фактический порядок сетевых запросов в браузере.
- Coral/Sunmar responsive-вёрстка на стенде.

---

# Проверка Спринта 4

Дата: 2026-09-03

Статус: PASS с ограничением по визуальной проверке

## Выполнено

- Sass-компиляция `Card.scss` — PASS.
- Проверка скомпилированной специфичности `.promo-card .promo-card__link` — PASS.
- В `Card.scss` не осталось `!important` и заменённых цветовых хардкодов.
- TypeScript: `npm run typecheck` — PASS.
- Полный набор: `npm run test:run` — 9 файлов, 28 тестов, PASS.
- Проектная проверка: `npm run check` — PASS.
- Проверка diff: `git diff --check` — PASS.

## Не проверено

- Визуальная регрессия на реальных страницах Coral и Sunmar.
- Production build из-за согласованного ручного DEV-импорта.

---

# Проверка Спринта 5

Дата: 2026-09-03

Статус: PASS

## Выполнено

- Полный набор: `npm run test:run` — 9 файлов, 28 тестов, PASS.
- Проектная проверка: `npm run check` — PASS.
- Graphify multigraph diagnostics: 0 dangling edges, 0 self-loops, 0 duplicate edges.
- Graphify import cycles: отсутствуют.
- Проверка diff: `git diff --check` — PASS.

## Не проверено

- Production build и `check:production-config`.
- Coral/Sunmar CMS-стенды и Web Vitals.

---

# Проверка Спринта 6

Дата: 2026-09-03

Статус: PASS

## Выполнено

- Targeted: `promotionEvents.test.ts` и `usePromotionContext.test.ts` — 4 теста, PASS.
- Новый тест проверяет точное равенство `event.detail` объекту `{name}` и отсутствие других ключей.
- Тест проверяет отправку события через `document.dispatchEvent`.
- TypeScript: `npm run typecheck` — PASS.
- Полный набор: `npm run test:run` — 10 файлов, 29 тестов, PASS.
- Проектная проверка: `npm run check` — PASS.
- Проверка diff: `git diff --check` — PASS.

---

# Проверка Спринта 7

Дата: 2026-09-03

Статус: PASS

## Проверено

- Все три соответствия названий прежним `entry_point`.
- Отсутствие цели для неизвестного названия.
- Выбор счётчика Coral/Sunmar и запрет отправки на неизвестном домене.
- Точная структура `name_stock[entry_point].name_point`.
- В локальном конфиге осталось 31 акция и 0 полей `entry_point`.
- Синтаксис внешнего classic script через `node --check`.
- Обе брендовые версии: 6 соответствий, фиксированные счётчики Coral/Sunmar и default без вызова.
- Полный набор после разделения: 11 файлов, 37 тестов, PASS.

---

# Проверка реорганизации каталогов utils

Дата: 2026-09-03

Статус: PASS

## Проверено

- Старые пути `src/utils/` и `src/scripts/utils/` больше не используются в `src/`.
- Новые пути импортов разрешаются корректно.
- `promotionDates.test.ts` и `promotionDiagnostics.test.ts`: 2 файла, 7 тестов, PASS.
- TypeScript: `npm run typecheck` — PASS.
- Реализации функций и экспортируемые имена в рамках реорганизации не менялись.

## Не проверено

- Build и полный test suite не запускались: для чистого перемещения файлов достаточно целевых тестов и typecheck.
