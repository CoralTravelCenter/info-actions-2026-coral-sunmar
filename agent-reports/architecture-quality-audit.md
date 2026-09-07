# Аудит архитектуры и качества кода

Дата: 2026-09-07  
Режим: read-only для production-кода  
Сложность: MEDIUM  

## Scope и методика

Проверены модульные границы, связность, типизация, тестируемость, дублирование, обработка ошибок и поддерживаемость. Для навигации использован `graphify-out`, выводы подтверждены по текущим исходникам и тестам.

Graphify построен для коммита `1796370d`, текущий HEAD — `9c8f9e9b7c2689042e8a4031621ff711ebbced84`; индекс частично устарел (например, содержит прежние `src/utils/*`, тогда как текущая логика дат и диагностики находится в `src/data/*`). Поэтому индекс использован только как карта, не как source of truth.

## Краткая оценка

Архитектурная база хорошая для небольшого виджета: внешний конфиг проходит через отдельную нормализацию, внутренняя модель типизирована, UI отделён от фильтрации и аналитики, циклических импортов Graphify не обнаружил. Чистые функции и composables покрыты targeted-тестами. Основные риски сосредоточены не в доменной логике, а в bootstrap/production boundary: критичный entrypoint остаётся JavaScript без проверки типов, готовность внешнего конфига не имеет явного контракта, а dev-конфиг исключается из production вручную.

## Находки

### P0 — production-сборка зависит от ручного удаления dev-конфига

Файлы:

- `src/scripts/info-actions.js:3-5`
- `tools/check-production-config.mjs:4-22`
- `package.json:6-17`

Entrypoint безусловно импортирует `promotion-settings.js`; комментарий требует вручную закомментировать импорт перед production-сборкой. Отдельная проверка существует, но не включена в `build`, `check` или `deploy`. Это делает корректность артефакта зависимой от памяти разработчика и допускает публикацию тестовых/устаревших данных.

Рекомендация: сделать выбор источника конфигурации детерминированным через build mode/env или отдельный production entrypoint; как минимум встроить fail-fast проверку в обязательный build/deploy pipeline. Не полагаться на редактирование source перед сборкой.

### P1 — bootstrap не формализует готовность данных и может ждать бесконечно

Файлы:

- `src/scripts/hostReactAppReady.js:1-15`
- `src/scripts/info-actions.js:13-27`
- `src/data/promotions.ts:9-20`
- `src/components/InfoActions/InfoActions.vue:14-21`

`hostReactAppReady()` проверяет только высоту DOM-узла, не наличие `window._promotion_settings`; timeout является интервалом polling, а не предельным временем ожидания. Promise не имеет reject/abort/верхней границы. После ожидания Vue один раз синхронно снимает snapshot глобального массива. Если host так и не станет видимым, блок не смонтируется никогда; если конфиг появится позже host readiness, виджет зафиксирует пустой список без восстановления.

Рекомендация: определить единый bootstrap-контракт (`await host + config`, с конечным timeout и наблюдаемым failure), передавать готовые данные в app через props/provide вместо чтения global внутри компонента. Если позднее появление данных допустимо — использовать явно реактивный источник или событие готовности.

### P1 — критичная интеграционная граница исключена из TypeScript-проверки

Файлы:

- `src/scripts/info-actions.js:1-28`
- `src/scripts/hostReactAppReady.js:1-16`
- `tsconfig.json:7-17`

`allowJs: true`, но `checkJs: false`, а `include` содержит только `*.ts`, `*.vue`, `*.d.ts`. Следовательно, bootstrap, DOM lookup и readiness loop не проверяются `vue-tsc`. Именно эти файлы связывают host, внешний конфиг, Vue, директивы и бренд — у них высокий интеграционный риск.

Рекомендация: мигрировать два небольших файла в `.ts` либо включить ограниченный `checkJs`/JSDoc-контракт. Добавить тесты на отсутствие target, timeout и порядок готовности host/config.

### P1 — валидация контракта разделена между двумя реализациями и расходится с runtime-поведением

Файлы:

- `src/data/promoSchema.ts:15-51,113-158`
- `src/data/promotionDiagnostics.ts:3-45,49-115`
- `src/data/promotionDates.ts:12-19,22-54`
- `src/data/promotionDiagnostics.ts:123-143`

Нормализация, диагностика и runtime-фильтрация независимо интерпретируют одни и те же поля. Даты валидируются вручную через regex/`Date` в diagnostics и отдельно через strict Day.js в dates. URL проверяется только диагностикой, но затем нормализатор пропускает исходное значение. Некорректная дата не делает запись `invalid`: карточка молча исчезает в `filterFreshOffers()`. Кроме того, `collectConfigWarnings()` вычисляет diagnostics и пишет их в console, но возвращает только fatal messages, поэтому UI-предупреждение не отражает весь найденный контрактный долг. Сейчас тесты фиксируют отдельные функции, но не гарантируют их согласованность.

