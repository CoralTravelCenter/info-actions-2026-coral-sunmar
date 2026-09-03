# Graph Report - info-actions-2026-coral-sunmar  (2026-09-03)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 196 nodes · 272 edges · 13 communities (12 shown, 1 thin omitted)
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 7 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `2b96a7a7`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Community 0
- Community 1
- Community 2
- Community 3
- Community 4
- Community 5
- Community 6
- Community 7
- Community 8
- Community 9
- Community 10
- Community 11

## God Nodes (most connected - your core abstractions)
1. `compilerOptions` - 15 edges
2. `scripts` - 13 edges
3. `normalizePromotions()` - 9 edges
4. `normalizeString()` - 9 edges
5. `Promotion` - 8 edges
6. `usePromotions()` - 7 edges
7. `normalizePromotion()` - 7 edges
8. `filterFreshOffers()` - 5 edges
9. `isEndingSoon()` - 5 edges
10. `sanitizePromotionHtml()` - 5 edges

## Surprising Connections (you probably didn't know these)
- `PromotionClickDetail` --references--> `Promotion`  [EXTRACTED]
  src/analytics/promotionEvents.ts → src/types/promotion.ts
- `usePromotions()` --calls--> `normalizePromotions()`  [EXTRACTED]
  src/composables/usePromotions.ts → src/data/promoSchema.ts
- `usePromotions()` --calls--> `filterFreshOffers()`  [EXTRACTED]
  src/composables/usePromotions.ts → src/utils/filterFreshOffers.ts
- `usePromotions()` --calls--> `getPromotionEndTimestamp()`  [EXTRACTED]
  src/composables/usePromotions.ts → src/utils/filterFreshOffers.ts
- `usePromotions()` --calls--> `isEndingSoon()`  [EXTRACTED]
  src/composables/usePromotions.ts → src/utils/filterFreshOffers.ts

## Import Cycles
- None detected.

## Communities (13 total, 1 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.08
Nodes (23): DOM, DOM.Iterable, ES2022, src/**/*.d.ts, src/**/*.ts, src/**/*.vue, vite/client, compilerOptions (+15 more)

### Community 1 - "Community 1"
Cohesion: 0.09
Nodes (22): dayjs, dependencies, dayjs, @vueuse/core, name, private, scripts, block:add (+14 more)

### Community 2 - "Community 2"
Cohesion: 0.11
Nodes (17): ANALYTICS_BRAND, BonusGoalParams, BRAND_OPTIONS, detectBrand(), METRIKA, METRIKA_BY_BRAND, reachBonusGoal(), Window (+9 more)

### Community 3 - "Community 3"
Cohesion: 0.12
Nodes (15): areWarningsVisible, {brand, getErid, publishPromotionClick}, {
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
}, pageSize, rawPromotions (+7 more)

### Community 4 - "Community 4"
Cohesion: 0.21
Nodes (18): createPromotionId(), escapeHtml(), hashString(), htmlToText(), isBonusPromotion(), isPromotionConfigInput(), missingRequired(), normalizePromotion() (+10 more)

### Community 5 - "Community 5"
Cohesion: 0.15
Nodes (13): anchorRef, {anchorStyle, isFixed, isVisible, navigationStyle}, isScrollableNavigation, listRef, model, navigationRef, FixedNavigationOptions, NavigationState (+5 more)

### Community 6 - "Community 6"
Cohesion: 0.14
Nodes (12): canHover, closeOnFocusOut(), closeOnHover(), copied, emit, endDate, eridDisclosureRef, eridPopoverId (+4 more)

### Community 7 - "Community 7"
Cohesion: 0.18
Nodes (7): cleanupByElement, clipboard, ClipboardBindingValue, ClipboardOptions, valueByElement, infoActions(), hostReactAppReady()

### Community 8 - "Community 8"
Cohesion: 0.15
Nodes (13): devDependencies, sass, typescript, @vitejs/plugin-vue, vitest, vue, vue-tsc, sass (+5 more)

### Community 9 - "Community 9"
Cohesion: 0.23
Nodes (10): dispatchPromotionClick(), PROMOTION_CLICK_EVENT, PromotionClickDetail, PromotionDestination, resolveErid(), usePromotionContext(), getErid(), publishPromotionClick() (+2 more)

### Community 10 - "Community 10"
Cohesion: 0.49
Nodes (6): ENDING_SOON_FILTER, usePromotions(), filterFreshOffers(), getPromotionEndTimestamp(), isEndingSoon(), parseMsk()

## Knowledge Gaps
- **96 isolated node(s):** `BonusGoalParams`, `Window`, `YmFunction`, `BonusBindingValue`, `NormalizedBonusBinding` (+91 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **1 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Promotion` connect `Community 9` to `Community 10`, `Community 3`, `Community 4`, `Community 6`?**
  _High betweenness centrality (0.045) - this node is a cross-community bridge._
- **Why does `usePromotions()` connect `Community 10` to `Community 3`, `Community 4`?**
  _High betweenness centrality (0.018) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `normalizeString()` (e.g. with `isBonusPromotion()` and `parseFilters()`) actually correct?**
  _`normalizeString()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `BonusGoalParams`, `Window`, `YmFunction` to the rest of the system?**
  _96 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.08333333333333333 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.08695652173913043 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.10822510822510822 - nodes in this community are weakly interconnected._