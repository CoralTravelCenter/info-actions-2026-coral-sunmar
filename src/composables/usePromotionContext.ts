import type {Ref} from "vue";
import {computed} from "vue";
import {useUrlSearchParams} from "@vueuse/core";

import {dispatchPromotionClick} from "../analytics/promotionEvents";
import {BRAND} from "../config/brand";
import type {Promotion} from "../types/promotion";

type PromotionDestination = "link" | "popup";

export function resolveErid(
  promotion: Pick<Promotion, "erid" | "appErid">,
  isApplication: boolean,
): string {
  return isApplication && promotion.appErid ? promotion.appErid : promotion.erid;
}

export function usePromotionContext(currentFilter: Ref<string>) {
  const params = useUrlSearchParams("history");
  const isApplication = computed(() => params.mw === "true");

  function getErid(promotion: Promotion): string {
    return resolveErid(promotion, isApplication.value);
  }

  function publishPromotionClick(
    promotion: Promotion,
    position: number,
    destination: PromotionDestination,
  ): void {
    dispatchPromotionClick({
      version: 1,
      promotion: {
        id: promotion.id,
        nameText: promotion.nameText,
        url: promotion.url,
        filters: [...promotion.filters],
      },
      context: {
        brand: BRAND,
        position,
        currentFilter: currentFilter.value,
        destination,
      },
    });
  }

  return {
    brand: BRAND,
    getErid,
    publishPromotionClick,
  };
}
