<script setup lang="ts">
import {nextTick, ref, watch} from "vue";
import {useMediaQuery} from "@vueuse/core";
import {useFixedNavigation} from "../../../composables/useFixedNavigation";

defineProps<{
	filters: readonly string[];
}>();

const anchorRef = ref<HTMLElement | null>(null);
const navigationRef = ref<HTMLElement | null>(null);
const listRef = ref<HTMLElement | null>(null);
const isScrollableNavigation = useMediaQuery("(width < 1024px)");
const {anchorStyle, isFixed, isVisible, navigationStyle} = useFixedNavigation(
	anchorRef,
	navigationRef,
	{
		desktopQuery: "(min-width: 992px)",
		tabletQuery: "(min-width: 768px)",
		mobileTop: 57,
		tabletTop: 41,
		desktopTop: 0,
		hideStep: 48,
		showDistance: 24,
		hideConfirmations: 2,
	},
);

/**
 * Было `<li @click>`: элемент не фокусируется и не реагирует на клавиатуру,
 * то есть переключить фильтр без мыши было невозможно. `<button>` даёт фокус,
 * Enter/Space и корректную семантику из коробки. aria-pressed сообщает,
 * какой фильтр сейчас выбран, не имитируя полноценный ARIA Tabs Pattern.
 */
const model = defineModel<string>({default: "Все акции"});

watch(model, async () => {
	if (!isScrollableNavigation.value) return;
	await nextTick();

	const list = listRef.value;
	const activeItem = list?.querySelector<HTMLElement>("[aria-pressed='true']");
	if (!list || !activeItem) return;

	list.scrollTo({
		left: activeItem.offsetLeft - 8,
		behavior: "smooth",
	});
});
</script>

<template>
	<div ref="anchorRef" class="tabs-navigation-anchor" :style="anchorStyle">
		<div
				ref="navigationRef"
				class="tabs-navigation"
				:class="{
					'tabs-navigation--fixed': isFixed,
					'tabs-navigation--hidden': isFixed && !isVisible,
				}"
				:style="navigationStyle"
		>
			<menu
				ref="listRef"
				class="tabs-navigation__list no-scrollbar"
				aria-label="Фильтры акций"
			>
				<li
					v-for="filter in filters"
					:key="filter"
					class="tabs-navigation__entry"
				>
					<button
						type="button"
						class="tabs-navigation__item"
						:class="{ 'js-active': model === filter }"
						:aria-pressed="model === filter"
						:data-tab="filter"
						@click="model = filter"
					>
						{{ filter }}
					</button>
				</li>
			</menu>
		</div>
	</div>
</template>

<style scoped lang="scss">
@use 'Tabs';
</style>
