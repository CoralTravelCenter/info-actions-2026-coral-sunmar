# Read-only security audit

Дата: 2026-09-07  
Scope: XSS/инъекции, внешние данные и скрипты, URL/clipboard/DOM API, утечки данных, supply-chain/config.  
Метод: Graphify использован как навигационный индекс; findings подтверждены по текущим исходникам (`HEAD 9c8f9e9`).
Индекс построен с commit `1796370d`, поэтому считался потенциально устаревшим и не использовался как source of truth.

## Findings

### HIGH — неподдерживаемый URL диагностируется, но всё равно попадает в кликабельный `href`

**Evidence:**

- `src/data/promotions.ts:9-17` без доверенной границы читает массив из глобального `window._promotion_settings`,
  который в production заполняет внешний скрипт.
- `src/data/promoSchema.ts:98-100` только обрезает пробелы у `visual`/`url`, не проверяя схему.
- `src/data/promotionDiagnostics.ts:37-45,89-94` распознаёт только `http:`/`https:`, однако функция является лишь
  диагностикой.
- `src/data/promotionDiagnostics.ts:123-143` возвращает warnings, но не исключает/исправляет опасную запись; в
  production диагностика вообще вызывается только при `?promo_debug=1`
  (`src/components/InfoActions/InfoActions.vue:31-34`, `src/data/promotionDiagnostics.ts:118-120`).
- `src/components/InfoActions/Card/Card.vue:220-230` напрямую устанавливает значение в `:href`.

**Impact:** при компрометации/ошибке внешнего конфига значение наподобие `javascript:...` становится исполняемым URL при
клике. Это stored/config-driven XSS в origin страницы. `target="_blank"` и `rel="noopener noreferrer"` защищают
opener/referrer, но не нейтрализуют опасную схему.

**Recommendation:** валидировать и нормализовать URL внутри production data boundary (`normalizePromotion` или отдельный
parser), до создания `Promotion`; разрешать только явно ожидаемые `https:` (при необходимости — `http:` в dev) и, если
бизнес допускает, allowlist hostnames. Невалидную ссылку превращать в отсутствие URL либо отбрасывать запись по явному
контракту. Добавить тест, подтверждающий, что `javascript:`, `data:`, protocol-relative/неожиданные origins не достигают
`href`.

### MEDIUM — безопасность production-конфига зависит от ручного release-шагa

**Evidence:**

- `src/scripts/info-actions.js:3-5` содержит активный импорт локального `promotion-settings-coral.js` и инструкцию
  вручную закомментировать его перед production-сборкой.
- `tools/check-production-config.mjs:3-24` проверяет этот импорт отдельной командой.
- `package.json:6-18`: `check:production-config` не включён автоматически ни в `build`, ни в `deploy`/`deploy:section`.

**Impact:** локальный/тестовый набор данных может попасть в production artifact, раскрывая непредназначенные к
публикации кампании/URL и подменяя ожидаемый внешний конфиг. Это скорее release/config integrity risk, чем прямое
выполнение кода.

**Recommendation:** развести dev/prod источники через build mode и условный импорт, либо сделать production check
обязательной частью build/deploy pipeline. Проверять итоговый artifact или manifest, а не только строку исходного
импорта.

### LOW — публичные DOM-события не валидируют форму события и раскрывают clipboard payload слушателям страницы

**Evidence:**

- `external-scripts/promotion-click-metrika-{coral,sunmar}.js:1-2` без guard делает destructuring `event.detail`; любой
  другой скрипт страницы может вызвать одноимённый `Event` и оборвать обработчик исключением. Из-за switch allowlist
  произвольные analytics-значения наружу не уходят.
- `src/directives/clipboard.directive.ts:92-101` публикует `{ok, text, error}` в bubbling `CustomEvent`; любой код
  страницы может прочитать копируемый текст. Текущее применение копирует публичный ERID (`Card.vue:125-130`), поэтому
  фактическая конфиденциальность низкая.

**Recommendation:** валидировать `event instanceof CustomEvent` и `typeof event.detail?.name === "string"`; в clipboard
event не включать `text`, если будущие consumers могут копировать чувствительные значения, либо документировать
директиву как public-page API.

## Подтверждённые безопасные/положительные свойства

- `v-html` используется только для `nameHtml`/`descriptionHtml` (`Card.vue:170-172`), а `src/data/promoSchema.ts:23-37`
  сначала экранирует `&<>"'` и возвращает только нормализованный `<br>`. Тест `src/data/promoSchema.test.ts:6-10`
  покрывает `<script>`; явного HTML-XSS здесь не найдено.
- Обычные значения (`legal`, ERID, aria labels, warning messages) выводятся Vue-интерполяцией и не вставляются как raw
  HTML.
- В коде не найдены `eval`, `Function`, `document.write`, `innerHTML`/`outerHTML`, cookie/localStorage/sessionStorage
  или сетевые `fetch`/XHR операции.
- Внешняя click-аналитика преобразует название кампании через жёсткий switch и отправляет только фиксированные
  идентификаторы; произвольный текст конфига в Метрику этим путём не передаётся. Bonus-impression отправляет pathname и
  публичное название акции (`src/directives/ymbonus.directive.ts:39-48`). PII/секретов в проверенном потоке не
  обнаружено.
- Clipboard fallback создаёт `textarea`, задаёт текст через `.value` и удаляет узел; HTML-инъекции через него нет.
  `execCommand("copy")` устарел, но здесь вызван только из пользовательского click handler.
- `package-lock.json` lockfile v3 фиксирует resolved tarballs и integrity hashes. Найдены install scripts у
  `@parcel/watcher` и optional `fsevents`; это типичные native/tooling зависимости, но их lifecycle scripts сохраняют
  стандартный supply-chain blast radius при install.

## Supply-chain verification

- `npm audit` / сверка с актуальной vulnerability database: **NOT VERIFIED** (аудит выполнен без сетевого запроса к
  registry/advisory service).
- Статический lockfile review: **VERIFIED** — registry URLs и integrity присутствуют; git/http dependencies не найдены;
  два пакета имеют `hasInstallScript`.
- Рекомендация CI: `npm ci`, затем актуальный `npm audit`/организационный SCA scanner; для hardened job рассмотреть
  отдельный install/check с `--ignore-scripts`, если builder не требует lifecycle scripts.

## Итоговый приоритет

1. Блокировать опасные URL на production data boundary.
2. Убрать ручное переключение dev/prod конфига и встроить gate в pipeline.
3. Harden публичные DOM-события; clipboard payload ограничить до действительно необходимого.

