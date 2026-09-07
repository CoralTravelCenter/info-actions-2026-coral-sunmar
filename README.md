# info-actions-2026

Лендинг «Акции» (Coral / Sunmar). Мигрирован из `vue-b2c-projects_2025/info_actions_2025`
на сборщик `b2c-landing-vite` (schemaVersion 2, стек vue + html + scss).

```bash
npm run check
npm run test:run
npm run dev
npm run build
# После production-сборки с закомментированным локальным импортом:
npm run check:production-config
```

## Блоки (`src/order.json`)

| Блок | Разметка | Стили | Скрипт |
|---|---|---|---|
| `text` | `markup/text.html` | `styles/text.scss` (подключает общие стили) | — |
| `info-actions` | `markup/info-actions.html` | `styles/info-actions.scss` | `scripts/info-actions.js` |
| `contacts` | `markup/contacts.html` | `styles/contacts.scss` | — |

## Структура

```
src/
  order.json                     — порядок блоков
  markup/                        — HTML секций
  styles/
    common/                      — общие стили лендинга (перенесены из site/common/css)
      _variables.scss            — CSS custom properties + SCSS-брейкпоинты
      _mixins.scss               — миксины (respond-up, flex-grid, hero-layout, ...)
      _layout.scss, _components.scss
      _index.scss                — агрегатор, подключается в styles/text.scss
    text.scss, info-actions.scss, contacts.scss
  config/brand.ts                — бренд, счётчик Метрики и reachGoal
  scripts/info-actions.js        — точка входа блока: монтирует Vue в #info-actions
  components/InfoActions/
    InfoActions.vue              — бывший App.vue (табы + карточки)
    Card/Card.vue + Card.scss
    Tabs/Tabs.vue + Tabs.scss
  directives/                    — ymbonus (Метрика на показ) и clipboard
  analytics/promotionEvents.ts   — публичное DOM-событие клика для внешнего скрипта
  types/promotion.ts            — интерфейсы входного конфига и готовой акции
  data/promoSchema.ts           — проверка и нормализация PromotionConfig
  data/promotions.ts            — синхронное чтение window._promotion_settings
  data/promotion-settings.js    — локальный конфиг для разработки
  composables/                  — фильтрация, пагинация, контекст карточек и fixed navigation
  utils/filterFreshOffers.ts    — фильтр актуальности по датам, МСК (dayjs)
  utils/configWarnings.ts       — UI-ошибки и диагностика внешнего контракта
```

## Источник данных об акциях

| Режим | Откуда данные |
|---|---|
| `npm run build` (прод) | внешний скрипт сайта кладёт массив в `window._promotion_settings` |
| `npm run dev` | локальный `data/promotion-settings.js`, импортированный в точке входа |

Локальный конфиг подключён обычным импортом в `scripts/info-actions.js` и записывает
массив в `window._promotion_settings`. Перед production-сборкой этот импорт нужно
закомментировать: на боевом сайте глобал заполняет внешний скрипт.

```bash
npm run build
grep -c "coralbonus.ru/promo" '@CMS/info-actions.html'   # → 0
```

Локальный конфиг нужно держать актуальным вручную — синхронно с внешним скриптом.

> **Важно:** скрипт с данными должен быть подключён на странице **до** скрипта лендинга
> (обычный `<script>` в разметке или `defer` выше по документу). Если на момент
> монтирования глобала нет, акции не отрисуются, а в консоль уйдёт `console.warn`.

### Поля записи: обязательные и необязательные

Контракт описан интерфейсом `PromotionConfig` в `types/promotion.ts`, нормализация —
в `data/promoSchema.ts`.

**Обязательные:** `name` и `visual`. Без них карточку нечем нарисовать, поэтому запись
отбрасывается, а в интерфейсе появляется предупреждение с её номером.

**Все остальные поля необязательные, и мы их не подставляем.** Отсутствие поля — рабочий
сценарий, шаблон его обрабатывает:

