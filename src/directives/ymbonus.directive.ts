import {useIntersectionObserver} from "@vueuse/core";
import type {Directive} from "vue";
import {reachBonusGoal} from "../config/brand";

interface BonusBindingValue {
  name?: string;
  enabled?: boolean;
}

interface NormalizedBonusBinding {
  name: string;
  enabled: boolean;
}

const sentPromotionNames = new Set<string>();
const stopByElement = new WeakMap<HTMLElement, () => void>();
const INTERSECTION_THRESHOLD = 0.2;

function normalize(value: BonusBindingValue | null | undefined): NormalizedBonusBinding {
  const binding = value ?? {};
  return {
    name: typeof binding.name === "string" ? binding.name.trim() : "",
    enabled: binding.enabled === true,
  };
}

function observe(el: HTMLElement, promotion: NormalizedBonusBinding): void {
  if (!promotion.enabled || !promotion.name) return;
  if (sentPromotionNames.has(promotion.name)) return;

  const {stop} = useIntersectionObserver(
    el,
    ([entry]) => {
      if (!entry?.isIntersecting || sentPromotionNames.has(promotion.name)) return;

      const accepted = reachBonusGoal({
        [location.pathname]: {
          banner: promotion.name,
        },
      });

      if (!accepted) return;

      sentPromotionNames.add(promotion.name);
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
