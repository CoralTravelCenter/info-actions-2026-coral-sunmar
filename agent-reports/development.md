# Спринт 2 — контракт внешних данных

Дата: 2026-09-03

## Изменённые файлы

- `src/types/promotion.ts`
- `src/utils/configWarnings.ts`
- `src/utils/configWarnings.test.ts`

## Реализация

- Явно отмечены legacy-поле `filter` и каноническое поле `filters`.
- Добавлена неблокирующая диагностика внешнего контракта: строгий формат и календарная корректность дат, обратный
  диапазон, неподдерживаемые URL-схемы, неверные типы `filters` и `analytics.bonusImpression`, одновременное
  использование canonical/legacy-полей.
- Использование `filter` и `ligal` агрегируется в два сообщения, чтобы не создавать предупреждение на каждую запись.
- Контрактные отклонения пишутся в console только там, где уже вызывается dev/debug-диагностика. В UI возвращаются
  только прежние блокирующие ошибки.
- Нормализация, фильтрация и рендер-поведение не изменялись; legacy-совместимость сохранена.

## Ограничения

- Legacy-поля нельзя удалять до миграции внешнего скрипта.
- Диагностика URL проверяет синтаксис и разрешает только HTTP (S), но не проверяет доступность ресурса по сети.
- Graphify не обновлялся в рамках production-спринта.

---

# Спринт 4 — стили и визуальная устойчивость

Дата: 2026-09-03

## Изменённые файлы

- `src/components/InfoActions/Card/Card.scss`
- `src/components/InfoActions/Card/Card.vue`
- `src/styles/common/_variables.scss`

## Реализация

- Удалены все пять `!important` из стилей карточки.
- Для ссылки/кнопки использован локальный селектор `.promo-card .promo-card__link`, который предсказуемо перекрывает
  глобальный `section.coral .prime-btn`.
- Добавлены отсутствующие семантические токены: `--color_Status_Success`, `--color_Sunmar_Primary`,
  `--color_Sunmar_Surface`.
- Белые поверхности и нейтральный цвет иконок переведены на существующие `--color_Base_Light` и `--color_Header_Icon`.
- Цвета inline SVG переведены на CSS custom properties без изменения структуры иконок.

## Ограничения

- Визуальное сравнение на CMS-стенде не выполнялось.
- Production build не запускался, поскольку проект сохраняет согласованный ручной процесс отключения DEV-конфига.
- Graphify не обновлялся в рамках production-спринта.

---

# Спринт 5 — документация и архитектурный контроль

Дата: 2026-09-03

## Изменённые файлы

- `README.md`
- `REFACTORING.md`
- `ANALYSIS-2026.md`
- `graphify-out/*`

## Реализация

- README дополнен актуальным контрактом данных, диагностикой, composables, image priority и CSS-токенами.
- Ручное отключение DEV-фикстуры закреплено как согласованный production-процесс.
- `REFACTORING.md` переписан как компактное описание текущей архитектуры, выполненных работ, ограничений и следующих
  самостоятельных задач.
- `ANALYSIS-2026.md` явно обозначен как исторический аудит.
- Graphify обновлён после завершения production-спринтов.

## Ограничения

- Production build и стендовые проверки требуют ручного отключения DEV-импорта.
- Исторические детали намеренно сохранены только в `ANALYSIS-2026.md`.

---

# Реорганизация каталогов utils

Дата: 2026-09-03

## Изменённые файлы

- `src/scripts/utils/hostReactAppReady.js` → `src/scripts/hostReactAppReady.js`
- `src/utils/filterFreshOffers.ts` → `src/data/promotionDates.ts`
- `src/utils/filterFreshOffers.test.ts` → `src/data/promotionDates.test.ts`
- `src/utils/configWarnings.ts` → `src/data/promotionDiagnostics.ts`
- `src/utils/configWarnings.test.ts` → `src/data/promotionDiagnostics.test.ts`
- обновлены прямые импорты в `src/scripts/info-actions.js`, `src/composables/usePromotions.ts`,
  `src/components/InfoActions/InfoActions.vue`