Рекомендация: выделить единый результат разбора/валидации поля (typed issue code + severity), из которого одновременно строятся нормализованная модель, UI warnings и logs. До рефакторинга добавить contract-тесты, подтверждающие одинаковое понимание дат/URL всеми слоями.

### P2 — побочные эффекты смешаны с чистой нормализацией

Файлы:

- `src/data/promoSchema.ts:113-158`
- `src/data/promotions.ts:9-20`
- `src/data/promotionDiagnostics.ts:123-143`

`normalizePromotions()` одновременно преобразует данные и пишет warnings; чтение global также логирует, а слой diagnostics снова логирует агрегаты. Это затрудняет повторное использование, делает тесты шумными и распределяет logging policy по data-layer.

Рекомендация: возвращать структурированные issues без `console.*`; логирование/показ выполнять один раз на composition/bootstrap boundary. Это также устранит косвенный контракт `missing: []` как маркер duplicate id (`src/types/promotion.ts:50-53`, `promoSchema.ts:141-144`). Лучше использовать discriminated union с явным `code`.

### P2 — UI-границы в целом разумны, но компонент карточки и DOM-интеграции недотестированы

Файлы:

- `src/components/InfoActions/Card/Card.vue:1-247`
- `src/components/InfoActions/InfoActions.vue:1-110`
- `src/components/InfoActions/Tabs/Tabs.vue:1-91`
- `src/directives/clipboard.directive.ts:1-120`

`Card.vue` объединяет ERID popover state, clipboard interaction, legal-string parsing, image priority и CTA rendering. Для текущего размера это ещё приемлемо, но изменения имеют широкий локальный blast radius. Unit-тесты хорошо покрывают data/composables и bonus directive, однако отсутствуют component tests для Card/Tabs/InfoActions, тест clipboard directive и bootstrap integration test. Особенно не проверены keyboard/focus/click-outside сценарии и error event при clipboard failure.

Рекомендация: не дробить компонент абстракциями заранее; сначала добавить 2–3 интеграционных component tests на критические пользовательские сценарии. Выносить ERID disclosure в компонент только при следующем существенном изменении этого блока.

### P3 — типы внутренней модели обещают меньше неизменяемости, чем фактически предполагает код

Файлы:

- `src/types/promotion.ts:27-46`
- `src/data/promoSchema.ts:92-110,158`

Объекты замораживаются поверхностно, но `filters` остаётся изменяемым массивом, а `NormalizedPromotions.promotions/invalid` типизированы как mutable. Consumers уже используют readonly inputs. Это не текущий bug, но контракт допускает случайную мутацию нормализованного результата.

Рекомендация: при плановом изменении типов перейти на `readonly` поля/массивы и, если runtime immutability действительно нужна, замораживать вложенные коллекции. Не вводить deep-freeze без измеримой необходимости.

### P3 — Graphify index не синхронизирован с HEAD

Файлы:

- `graphify-out/GRAPH_REPORT.md:1-9`
- `graphify-out/manifest.json`

Навигационный индекс отстаёт от текущего кода и содержит уже перемещённые файлы. Это не влияет на runtime, но повышает вероятность неверного архитектурного анализа.

Рекомендация: обновлять Graphify отдельным workflow после стабилизации изменений; generated index не править вручную.

## Сильные стороны

- По Graphify импорт-циклов нет; зависимости в основном идут `UI → composables → data/types`, что соответствует ответственности слоёв.
- Внешние данные входят как `unknown[]` и нормализуются до `Promotion`, вместо распространения untyped config по UI (`promotions.ts`, `promoSchema.ts`, `types/promotion.ts`).
- Бизнес-правила фильтрации и pagination вынесены в тестируемые composables/functions; текущее покрытие сфокусировано на границах дат, schema, filters и analytics events.
- HTML из внешнего конфига санитизируется до использования с `v-html` (`promoSchema.ts:23-37`, `Card.vue:171-172`).
- Lifecycle cleanup у обеих директив реализован через WeakMap/stop callbacks; bonus impressions дедуплицируются по стабильному promotion id.

## Рекомендуемый порядок улучшений

1. Устранить ручной production-config toggle и сделать проверку частью обязательного pipeline.
2. Формализовать bootstrap readiness для host и config с конечным timeout/error state.
3. Типизировать bootstrap-файлы и покрыть их интеграционными тестами.
4. Объединить интерпретацию contract fields и structured diagnostics.
5. Добавить targeted component/directive tests; дробить Card только при реальной необходимости.

## Verification

- `VERIFIED`: `npm run test:run -- --reporter=dot` — 11 файлов, 37 тестов, все прошли.
- `VERIFIED`: `npm run typecheck` — завершён без ошибок.
- `VERIFIED`: Graphify использован как навигационный индекс; его commit сопоставлен с текущим HEAD.
- `NOT VERIFIED`: production build/deploy не запускался, так как аудит read-only и активный dev-config заведомо требует отдельного production workflow.

