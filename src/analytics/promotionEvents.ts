import type {Promotion} from "../types/promotion";

export const PROMOTION_CLICK_EVENT = "promotion-card:click";

export interface PromotionClickDetail {
  version: 1;
  promotion: Pick<Promotion, "id" | "nameText" | "url" | "filters">;
  context: {
    brand: "coral" | "sunmar";
    position: number;
    currentFilter: string;
    destination: "link" | "popup";
  };
}

/** Публичный синхронный контракт для внешнего аналитического скрипта. */
export function dispatchPromotionClick(detail: PromotionClickDetail): void {
  window.dispatchEvent(new CustomEvent<PromotionClickDetail>(PROMOTION_CLICK_EVENT, {detail}));
}
