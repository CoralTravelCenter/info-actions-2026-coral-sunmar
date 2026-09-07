# Аудит аналитики и производительности

Дата: 2026-09-07  
Режим: read-only аудит production-кода; production-файлы не изменялись.  
Scope: события клика и показа, payload/атрибуция, доставка, дубли/пропуски, privacy, DOM listeners/lifecycle, runtime/bundle costs.

## Краткая карта потока

- Показ бонусной акции: `InfoActions.vue` → `v-bonus` → `IntersectionObserver` → `reachBonusGoal()` → `window.ym`.
- Клик: `Card.vue` → Vue emit → `publishPromotionClick()` → `document` `CustomEvent` → отдельный внешний brand-specific скрипт → `window.ym`.
- Graphify подтверждает, что эти цепочки разнесены между communities `ymbonus.directive.ts`, `usePromotionContext.ts` и внешними (не входящими в граф сборки) скриптами.

## Findings

### [HIGH] Клики теряются при любом рассинхроне отображаемого названия и внешнего `switch`

Файлы/строки:

- `src/composables/usePromotionContext.ts:23-25`
- `src/analytics/promotionEvents.ts:3-9`
- `external-scripts/promotion-click-metrika-coral.js:1-17`
- `external-scripts/promotion-click-metrika-sunmar.js:1-17`

Во внешний контракт передается только изменяемое отображаемое `nameText`. Каждый внешний скрипт знает ровно три точных строки и молча игнорирует остальные. Переименование, пунктуация, пробел, изменение `<br>` или новая акция без синхронного обновления внешнего файла дают missed event. Стабильный `promotion.id`, URL/campaign code и brand в payload отсутствуют; аудит или восстановление атрибуции невозможны.

Рекомендация: хранить стабильный analytics key/entry point в конфиге акции, валидировать его при нормализации и передавать вместе с `id`, `brand` и (при необходимости) destination. Не использовать отображаемый текст как ключ атрибуции.

### [HIGH] Инициализация может бесконечно опрашивать DOM и полностью не запустить блок/аналитику

Файлы/строки:

- `src/scripts/hostReactAppReady.js:1-15`
- `src/scripts/info-actions.js:13-27`

`hostReactAppReady()` не имеет deadline/cancel path и каждые 200 мс вызывает `querySelector()` и layout-read `getBoundingClientRect()`. Если host selector изменился, отсутствует или остается нулевой высоты, цикл живет весь срок страницы. `infoActions()` навсегда остается на `await`, Vue не монтируется, поэтому не регистрируются карточки, impression observers и click publishers. Это одновременно missed analytics и постоянная runtime/layout-нагрузка.

Рекомендация: ограниченный timeout с явным поведением после истечения; предпочтительно readiness-сигнал/MutationObserver без постоянного layout polling. Нужен cleanup при отмене/демонтаже.

### [MEDIUM] Click-обработчики не имеют защитного/буферизующего пути доставки

Файлы/строки:

- `external-scripts/promotion-click-metrika-coral.js:1-23`
- `external-scripts/promotion-click-metrika-sunmar.js:1-23`
- для сравнения `src/config/brand.ts:48-67`

Внешние обработчики без проверки вызывают `window.ym(...)`. Если Метрика еще не создала очередь, заблокирована CSP/adblock/consent manager либо подключение нарушено, цель не буферизуется и повторной отправки нет. Обработчики также без shape validation читают `event.detail.name`; постороннее или несовместимое событие вызывает исключение. Impression-flow, напротив, создает совместимую очередь, поэтому надежность двух метрик различается.

Рекомендация: единый adapter отправки с проверкой counter/consent/readiness и документированной стратегией queue/drop; runtime validation публичного DOM-event. Для переходов в том же окне отдельно рассмотреть callback/короткий bounded wait, если это будет разрешено UX-требованиями.

### [MEDIUM] Impression считается доставленным сразу после помещения в локальную очередь и подавляется глобально

Файлы/строки:

- `src/config/brand.ts:48-67`
- `src/directives/ymbonus.directive.ts:17-18,30-55`

`reachBonusGoal()` возвращает `true`, даже когда лишь создал локальный `window.ym` stub. После этого ID навсегда для текущего document добавляется в module-level `sentPromotionIds`, observer отключается. Если настоящий счетчик так и не загрузится или очередь окажется несовместимой с host integration, impression потерян без диагностики/повтора. Глобальный Set также подавляет повторный legitimate impression после remount/filter revisit и растет до числа когда-либо показанных promotion IDs в долгоживущей SPA.

Рекомендация: явно определить семантику dedup (page view/session/component exposure), отделить `accepted/queued` от подтверждаемого состояния, ограничить lifetime dedup-кэша и добавить наблюдаемую диагностику delivery failures.

