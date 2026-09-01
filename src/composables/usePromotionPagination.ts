import {computed, ref, watch, type Ref} from "vue";

export function usePromotionPagination<T>(
  items: Ref<readonly T[]>,
  pageSize: Ref<number>,
  resetKey: Ref<unknown>,
) {
  const visibleCount = ref(pageSize.value);

  watch([resetKey, pageSize], () => {
    visibleCount.value = pageSize.value;
  });

  const visibleItems = computed(() => items.value.slice(0, visibleCount.value));
  const remainingCount = computed(() =>
    Math.max(0, items.value.length - visibleItems.value.length),
  );
  const nextPageCount = computed(() =>
    Math.min(pageSize.value, remainingCount.value),
  );

  function showMore(): void {
    visibleCount.value += pageSize.value;
  }

  return {nextPageCount, remainingCount, showMore, visibleItems};
}