| Нет поля | Что будет |
|---|---|
| `url` | вместо ссылки рисуется кнопка (для попапа) |
| `erid` | не рисуется плашка «Реклама» с popover |
| `promo_start` / `promo_end` | акция считается стартовавшей / бессрочной; без `promo_end` карточка показывает «Бессрочно» |
| `filters` / legacy `filter` | акция видна только в табе «Все акции» |

Нормализация добавляет производные представления названия, нормализует канонический
`filters` или legacy `filter` и вычисляет
`analytics.bonusImpression`.

Канонические поля — `name`, `filters: string[]`, `legal`. Нормализованное текстовое
название используется как Vue-key и ключ дедупликации показов, поэтому названия акций
должны быть уникальными. Legacy-поля `filter` и `ligal`
временно поддерживаются для совместимости с внешним скриптом, но диагностируются в
dev-консоли. Там же проверяются даты, обратные диапазоны, URL, конфликтующие поля и
неверные типы. Восстановимые отклонения не показываются пользователю как UI-ошибки.

### Аналитика кликов

Vue-блок не отправляет click-цели самостоятельно. Перед стандартным переходом он
синхронно публикует на `document` событие `promotion-card:click`. В `detail` передаётся
очищенное название акции и её URL; внешний скрипт использует нужные ему значения,
не связывая Vue-блок с конкретным провайдером.

```js
document.addEventListener("promotion-card:click", event => {
  const {name, url} = event.detail;
});
```

Готовые независимые обработчики находятся в `external-scripts/`:

- `promotion-click-metrika-coral.js` — счётчик Coral `96674199`;
- `promotion-click-metrika-sunmar.js` — счётчик Sunmar `215233`.

Каждый файл содержит собственный `switch` соответствий `name → entry_point` и отправляет
цель `entry-point`. Скрипты не входят в Vue-бандл: нужную брендовую версию следует
подключить на соответствующей странице отдельным `<script>` до первого клика.

Поле `entry_point` удалено из локального конфига: старые непустые коды перенесены во
внешний обработчик. Техническое уведомление остаётся для действительно невосстановимых
ошибок: отсутствующих `name`/`visual` и дублирующихся нормализованных названий.

Уведомление видно в dev всегда, а на проде — только с флагом `?promo_debug=1`, чтобы можно
было проверить боевой конфиг, не показывая служебное сообщение пользователям.

ERID-popover, кнопка копирования и техническое предупреждение реализованы локально.
Тяжёлая UI-библиотека для этих трёх небольших элементов не используется.

## Отличия от версии 2025

- На проде конфиг приходит из внешнего скрипта сайта в `window._promotion_settings`.
  Для разработки актуальная локальная копия подключается обычным импортом, который
  вручную комментируется перед production-сборкой. Компонент читает данные синхронно.
- Зависимость от старого `usefuls.ts` заменена локальным
  `scripts/utils/hostReactAppReady.js`; экспортируемую функцию блока вызывает builder.
- Удалены неиспользуемые пакеты `copy-to-clipboard` и `vue-clipboard`.
- Утилита `.no-scrollbar` перенесена из `Tabs.scss` в общие `_components.scss`.
- Аналитика: единый `config/brand.ts`, один Bonus-показ каждого увиденного баннера
  за загрузку страницы;
  клики передаются внешнему скрипту через `promotion-card:click`.
- Даты акций считаются по московскому времени независимо от часового пояса пользователя.
- Первый ряд изображений получает `loading="eager"` и `fetchpriority="high"`; остальные
  карточки загружаются лениво.
- Стили карточек не используют `!important`; повторяющиеся Coral/Sunmar-цвета вынесены
  в CSS custom properties.
- Семантика и a11y: `<time datetime>`, корректная иерархия заголовков, табы на
  `<button role="tab">` с поддержкой клавиатуры.

## Документация

| Файл | О чём |
|---|---|
| `REFACTORING.md` | Текущее состояние: что сделано и почему, что пропущено, что осталось |
| `ANALYSIS-2026.md` | Полный разбор кода, план работ и детальный разбор бага Яндекс.Метрики |