## Реализация

- Выполнено только согласованное перемещение файлов по существующим смысловым каталогам.
- Реализации и экспортируемые функции не изменялись.
- Пользовательские незакоммиченные изменения в перемещённых файлах сохранены.
- Пустые каталоги `src/scripts/utils/` и `src/utils/` удалены.
- `graphify-out/`, host bootstrap behavior и dev/prod-конфигурация не изменялись.

## Проверка Developer Agent

- `VERIFIED`: старые пути больше не используются в `src/`.
- `VERIFIED`: новые файлы находятся в ожидаемых каталогах, прямые импорты обновлены.
- `VERIFIED`: содержимое `hostReactAppReady.js` и `filterFreshOffers.ts` совпадает с исходным содержимым до перемещения.
- `NOT VERIFIED`: тесты, typecheck, lint и build не запускались — передано Test Agent.

---

# Спринт 6 — контракт клика карточки

Дата: 2026-09-03

## Изменённые файлы

- `src/analytics/promotionEvents.ts`
- `src/analytics/promotionEvents.test.ts`
- `src/composables/usePromotionContext.ts`
- `src/components/InfoActions/InfoActions.vue`
- `src/components/InfoActions/Card/Card.vue`
- `README.md`
- `REFACTORING.md`

## Реализация

- `event.detail` события `promotion-card:click` сокращён до `{name: string}`.
- Значение берётся из нормализованного `promotion.nameText`, поэтому не содержит `<br>`.
- Удалены `version`, технический ID, URL, фильтры, бренд, позиция и destination.
- Ссылка и popup-кнопка публикуют одинаковый контракт.
- EventTarget изменён с `window` на `document`, поскольку внешний обработчик работает в том же документе страницы.
- CoralBonus-логика и директива показов не изменялись.

## Ограничение

- Для корректной аналитической агрегации названия акций должны оставаться уникальными и стабильными.

---

# Спринт 7 — внешний обработчик Метрики

Дата: 2026-09-03

## Изменённые файлы

- `external-scripts/promotion-click-metrika-coral.js`
- `external-scripts/promotion-click-metrika-sunmar.js`
- `external-scripts/promotion-click-metrika.test.js`
- `../src/data/promotion-settings-coral.js`
- `README.md`
- `REFACTORING.md`

## Реализация

- Созданы два независимых обработчика: Coral со счётчиком `96674199` и Sunmar со счётчиком `215233`.
- Каждый скрипт содержит только listener, получение `name`, `switch/case` и вызов Метрики.
- В Coral перенесены три непустых соответствия `name → entry_point` из локальной фикстуры.
- В Sunmar перенесены три непустых соответствия из предоставленного конфига.
- Все 31 поля `entry_point`, включая 28 пустых, удалены из локальной фикстуры.

## Ограничения

- Скрипт нужно подключить на странице отдельно от Vue-бандла до первого клика.
- Названия трёх отслеживаемых акций являются частью интеграционного контракта.

---

# Спринт 3 — производительность изображений

Дата: 2026-09-03

## Изменённые файлы

- `src/components/InfoActions/InfoActions.vue`
- `src/components/InfoActions/Card/Card.vue`

## Реализация

- Количество приоритетных изображений соответствует первому ряду фактической сетки: mobile — 1, tablet — 2, desktop
  Coral — 4, desktop Sunmar — 3.
- `InfoActions.vue` передаёт карточке признак `prioritizeImage` на основании позиции в отфильтрованном списке.
- Приоритетные изображения получают `loading="eager"` и `fetchpriority="high"`.
- Остальные изображения сохраняют `loading="lazy"` и нейтральный `fetchpriority="auto"`.
- Фильтрация, пагинация, данные и аналитика не изменялись.

## Ограничения

- Реальный эффект на LCP зависит от страницы-хоста, CDN и сетевых условий; его необходимо измерить на стенде.
- `srcset`/WebP не добавлялись: поддерживаемые параметры CDN не подтверждены.
- Graphify не обновлялся в рамках production-спринта.
