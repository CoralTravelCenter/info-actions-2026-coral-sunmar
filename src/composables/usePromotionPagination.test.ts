import {nextTick, ref} from "vue";
import {describe, expect, it} from "vitest";
import {usePromotionPagination} from "./usePromotionPagination";

describe("usePromotionPagination", () => {
  it("показывает элементы порциями и сбрасывается при смене фильтра", async () => {
    const items = ref([1, 2, 3, 4, 5]);
    const pageSize = ref(2);
    const filter = ref("Все");
    const pagination = usePromotionPagination(items, pageSize, filter);

    expect(pagination.visibleItems.value).toEqual([1, 2]);
    expect(pagination.nextPageCount.value).toBe(2);

    pagination.showMore();
    expect(pagination.visibleItems.value).toEqual([1, 2, 3, 4]);

    filter.value = "Другой";
    await nextTick();
    expect(pagination.visibleItems.value).toEqual([1, 2]);
  });
});
