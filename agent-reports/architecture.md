# Архитектурный анализ проекта

Дата: 2026-09-03  
Роль: Architecture Agent  
Режим: только анализ; production-код и `graphify-out/` не изменялись.

## 1. Цель и границы анализа

Цель — оценить текущую архитектуру лендинга, файловую организацию и зависимости, отдельно разобрать наличие двух каталогов `utils`:

- `src/utils/`;
- `src/scripts/utils/`.

Анализ выполнен в обязательном порядке: сначала изучены `graphify-out/manifest.json`, `graphify-out/.graphify_analysis.json`, `graphify-out/GRAPH_REPORT.md` и граф зависимостей, затем проверены текущие исходники. Текущий код использован как источник истины.

Graphify построен от текущего `HEAD` (`1796370d`), однако рабочее дерево содержит незакоммиченные изменения, а у ряда изменённых файлов в manifest отсутствует `semantic_hash`. Поэтому Graphify пригоден для навигации и общей топологии, но конкретные выводы ниже подтверждены чтением исходников.

## 2. Краткий вывод

Проект небольшой и в целом имеет понятный однонаправленный поток данных без циклических импортов:

`window._promotion_settings` → чтение → нормализация → фильтрация/пагинация → Vue UI → DOM-событие/Метрика.

Основная архитектурная проблема — не само число каталогов `utils`, а размытая семантика имени `utils` и неверная классификация трёх файлов:

- `src/scripts/utils/hostReactAppReady.js` — адаптер жизненного цикла хост-приложения, а не общая утилита;
- `src/utils/filterFreshOffers.ts` — доменная логика акций и дат;
- `src/utils/configWarnings.ts` — валидация/диагностика внешнего контракта данных.

Дублирования функций между двумя каталогами нет. Они принадлежат разным слоям, но текущие имена скрывают эти границы. Для проекта такого размера достаточно минимального перемещения файлов по уже существующим каталогам; вводить новый сложный `domain/application/infrastructure`-слой сейчас нецелесообразно.

## 3. Текущая архитектура

### 3.1. Точка входа и интеграционная граница

`src/scripts/info-actions.js` — composition root блока:

- ждёт готовности React-хоста через `hostReactAppReady()`;
- на dev подключает локальный конфиг;
- определяет бренд;
- регистрирует Vue-директивы;
- монтирует `InfoActions.vue`.

Это корректная точка сборки зависимостей. Но файл остаётся JavaScript, а `tsconfig.json` включает только `src/**/*.ts`, `src/**/*.vue`, `src/**/*.d.ts`. При `allowJs: true` данный `.js` фактически не попадает в `vue-tsc --noEmit`, поэтому вход и `hostReactAppReady.js` не получают строгой типовой проверки.

### 3.2. Поток данных и доменная модель

- `src/data/promotions.ts` читает внешний глобальный контракт `window._promotion_settings`.
- `src/types/promotion.ts` разделяет сырой `PromotionConfig` и нормализованный `Promotion`.
- `src/data/promoSchema.ts` валидирует обязательные поля, санитизирует HTML, нормализует legacy-поля, формирует ID и внутреннюю модель.
- `src/composables/usePromotions.ts` объединяет нормализацию, актуальность по датам, фильтры и сортировку завершающихся акций.
- `src/composables/usePromotionPagination.ts` отвечает только за пагинацию.

Граница «внешние неизвестные данные → нормализованная внутренняя модель» реализована хорошо. Главный связующий тип — `Promotion`; Graphify также показывает `normalizePromotions()` и `usePromotions()` как центральные узлы.

### 3.3. Представление

- `src/components/InfoActions/InfoActions.vue` — контейнер/оркестратор UI.
- `Card/Card.vue` — отображение карточки и ERID-popover.
- `Tabs/Tabs.vue` — фильтры и фиксированная навигация.
- SCSS colocated с компонентами, общие токены/миксины находятся в `src/styles/common/`.

Компонентный слой в основном не содержит нормализации данных. Однако `InfoActions.vue` напрямую импортирует `getPromotions()` и `configWarnings`, поэтому одновременно выполняет bootstrap данных, диагностику и UI-оркестрацию. Для текущего размера это допустимо, но дальнейшее расширение усилит его роль как «контейнера всего».

