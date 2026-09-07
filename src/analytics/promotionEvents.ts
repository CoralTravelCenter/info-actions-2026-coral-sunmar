export const PROMOTION_CLICK_EVENT = "promotion-card:click";

export interface PromotionClickDetail {
  name: string;
  url: string;
}

/** Публичный синхронный контракт для внешнего аналитического скрипта. */
export function dispatchPromotionClick(detail: PromotionClickDetail): void {
  document.dispatchEvent(new CustomEvent<PromotionClickDetail>(PROMOTION_CLICK_EVENT, {detail}));
}
