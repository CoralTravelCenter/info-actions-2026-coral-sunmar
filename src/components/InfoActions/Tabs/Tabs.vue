<script setup>
defineProps({
	filters: {
		type: Array,
		required: true
	}
})

/**
 * Было `<li @click>`: элемент не фокусируется и не реагирует на клавиатуру,
 * то есть переключить фильтр без мыши было невозможно. `<button>` даёт фокус,
 * Enter/Space и корректную семантику из коробки; роли tablist/tab сообщают
 * скринридеру, что это переключатель, а не список ссылок.
 */
const model = defineModel({default: 'Все акции'})
</script>

<template>
	<nav class="tabs-navigation" aria-label="Фильтры акций">
		<div class="tabs-navigation__list no-scrollbar" role="tablist">
			<button
					v-for="filter in filters"
					:key="filter"
					type="button"
					role="tab"
					class="tabs-navigation__item"
					:class="{ 'js-active': model === filter }"
					:aria-selected="model === filter"
					:data-tab="filter"
					@click="model = filter"
			>
				{{ filter }}
			</button>
		</div>
	</nav>
</template>

<style scoped lang="scss">
@use 'Tabs';
</style>
