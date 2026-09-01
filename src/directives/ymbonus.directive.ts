import {useIntersectionObserver} from "@vueuse/core";
import type {Directive} from "vue";
import {reachBonusGoal} from "../config/brand";

interface BonusBindingValue {
  id?: string;
  name?: string;
  enabled?: boolean;
}

interface NormalizedBonusBinding {
  id: string;
  name: string;
  enabled: boolean;
}

const sentPromotionIds = new Set<string>();
const stopByElement = new WeakMap<HTMLElement, () => void>();
const INTERSECTION_THRESHOLD = 0.2;

function normalize(value: BonusBindingValue | null | undefined): NormalizedBonusBinding {
  const binding = value ?? {};
  return {
    id: typeof binding.id === "string" ? binding.id.trim() : "",
    name: typeof binding.name === "string" ? binding.name.trim() : "",
    enabled: binding.enabled === true,
  };
}

function observe(el: HTMLElement, promotion: NormalizedBonusBinding): void {
  if (!promotion.enabled || !promotion.id || !promotion.name) return;
  if (sentPromotionIds.has(promotion.id)) return;

  const {stop} = useIntersectionObserver(
    el,
    ([entry]) => {
      if (!entry?.isIntersecting || sentPromotionIds.has(promotion.id)) return;

      const accepted = reachBonusGoal({
        [location.pathname]: {
          banner: promotion.name,
        },
      });

      if (!accepted) return;

      sentPromotionIds.add(promotion.id);
      stop();
      stopByElement.delete(el);
    },
    {threshold: INTERSECTION_THRESHOLD},
  );

  stopByElement.set(el, stop);
}

const ymBonus: Directive<HTMLElement, BonusBindingValue> = {
  mounted(el, binding) {
    observe(el, normalize(binding.value));
  },

  updated(el, binding) {
    const next = normalize(binding.value);
    const previous = normalize(binding.oldValue);
    if (
      next.id === previous.id &&
      next.name === previous.name &&
      next.enabled === previous.enabled
    ) {
      return;
    }

    stopByElement.get(el)?.();
    stopByElement.delete(el);
    observe(el, next);
  },

  unmounted(el) {
    stopByElement.get(el)?.();
    stopByElement.delete(el);
  },
};

export default ymBonus;
