import type {Ref} from "vue";
import {computed, ref, watch} from "vue";
import {useNow} from "@vueuse/core";

import {normalizePromotions} from "../data/promoSchema";
import {
  filterFreshOffers,
  getPromotionEndTimestamp,
  isEndingSoon,
} from "../data/promotionDates";

const ALL_FILTER = "Все акции";
export const ENDING_SOON_FILTER = "Скоро закончатся";

export function usePromotions(
  rawPromotions: readonly unknown[],
  currentTime: Ref<Date> = useNow({interval: 60_000}),
) {
  const normalized = normalizePromotions(rawPromotions);
  const currentFilter = ref(ALL_FILTER);

  const freshPromotions = computed(() =>
    normalized.promotions.filter(promotion => filterFreshOffers(promotion, currentTime.value)),
  );

  const endingSoonPromotions = computed(() =>
    [...freshPromotions.value]
      .filter(promotion => isEndingSoon(promotion, currentTime.value))
      .sort((first, second) =>
        getPromotionEndTimestamp(first) - getPromotionEndTimestamp(second),
      ),
  );

  const filters = computed(() => {
    const configFilters = freshPromotions.value.flatMap(promotion => promotion.filters);
    return [
      ALL_FILTER,
      ...(endingSoonPromotions.value.length ? [ENDING_SOON_FILTER] : []),
      ...new Set(configFilters.filter(filter => filter !== ENDING_SOON_FILTER)),
    ];
  });

  watch(filters, availableFilters => {
    if (!availableFilters.includes(currentFilter.value)) {
      currentFilter.value = ALL_FILTER;
    }
  });

  const filteredPromotions = computed(() => {
    if (currentFilter.value === ALL_FILTER) return freshPromotions.value;
    if (currentFilter.value === ENDING_SOON_FILTER) {
      return endingSoonPromotions.value;
    }
    return freshPromotions.value.filter(promotion =>
      promotion.filters.includes(currentFilter.value),
    );
  });

  const hasPromotions = computed(() => freshPromotions.value.length > 0);

  return {
    currentFilter,
    filteredPromotions,
    filters,
    freshPromotions,
    hasPromotions,
    invalidPromotions: normalized.invalid,
  };
}
