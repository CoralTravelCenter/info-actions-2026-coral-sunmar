import {computed} from "vue";
import {useUrlSearchParams} from "@vueuse/core";

import {dispatchPromotionClick} from "../analytics/promotionEvents";
import {BRAND} from "../config/brand";
import type {Promotion} from "../types/promotion";

export function resolveErid(
  promotion: Pick<Promotion, "erid" | "appErid">,
  isApplication: boolean,
): string {
  return isApplication && promotion.appErid ? promotion.appErid : promotion.erid;
}

export function usePromotionContext() {
  const params = useUrlSearchParams("history");
  const isApplication = computed(() => params.mw === "true");

  function getErid(promotion: Promotion): string {
    return resolveErid(promotion, isApplication.value);
  }

  function publishPromotionClick(
    promotion: Pick<Promotion, "id" | "nameText" | "url">,
  ): void {
    dispatchPromotionClick({
      id: promotion.id,
      name: promotion.nameText,
      url: promotion.url,
    });
  }

  return {
    brand: BRAND,
    getErid,
    publishPromotionClick,
  };
}
