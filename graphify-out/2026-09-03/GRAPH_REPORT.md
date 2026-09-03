# Graph Report - info-actions-2026-coral-sunmar  (2026-09-03)

## Corpus Check
- 40 files · ~15,464 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 337 nodes · 414 edges · 20 communities (19 shown, 1 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 7 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `1796370d`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- compilerOptions
- scripts
- brand.ts
- InfoActions.vue
- promoSchema.ts
- Tabs.vue
- Card.vue
- AGENTS.md
- devDependencies
- usePromotionContext.ts
- usePromotions.ts
- check-production-config.mjs
- 3. Проблема с Яндекс.Метрикой на продакшене
- Model routing
- development.md
- Аудит проекта и план рефакторинга
- Рефакторинг `info-actions-2026`
- testing.md
- info-actions-2026

## God Nodes (most connected - your core abstractions)
1. `compilerOptions` - 15 edges
2. `scripts` - 13 edges
3. `normalizeString()` - 9 edges
4. `normalizePromotions()` - 9 edges
5. `Promotion` - 8 edges
6. `Model routing` - 8 edges
7. `3. Проблема с Яндекс.Метрикой на продакшене` - 8 edges
8. `usePromotions()` - 7 edges
9. `normalizePromotion()` - 7 edges
10. `collectConfigDiagnostics()` - 7 edges

## Surprising Connections (you probably didn't know these)
- `PromotionClickDetail` --references--> `Promotion`  [EXTRACTED]
  src/analytics/promotionEvents.ts → src/types/promotion.ts
- `usePromotions()` --calls--> `normalizePromotions()`  [EXTRACTED]
  src/composables/usePromotions.ts → src/data/promoSchema.ts
- `publishPromotionClick()` --calls--> `dispatchPromotionClick()`  [EXTRACTED]
  src/composables/usePromotionContext.ts → src/analytics/promotionEvents.ts
- `usePromotions()` --calls--> `filterFreshOffers()`  [EXTRACTED]
  src/composables/usePromotions.ts → src/utils/filterFreshOffers.ts
- `usePromotions()` --calls--> `getPromotionEndTimestamp()`  [EXTRACTED]
  src/composables/usePromotions.ts → src/utils/filterFreshOffers.ts

## Import Cycles
- None detected.

## Communities (20 total, 1 thin omitted)

### Community 0 - "compilerOptions"
Cohesion: 0.08
Nodes (23): DOM, DOM.Iterable, ES2022, src/**/*.d.ts, src/**/*.ts, src/**/*.vue, vite/client, compilerOptions (+15 more)

### Community 1 - "scripts"
Cohesion: 0.09
Nodes (22): dayjs, dependencies, dayjs, @vueuse/core, name, private, scripts, block:add (+14 more)

### Community 2 - "brand.ts"
Cohesion: 0.07
Nodes (25): ANALYTICS_BRAND, BonusGoalParams, Brand, BRAND_OPTIONS, detectBrand(), METRIKA, METRIKA_BY_BRAND, reachBonusGoal() (+17 more)

### Community 3 - "InfoActions.vue"
Cohesion: 0.11
Nodes (21): areWarningsVisible, {brand, getErid, publishPromotionClick}, {
	currentFilter,
	filteredPromotions,
	filters,
	hasPromotions,
	invalidPromotions,
}, isDesktop, isTablet, {
	nextPageCount,
	remainingCount,
	showMore,
	visibleItems: visiblePromotions,
}, pageSize, priorityImageCount (+13 more)

### Community 4 - "promoSchema.ts"
Cohesion: 0.21
Nodes (18): createPromotionId(), escapeHtml(), hashString(), htmlToText(), isBonusPromotion(), isPromotionConfigInput(), missingRequired(), normalizePromotion() (+10 more)

### Community 5 - "Tabs.vue"
Cohesion: 0.15
Nodes (13): anchorRef, {anchorStyle, isFixed, isVisible, navigationStyle}, isScrollableNavigation, listRef, model, navigationRef, FixedNavigationOptions, NavigationState (+5 more)

### Community 6 - "Card.vue"
Cohesion: 0.14
Nodes (12): canHover, closeOnFocusOut(), closeOnHover(), copied, emit, endDate, eridDisclosureRef, eridPopoverId (+4 more)

### Community 7 - "AGENTS.md"
Cohesion: 0.06
Nodes (30): Agent delegation, Agent reports, Agent workflow, Architecture Agent, Changes, Code quality, Comments, Context limit (+22 more)

### Community 8 - "devDependencies"
Cohesion: 0.15
Nodes (13): devDependencies, sass, typescript, @vitejs/plugin-vue, vitest, vue, vue-tsc, sass (+5 more)

### Community 9 - "usePromotionContext.ts"
Cohesion: 0.26
Nodes (9): dispatchPromotionClick(), PROMOTION_CLICK_EVENT, PromotionClickDetail, PromotionDestination, resolveErid(), usePromotionContext(), getErid(), publishPromotionClick() (+1 more)

### Community 10 - "usePromotions.ts"
Cohesion: 0.49
Nodes (6): ENDING_SOON_FILTER, usePromotions(), filterFreshOffers(), getPromotionEndTimestamp(), isEndingSoon(), parseMsk()

### Community 13 - "3. Проблема с Яндекс.Метрикой на продакшене"
Cohesion: 0.10
Nodes (19): 1.1 Что это, 1.2 Что уже хорошо (сделано при миграции), 1.3 Проблемы, найденные в текущем коде, 1. Анализ проекта, 2.1 Отдельный трек: производительность Vue и семантика (вместо SSR), 2. План по оптимизации и рефакторингу, 3.0 Контекст: данные тоже приходят асинхронно, 3.1 ⛔ Гонка с загрузкой счётчика — цели теряются молча (главная причина) (+11 more)

### Community 14 - "Model routing"
Cohesion: 0.14
Nodes (14): Agent defaults, Complexity classification, Cost-awareness, Downgrade rule, Escalation rule, HIGH, LIGHT, LOW (+6 more)

### Community 15 - "development.md"
Cohesion: 0.12
Nodes (16): Изменённые файлы, Изменённые файлы, Изменённые файлы, Изменённые файлы, Ограничения, Ограничения, Ограничения, Ограничения (+8 more)

### Community 16 - "Аудит проекта и план рефакторинга"
Cohesion: 0.14
Nodes (13): Артефакты Graphify, Аудит проекта и план рефакторинга, Итог выполнения, План рефакторинга по спринтам, Рекомендуемый порядок, Спринт 0 — зафиксировать baseline, Спринт 1 — безопасный production-конфиг (P0), Спринт 2 — контракт внешних данных (P1) (+5 more)

### Community 17 - "Рефакторинг `info-actions-2026`"
Cohesion: 0.15
Nodes (12): 1. Текущая архитектура, 2. Выполнено, 3. Согласованные ограничения, 4. Что осталось, 5. Контрольные команды, UI, доступность и производительность, Контракт данных, Надёжность и аналитика (+4 more)

### Community 18 - "testing.md"
Cohesion: 0.13
Nodes (14): Выполнено, Выполнено, Выполнено, Выполнено, Не проверено, Не проверено, Не проверено, Не проверено (+6 more)

### Community 19 - "info-actions-2026"
Cohesion: 0.22
Nodes (8): info-actions-2026, Аналитика кликов, Блоки (`src/order.json`), Документация, Источник данных об акциях, Отличия от версии 2025, Поля записи: обязательные и необязательные, Структура

## Knowledge Gaps
- **196 isolated node(s):** `name`, `version`, `private`, `type`, `dev` (+191 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **1 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Promotion` connect `usePromotionContext.ts` to `usePromotions.ts`, `InfoActions.vue`, `promoSchema.ts`, `Card.vue`?**
  _High betweenness centrality (0.015) - this node is a cross-community bridge._
- **Why does `Model routing` connect `Model routing` to `AGENTS.md`?**
  _High betweenness centrality (0.009) - this node is a cross-community bridge._
- **Why does `usePromotions()` connect `usePromotions.ts` to `InfoActions.vue`, `promoSchema.ts`?**
  _High betweenness centrality (0.006) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `normalizeString()` (e.g. with `isBonusPromotion()` and `parseFilters()`) actually correct?**
  _`normalizeString()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `name`, `version`, `private` to the rest of the system?**
  _196 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `compilerOptions` be split into smaller, more focused modules?**
  _Cohesion score 0.08333333333333333 - nodes in this community are weakly interconnected._
- **Should `scripts` be split into smaller, more focused modules?**
  _Cohesion score 0.08695652173913043 - nodes in this community are weakly interconnected._