### [MEDIUM][PRIVACY] Показ может накапливаться до появления согласия без явного consent gate

Файлы/строки:

- `src/config/brand.ts:48-60`
- `src/directives/ymbonus.directive.ts:39-47`

При отсутствии `window.ym` код сам создает очередь и сохраняет impression с `location.pathname` и названием баннера. Если отсутствие Метрики означает, что consent еще не получен, последующая загрузка счетчика потенциально отправит накопленные до согласия события. Прямых PII в payload не обнаружено, query string не передается; privacy-риск состоит именно в timing/consent semantics.

Рекомендация: интегрировать явное состояние согласия host-приложения; до согласия либо не наблюдать/не enqueue, либо применять утвержденную privacy-политикой модель. Зафиксировать retention/назначение `pathname` и campaign name.

### [LOW] На каждую видимую карточку создаются отдельные глобальные listeners/composables

Файлы/строки:

- `src/components/InfoActions/Card/Card.vue:29-30,39-41,74-81`
- `src/components/InfoActions/InfoActions.vue:77-91`
- `src/directives/ymbonus.directive.ts:34-55`

Каждый экземпляр Card создает media-query subscription, outside-click обработку, window scroll listener и timer state; bonus-карточка дополнительно создает IntersectionObserver composable. При `Показать ещё` число одновременно смонтированных карточек и обработчиков монотонно растет. Cleanup VueUse при unmount ожидается, но пока список остается смонтированным каждый scroll fan-out вызывает N callbacks и N reactive writes.

Рекомендация: один shared media-query и один scroll/outside-click coordinator на список, либо закрытие единственного active popover родителем. Один общий IntersectionObserver на контейнер/директиву имеет смысл при больших списках; сначала подтвердить профилированием на production cardinality.

### [LOW] Нет end-to-end проверки связности текущего promotion config с click mapping

Файлы/строки:

- `external-scripts/promotion-click-metrika.test.js:3-57`
- `src/analytics/promotionEvents.test.ts:1-33`
- `src/directives/ymbonus.directive.test.ts:27-61`

Тесты фиксируют три вручную перечисленных имени на бренд, но не доказывают, что внешний production config содержит соответствующий analytics key, что все требуемые акции покрыты mapping, что скрипт подключен один раз и к нужному counter, либо что поведение безопасно при отсутствующем `ym`/malformed event. Тест директивы не покрывает lifecycle (`updated`, `unmounted`), remount/dedup scope и queued-but-never-delivered case.

Рекомендация: contract test `normalized promotion config ↔ analytics keys ↔ brand counter`; негативные сценарии readiness/consent/malformed payload; lifecycle tests директивы.

## Корректность текущего payload

- Bonus impression: `{ [location.pathname]: { banner: promotion.nameText } }`; counter и goal выбираются по hostname. На неизвестном hostname отправка отключена (`src/config/brand.ts:20-46`).
- Click: `{ name_stock: { [entryPoint]: { name_point: "promo_page" } } }`; counter IDs совпадают с brand-конфигурацией (`96674199` Coral, `215233` Sunmar), но выбор entry point зависит от точного display name.
- Прямых PII, URL query, ERID или user identifiers в рассмотренных payload нет.

## Bundle/runtime observations

- В runtime используются tree-shakable composables `@vueuse/core`; package on disk ≈864 KiB, но размер установленного пакета не равен размеру browser bundle. Без build artifact/source-map точный вклад не доказан.
- `dayjs` установлен и используется в date/filter pipeline, а не непосредственно аналитикой; оптимизировать dependency без bundle analyzer оснований нет.
- Главные подтвержденные runtime costs в рассматриваемом scope — бесконечный 200 ms layout polling и per-card global listener fan-out, а не payload serialization.

## Приоритет исправлений

1. Перевести click attribution со строки названия на стабильный config key и добавить contract validation.
2. Ограничить/cancel `hostReactAppReady()` и исключить вечный layout polling.
3. Унифицировать надежность отправки и consent gate для click/impression.
4. Явно определить lifetime dedup и добавить delivery/lifecycle tests.
5. После production-профилирования консолидировать per-card listeners при подтвержденной нагрузке.

## Verification

- `VERIFIED`: Graphify index изучен; фактические analytics/config/component/entrypoint/external-script исходники и релевантные unit tests прочитаны.
- `NOT VERIFIED`: реальные запросы Яндекс.Метрики, consent-manager интеграция и порядок подключения внешних скриптов на production-хосте — отсутствуют в репозитории.
- `NOT VERIFIED`: итоговый browser bundle не собирался и bundle analyzer не запускался; количественные выводы о gzip-size не заявляются.
