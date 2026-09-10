# Graph Report - info-actions-2026-coral-sunmar  (2026-09-10)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 339 nodes · 442 edges · 25 communities (23 shown, 2 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 7 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `6fbf8618`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- AGENTS.md
- brand.ts
- InfoActions.vue
- promoSchema.ts
- Card.vue
- scripts
- compilerOptions
- 3. Проблема с Яндекс.Метрикой на продакшене
- Tabs.vue
- usePromotionContext.ts
- Аудит проекта и план рефакторинга
- Model routing
- Рефакторинг `info-actions-2026`
- devDependencies
- info-actions-2026
- clipboard.directive.ts
- development.md
- testing.md
- check-production-config.mjs
- promotion-click-metrika.test.js

## God Nodes (most connected - your core abstractions)
1. `compilerOptions` - 15 edges
2. `scripts` - 14 edges
3. `normalizePromotions()` - 9 edges
4. `Promotion` - 8 edges
5. `normalizeString()` - 8 edges
6. `Model routing` - 8 edges
7. `3. Проблема с Яндекс.Метрикой на продакшене` - 8 edges
8. `collectConfigDiagnostics()` - 7 edges
9. `usePromotions()` - 7 edges
10. `Аудит проекта и план рефакторинга` - 7 edges

## Surprising Connections (you probably didn't know these)
- `infoActions()` --calls--> `waitForAppPrerequisites()`  [EXTRACTED]
  src/scripts/info-actions.js → src/scripts/waitForAppPrerequisites.ts
- `usePromotions()` --calls--> `normalizePromotions()`  [EXTRACTED]
  src/composables/usePromotions.ts → src/data/promoSchema.ts
- `endText` --calls--> `formatPromotionEndText()`  [EXTRACTED]
  src/components/InfoActions/Card/Card.vue → src/data/promotionDates.ts
- `observe()` --calls--> `reachBonusGoal()`  [EXTRACTED]
  src/directives/ymbonus.directive.ts → src/config/brand.ts
- `usePromotions()` --calls--> `filterFreshOffers()`  [EXTRACTED]
  src/composables/usePromotions.ts → src/data/promotionDates.ts

## Import Cycles
- None detected.

## Communities (25 total, 2 thin omitted)

### Community 0 - "AGENTS.md"
Cohesion: 0.06
Nodes (30): Agent delegation, Agent reports, Agent workflow, Architecture Agent, Changes, Code quality, Comments, Context limit (+22 more)

### Community 1 - "brand.ts"
Cohesion: 0.09
Nodes (21): ANALYTICS_BRAND, BonusGoalParams, BRAND_OPTIONS, detectBrand(), METRIKA, METRIKA_BY_BRAND, reachBonusGoal(), Window (+13 more)

### Community 2 - "InfoActions.vue"
Cohesion: 0.11
Nodes (21): areWarningsVisible, {brand, getErid, publishPromotionClick}, {
	currentFilter,
	filteredPromotions,
	filters,
	freshPromotions,
	hasPromotions,
	invalidPromotions,
}, isDesktop, isTablet, {
	nextPageCount,
	remainingCount,
	showMore,
	visibleItems: visiblePromotions,
}, pageSize, priorityImageCount (+13 more)

### Community 3 - "promoSchema.ts"
Cohesion: 0.15
Nodes (23): escapeHtml(), htmlToText(), isBonusPromotion(), isPromotionConfigInput(), missingRequired(), normalizePromotion(), normalizePromotions(), normalizeString() (+15 more)

### Community 4 - "Card.vue"
Cohesion: 0.13
Nodes (20): canHover, closeOnFocusOut(), closeOnHover(), copied, emit, endDate, endText, eridDisclosureRef (+12 more)

### Community 5 - "scripts"
Cohesion: 0.08
Nodes (23): dayjs, dependencies, dayjs, @vueuse/core, name, private, scripts, block:add (+15 more)

### Community 6 - "compilerOptions"
Cohesion: 0.08
Nodes (23): DOM, DOM.Iterable, ES2022, src/**/*.d.ts, src/**/*.ts, src/**/*.vue, vite/client, compilerOptions (+15 more)

