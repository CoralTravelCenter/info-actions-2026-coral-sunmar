<script setup>
import {computed, h, onMounted, ref, shallowRef} from "vue";
import {useUrlSearchParams} from "@vueuse/core";
// Точечные импорты конкретных модулей, а не пакета целиком:
// `import('ant-design-vue')` не тришейкается и утащил бы всю библиотеку.
import notification from "ant-design-vue/es/notification";
import WarningOutlined from "@ant-design/icons-vue/WarningOutlined";

import {filterFreshOffers} from "../../utils/filterFreshOffers.js";
import {collectConfigWarnings, isWarningsVisible} from "../../utils/configWarnings.js";
import {loadPromotions} from "../../data/promotions";
import {normalizePromotions} from "../../data/promoSchema";
import Tabs from "./Tabs/Tabs.vue";
import Card from "./Card/Card.vue";

/** Таб «показать всё» — единственное место, где задан этот текст. */
const ALL_FILTER = "Все акции";

const currentFilter = ref(ALL_FILTER);

// Данные приходят асинхронно: на проде — из внешнего скрипта сайта,
// в dev — из локальной фикстуры (см. data/promotions.ts).
const promotionsArr = shallowRef([]);
const isLoading = ref(true);

const showWarnings = isWarningsVisible();

/**
 * Служебное уведомление для контент-менеджеров о проблемах в конфиге.
 *
 * Notification, а не Alert: сообщение техническое и не должно занимать место
 * в вёрстке блока.
 *
 * Стилизуем под предупреждение через `open()` с явной иконкой: `notification.warning()`
 * не позволяет задать свой акцент (цветную полосу слева).
 *
 * @param {string[]} messages Готовые описания проблем.
 */
function notifyConfigWarnings(messages) {
	if (!messages.length) return;

	notification.open({
		key: "info-actions-config",
		message: "Проблемы в конфиге акций",
		description: h("ul", {style: "margin:0;padding-left:18px"},
				messages.map(text => h("li", null, text))),
		icon: () => h(WarningOutlined, {style: "color:#faad14"}),
		placement: "bottomRight",
		duration: null, // не скрывать автоматически: сообщение для разработки
		style: {width: "420px", borderLeft: "4px solid #faad14"},
	});
}

onMounted(async () => {
	try {
		const raw = await loadPromotions();

		// Контракт полей и производные значения — в types/promotion.ts
		// и data/promoSchema.ts.
		// Записи без обязательных полей отбрасываются и попадают в invalid.
		const {promotions, invalid} = normalizePromotions(raw);
		promotionsArr.value = promotions;

		// Проверки по сырым данным: только там видна разница между
		// «поля нет» (осознанно) и «поле пустое» (забыли заполнить).
		if (showWarnings) notifyConfigWarnings(collectConfigWarnings(raw, invalid));
	} finally {
		isLoading.value = false;
	}
});

const freshOffers = computed(() =>
		promotionsArr.value.filter(o => filterFreshOffers(o))
);

const filters = computed(() => {
	const set = new Set();
	freshOffers.value.forEach(p => p.filtersArr.forEach(f => set.add(f)));
	return [ALL_FILTER, ...set];
});

const filteredPromotions = computed(() => {
	if (currentFilter.value === ALL_FILTER) return freshOffers.value;
	return freshOffers.value.filter(p => p.filtersArr.includes(currentFilter.value));
});

const params = useUrlSearchParams("history");
const isApplication = computed(() => params.mw === "true");
</script>

<template>
	<Tabs
			v-if="filteredPromotions.length"
			:filters="filters"
			v-model="currentFilter"
	/>

	<ul class="cards-container">
		<Card
				v-for="promotion in filteredPromotions"
				:key="promotion.id"
				class="card"
				:data-filter="promotion.filtersArr.join(', ')"
				:visual="promotion.visual"
				:name="promotion.name"
				:description="promotion.description"
				:url="promotion.url"
				:promo_end_text="promotion.promo_end_text"
				:promo_end="promotion.promo_end"
				:ligal="promotion.ligal"
				:erid="isApplication ? promotion.app_erid : promotion.erid"
				:entry_point="promotion.entry_point"
				v-bonus="promotion.isBonus ? promotion.name : ''"
		/>
	</ul>

	<p v-if="!isLoading && !filteredPromotions.length" class="cards-empty">
		Сейчас нет активных акций
	</p>
</template>

<style scoped lang="scss">
@use '../../styles/common/mixins';

.cards-container {
	margin: 0;
	padding: 0;
	list-style: none;

	@include mixins.flex-grid(1, 24px, center);

	@media (width >= 768px) {
		@include mixins.flex-grid(2, 24px, start);
	}

	@media (width >= 1280px) {
		@include mixins.flex-grid(4, 24px, start);
	}
}

.cards-empty {
	margin: 24px 0;
	text-align: center;
}

/* Брендирование — через data-brand на корне блока (см. scripts/info-actions.js),
   а не классом на каждой карточке. */
:global([data-brand='sunmar']) .cards-container {
	@media (width >= 1280px) {
		@include mixins.flex-grid(3, 24px, start);
	}
}
</style>
