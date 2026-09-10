<script setup lang="ts">
import {computed, ref, watchEffect} from "vue";
import {useMediaQuery} from "@vueuse/core";

import {usePromotionContext} from "../../composables/usePromotionContext";
import {usePromotionPagination} from "../../composables/usePromotionPagination";
import {usePromotions} from "../../composables/usePromotions";
import {getPromotions} from "../../data/promotions";
import {syncPromotionCatalog} from "../../seo/promotionCatalog";
import type {Promotion} from "../../types/promotion";
import {collectConfigWarnings, isWarningsVisible} from "../../data/promotionDiagnostics";
import Card from "./Card/Card.vue";
import Tabs from "./Tabs/Tabs.vue";

const rawPromotions = getPromotions();
const {
	currentFilter,
	filteredPromotions,
	filters,
	freshPromotions,
	hasPromotions,
	invalidPromotions,
} = usePromotions(rawPromotions);
const isDesktop = useMediaQuery("(min-width: 1280px)");
const isTablet = useMediaQuery("(min-width: 768px)");
const pageSize = computed(() => isDesktop.value ? 8 : isTablet.value ? 6 : 4);
const {
	nextPageCount,
	remainingCount,
	showMore,
	visibleItems: visiblePromotions,
} = usePromotionPagination<Promotion>(filteredPromotions, pageSize, currentFilter);
const {brand, getErid, publishPromotionClick} = usePromotionContext();
watchEffect(() => syncPromotionCatalog(freshPromotions.value, brand));
const priorityImageCount = computed(() => {
	if (isDesktop.value) return brand === "sunmar" ? 3 : 4;
	return isTablet.value ? 2 : 1;
});
const showWarnings = isWarningsVisible();
const configWarnings = showWarnings
		? collectConfigWarnings(rawPromotions, invalidPromotions)
		: [];
const areWarningsVisible = ref(configWarnings.length > 0);
</script>

<template>
	<div class="info-actions" :class="`info-actions--${brand}`">
	<Tabs
			v-if="hasPromotions"
			v-model="currentFilter"
			:brand="brand"
			:filters="filters"
	/>

	<aside
			v-if="areWarningsVisible"
			class="config-warning"
			aria-labelledby="config-warning-title"
	>
		<span class="config-warning__icon" aria-hidden="true">⚠</span>
		<div>
			<strong id="config-warning-title">Проблемы в конфиге акций</strong>
			<ul>
				<li v-for="message in configWarnings" :key="message">{{ message }}</li>
			</ul>
		</div>
		<button
				type="button"
				class="config-warning__close"
				aria-label="Закрыть предупреждение"
				@click="areWarningsVisible = false"
		>
			×
		</button>
	</aside>

	<ul
			v-if="filteredPromotions.length"
			class="cards-container"
			:class="`cards-container--${brand}`"
			aria-label="Список акций"
	>
		<Card
				v-for="(promotion, index) in visiblePromotions"
				:key="promotion.id"
				v-bonus="{
        name: promotion.nameText,
        enabled: promotion.analytics.bonusImpression,
      }"
				class="card"
				:brand="brand"
				:erid="getErid(promotion)"
				:prioritize-image="index < priorityImageCount"
				:promotion="promotion"
				@promotion-click="publishPromotionClick(promotion)"
		/>
	</ul>

	<button
			v-if="remainingCount"
			type="button"
			class="show-more"
			:class="`show-more--${brand}`"
			@click="showMore"
	>
		Показать ещё {{ nextPageCount }}
	</button>

	<p
		v-if="!hasPromotions"
		class="cards-empty"
		:class="`cards-empty--${brand}`"
		role="status"
	>
		Сейчас нет активных акций
	</p>
	</div>
</template>

<style scoped lang="scss">
@use '../../styles/info-actions';
</style>