### 3.4. Browser behavior и интеграции

- `src/directives/clipboard.directive.ts` инкапсулирует Clipboard API и legacy fallback.
- `src/directives/ymbonus.directive.ts` связывает IntersectionObserver с брендовой Метрикой.
- `src/config/brand.ts` совмещает определение бренда, UI-default бренда и отправку bonus goal.
- `src/analytics/promotionEvents.ts` публикует стабильное DOM-событие клика.
- `external-scripts/` содержит независимые брендовые потребители события.

Разделение click-аналитики через DOM-событие снижает связанность Vue-блока с внешними mapping-таблицами. При этом `brand.ts` имеет две ответственности — brand configuration и analytics transport; это умеренный, но пока не критичный долг.

### 3.5. Сборка и эксплуатационные файлы

- `landing.config.mjs` описывает builder и стек.
- `src/order.json`, `src/markup/`, `src/styles/` задают блоки лендинга.
- `tools/check-production-config.mjs` защищает от включения dev-конфига в production.
- `@CMS/` — build output, `public/` — публичные ресурсы.

Текущий production-процесс зависит от ручного комментирования импорта `promotion-settings.js`. Проверка снижает риск, но сам процесс остаётся хрупким: корректность обеспечивается дисциплиной перед сборкой, а не режимом окружения.

## 4. Карта модулей и зависимостей

| Модуль | Ответственность | Основные зависимости | Оценка границы |
|---|---|---|---|
| `src/scripts/` | запуск блока и адаптация к host page | Vue, components, config, directives | корректная роль entry/integration |
| `src/components/` | UI и пользовательские взаимодействия | composables, types, data | умеренно перегружен контейнер `InfoActions.vue` |
| `src/composables/` | реактивные use cases UI | Vue, `data`, текущий `utils` | хорошее разделение по сценариям |
| `src/data/` | внешний источник и нормализация | types | логически цельный слой |
| `src/types/` | внешний и внутренний контракты | нет | корректная базовая зависимость |
| `src/analytics/` | публичные аналитические события | DOM | узкая и стабильная граница |
| `src/config/` | бренд и bonus analytics | DOM/window | две ответственности в одном модуле |
| `src/directives/` | DOM-интеграции Vue | VueUse/config | корректная UI-инфраструктура |
| `src/utils/` | фактически domain dates + contract diagnostics | types/dayjs | имя не отражает ответственности |
| `src/styles/`, `src/markup/` | внешний layout/CMS и стили | SCSS/build conventions | соответствует builder-структуре |
| `external-scripts/` | интеграция внешней Метрики кликов | DOM event, `window.ym` | намеренно вне Vue bundle |
| `tools/` | build-time проверки | Node.js | корректная эксплуатационная граница |

Направление production-зависимостей в целом однонаправленное. Graphify не обнаружил import cycles. Наиболее значимая цепочка риска:

`types/promotion.ts` ← `data/promoSchema.ts` ← `composables/usePromotions.ts` ← `components/InfoActions.vue`.

## 5. Анализ двух каталогов `utils`

### 5.1. `src/scripts/utils/hostReactAppReady.js`

**Фактическая ответственность:** адаптер хост-окружения. Функция polling-ом ожидает появления и ненулевой высоты `#__next > div` перед монтированием Vue-блока.

**Потребители:** только `src/scripts/info-actions.js`.

**Зависимости:** DOM (`document.querySelector`, `getBoundingClientRect`) и таймеры.

**Почему текущее расположение спорно:**

- это не переиспользуемая нейтральная утилита, а деталь bootstrap/integration;
- отдельный каталог `utils` создан ради одного файла и создаёт ложное ощущение второго общего utility-layer;
- функция тесно связана с entry point и host React/Next layout.

**Дополнительный риск:** параметр `timeout` на деле является интервалом опроса, а не общим timeout. Максимального срока ожидания нет. Если host selector не появится или останется нулевой высоты, Promise никогда не завершится и блок не смонтируется. Это P1-риск доступности функциональности, но исправление поведения должно быть отдельной согласованной задачей, а не частью перемещения файла.