### Community 7 - "3. Проблема с Яндекс.Метрикой на продакшене"
Cohesion: 0.10
Nodes (19): 1.1 Что это, 1.2 Что уже хорошо (сделано при миграции), 1.3 Проблемы, найденные в текущем коде, 1. Анализ проекта, 2.1 Отдельный трек: производительность Vue и семантика (вместо SSR), 2. План по оптимизации и рефакторингу, 3.0 Контекст: данные тоже приходят асинхронно, 3.1 ⛔ Гонка с загрузкой счётчика — цели теряются молча (главная причина) (+11 more)

### Community 8 - "Tabs.vue"
Cohesion: 0.15
Nodes (13): anchorRef, {anchorStyle, isFixed, isVisible, navigationStyle}, isScrollableNavigation, listRef, model, navigationRef, FixedNavigationOptions, NavigationState (+5 more)

### Community 9 - "usePromotionContext.ts"
Cohesion: 0.19
Nodes (9): dispatchPromotionClick(), PROMOTION_CLICK_EVENT, PromotionClickDetail, CustomEventStub, resolveErid(), usePromotionContext(), getErid(), publishPromotionClick() (+1 more)

### Community 10 - "Аудит проекта и план рефакторинга"
Cohesion: 0.14
Nodes (13): Артефакты Graphify, Аудит проекта и план рефакторинга, Итог выполнения, План рефакторинга по спринтам, Рекомендуемый порядок, Спринт 0 — зафиксировать baseline, Спринт 1 — безопасный production-конфиг (P0), Спринт 2 — контракт внешних данных (P1) (+5 more)

### Community 11 - "Model routing"
Cohesion: 0.14
Nodes (14): Agent defaults, Complexity classification, Cost-awareness, Downgrade rule, Escalation rule, HIGH, LIGHT, LOW (+6 more)

### Community 12 - "Рефакторинг `info-actions-2026`"
Cohesion: 0.15
Nodes (12): 1. Текущая архитектура, 2. Выполнено, 3. Согласованные ограничения, 4. Что осталось, 5. Контрольные команды, UI, доступность и производительность, Контракт данных, Надёжность и аналитика (+4 more)

### Community 13 - "devDependencies"
Cohesion: 0.18
Nodes (11): devDependencies, sass, @vitejs/plugin-vue, vitest, vue, vue-tsc, sass, @vitejs/plugin-vue (+3 more)

### Community 14 - "info-actions-2026"
Cohesion: 0.22
Nodes (8): info-actions-2026, Аналитика кликов, Блоки (`src/order.json`), Документация, Источник данных об акциях, Отличия от версии 2025, Поля записи: обязательные и необязательные, Структура

### Community 15 - "clipboard.directive.ts"
Cohesion: 0.22
Nodes (5): cleanupByElement, clipboard, ClipboardBindingValue, ClipboardOptions, valueByElement

### Community 16 - "development.md"
Cohesion: 0.57
Nodes (7): Изменённые файлы, Ограничения, Реализация, Спринт 2 — контракт внешних данных, Спринт 3 — производительность изображений, Спринт 4 — стили и визуальная устойчивость, Спринт 5 — документация и архитектурный контроль

### Community 17 - "testing.md"
Cohesion: 0.50
Nodes (7): Выполнено, Не проверено, Покрытые случаи, Проверка Спринта 2, Проверка Спринта 3, Проверка Спринта 4, Проверка Спринта 5

## Knowledge Gaps
- **178 isolated node(s):** `BonusGoalParams`, `Window`, `YmFunction`, `BonusBindingValue`, `NormalizedBonusBinding` (+173 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **2 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Promotion` connect `promoSchema.ts` to `usePromotionContext.ts`, `InfoActions.vue`, `Card.vue`?**
  _High betweenness centrality (0.015) - this node is a cross-community bridge._
- **Why does `Model routing` connect `Model routing` to `AGENTS.md`?**
  _High betweenness centrality (0.008) - this node is a cross-community bridge._
- **Why does `usePromotions()` connect `Card.vue` to `InfoActions.vue`, `promoSchema.ts`?**
  _High betweenness centrality (0.006) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `normalizeString()` (e.g. with `isBonusPromotion()` and `parseFilters()`) actually correct?**
  _`normalizeString()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `BonusGoalParams`, `Window`, `YmFunction` to the rest of the system?**
  _178 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `AGENTS.md` be split into smaller, more focused modules?**
  _Cohesion score 0.06451612903225806 - nodes in this community are weakly interconnected._
- **Should `brand.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.09359605911330049 - nodes in this community are weakly interconnected._