### 5.2. `src/utils/filterFreshOffers.ts`

**Фактическая ответственность:** доменные правила времени для акции:

- парсинг дат по Москве;
- проверка активности акции;
- определение «скоро закончится»;
- timestamp окончания для сортировки.

**Потребители:** только `src/composables/usePromotions.ts`; тест — `src/utils/filterFreshOffers.test.ts`.

**Зависимости:** `dayjs`, timezone plugins, тип `Promotion`.

**Почему `utils` слабое имя:** правила отвечают на вопросы предметной области «акция активна?» и «акция скоро закончится?». Они не являются generic helpers. Наиболее естественная существующая граница — `data/`, если трактовать её как слой модели и преобразований акций, либо новое узкое имя `promotions/` при дальнейшем росте.

### 5.3. `src/utils/configWarnings.ts`

**Фактическая ответственность:** диагностика внешнего promotion contract и формирование UI-сообщений о невосстановимых ошибках.

**Потребители:** только `src/components/InfoActions/InfoActions.vue`; тест — `src/utils/configWarnings.test.ts`.

**Зависимости:** `PromotionConfigInput`, `InvalidPromotion`, browser location и console.

**Нарушение ответственности внутри файла:**

- чистая диагностика контракта (`collectConfigDiagnostics`);
- presentation policy (`collectConfigWarnings` формирует русские UI-сообщения);
- environment/UI visibility (`isWarningsVisible` читает `import.meta.env` и query string);
- side effect логирования в `console.warn`.

Это не прямое нарушение слоёв, но файл уже объединяет data validation, UI policy и browser environment. Перенос без разделения улучшит навигацию, но не устранит смешение ответственности.

### 5.4. Есть ли реальное дублирование

Нет. По исходникам и Graphify:

- функции не повторяются;
- общих потребителей нет;
- `src/scripts/utils` обслуживает bootstrap;
- `src/utils` обслуживает promotion domain/diagnostics;
- циклических зависимостей между каталогами нет.

Следовательно, проблема — семантическая и организационная, а не runtime-проблема или дублирование реализации.

## 6. Проблемы, приоритеты и риски

### P1 — `hostReactAppReady()` может ждать бесконечно

Если контракт с host page нарушен, entry point навсегда остаётся в ожидании. Название аргумента `timeout` вводит в заблуждение: это polling interval. Риск — полный отказ блока без контролируемого fallback/diagnostic.

### P1 — ручное исключение dev-конфига из production

Активный import в `src/scripts/info-actions.js` требуется вручную комментировать. Скрипт проверки обнаруживает ошибку после сборки, но архитектурно режимы dev/prod не разведены автоматически. Риск — неверный production artifact или дополнительная ручная операция релиза.

### P2 — размытые границы `utils`

Три файла имеют конкретные роли, скрытые generic-именем. Риск — дальнейшее накопление несвязанных helpers и ухудшение discoverability. Сейчас blast radius низкий, поскольку у каждого файла один production-потребитель.

### P2 — `configWarnings.ts` смешивает чистую диагностику, UI policy и side effects

При росте правил тестирование и повторное использование усложнятся. Сейчас тесты есть, поэтому немедленное большое дробление не требуется.

### P2 — JavaScript bootstrap вне строгого typecheck

`src/scripts/info-actions.js` и `hostReactAppReady.js` не входят в `tsconfig.include`. Риск локален интеграционной границей, но именно там ошибки способны полностью остановить mount.

### P3 — `brand.ts` совмещает конфигурацию бренда и analytics transport

Модуль остаётся небольшим и покрыт тестом `detectBrand`; разделение оправдано только при появлении новых аналитических каналов/целей.

### P3 — `InfoActions.vue` является широким orchestration component

Он читает global data, запускает диагностику, управляет responsive pagination и связывает UI с аналитикой. Это приемлемо для одного экрана, но новый функционал следует выносить в use-case composables, а не добавлять в компонент.

## 7. Варианты решения `utils`

### Вариант A — минимальный, рекомендуемый

Устранить второй `utils` и разложить файлы по существующим смысловым каталогам:

- `src/scripts/utils/hostReactAppReady.js` → `src/scripts/hostReactAppReady.js`;
- `src/utils/filterFreshOffers.ts` → `src/data/promotionDates.ts`;
- `src/utils/configWarnings.ts` → `src/data/promotionDiagnostics.ts`;
- тесты переместить рядом и обновить только соответствующие импорты/документацию.

Плюсы: минимальный diff, ноль новых архитектурных слоёв, имена описывают назначение, оба `utils` исчезают. Минус: `data/` станет включать не только I/O, но и promotion model/domain transformations; фактически `promoSchema.ts` уже делает это, поэтому решение соответствует текущей архитектуре.

### Вариант B — оставить `src/utils`, убрать только вложенный `scripts/utils`

- переместить только `hostReactAppReady.js` в `src/scripts/`;
- переименовать файлы внутри `src/utils` более явно, но сохранить каталог.

Плюсы: самый маленький diff. Минус: generic utility bucket остаётся и не решает замечание о корректных границах полностью.

### Вариант C — выделить feature/domain-модуль promotions

Создать `src/promotions/` с подпапками `model`, `composables`, `components` или более плоской feature-структурой и перенести связанные типы, нормализацию, dates, diagnostics и UI orchestration.

Плюсы: сильная feature cohesion и хорошая расширяемость. Минусы: для текущего небольшого лендинга это широкий рефакторинг, затрагивающий большинство импортов без изменения поведения. Сейчас не соответствует принципу минимальности и создаст лишний migration risk.

## 8. Рекомендованный план по спринтам

### Спринт 1 — безопасная файловая классификация

Цель: убрать неоднозначные `utils` без изменения поведения.

1. Зафиксировать baseline targeted tests.
2. Переместить `hostReactAppReady.js` в `src/scripts/hostReactAppReady.js`.
3. Переместить `filterFreshOffers.ts` и тест в `src/data/promotionDates.*`.
4. Переместить `configWarnings.ts` и тест в `src/data/promotionDiagnostics.*`.
5. Обновить только прямые импорты и документацию структуры.
6. Выполнить targeted tests, typecheck и build/check в согласованном объёме.

Ожидаемый blast radius: 3 production-файла-потребителя (`info-actions.js`, `usePromotions.ts`, `InfoActions.vue`), два тестовых импорта и документация. Поведение не меняется.

### Спринт 2 — надёжность host bootstrap

Цель: сделать нарушение host-контракта наблюдаемым и конечным.

1. Переименовать polling-параметр в `pollIntervalMs`.
2. Добавить реальный `maxWaitMs` и согласовать fallback: mount после timeout либо явный отказ с диагностикой.
3. Перевести bootstrap helper и, желательно, entry point на TypeScript либо явно включить JS в typecheck/checkJs.
4. Добавить тесты на ready, delayed ready и timeout.

Этот спринт меняет поведение, поэтому его нельзя смешивать с механическим перемещением.

### Спринт 3 — автоматизация dev/prod-конфига

Цель: исключить ручное комментирование import перед production build.

1. Проверить поддерживаемый builder-ом механизм env/conditional dev import.
2. Подключать локальный конфиг только в dev автоматически.
3. Сохранить production guard как дополнительную защиту.
4. Проверить dev и production artifacts.

## 9. Рекомендация

Для текущего проекта выбрать вариант A и выполнить только Спринт 1 после отдельного согласования. Он исправляет файловую семантику с минимальным риском и без преждевременной архитектурной перестройки.

Спринты 2 и 3 следует согласовывать отдельно: они решают более существенные эксплуатационные риски, но меняют runtime/build behavior и не нужны для механического устранения двух `utils`.

## 10. Ограничения проверки

- Production-код не изменялся.
- `graphify-out/` не изменялся; обнаруженные в нём изменения существовали до работы Architecture Agent.
- Тесты, typecheck и build не запускались, поскольку задача была read-only анализом.
- Содержимое build output `@CMS/` не использовалось как источник архитектурной истины.
