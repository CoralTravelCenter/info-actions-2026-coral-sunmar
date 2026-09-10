<script setup lang="ts">
import {ref, watch} from "vue";
import useEmblaCarousel from "embla-carousel-vue";

import {BRAND_OPTIONS} from "../../config/brand";
import {usePromotionContext} from "../../composables/usePromotionContext";
import {usePromotions} from "../../composables/usePromotions";
import {getPromotions} from "../../data/promotions";
import Card from "../InfoActions/Card/Card.vue";

const brand = BRAND_OPTIONS.SUNMAR;
const {freshPromotions} = usePromotions(getPromotions());
const {getErid, publishPromotionClick} = usePromotionContext();
const [emblaRef, emblaApi] = useEmblaCarousel({
  align: "start",
  containScroll: "trimSnaps",
  loop: false,
});

const canScrollPrev = ref(false);
const canScrollNext = ref(false);
const scrollSnaps = ref<number[]>([]);
const selectedIndex = ref(0);

function updateControls(): void {
  const api = emblaApi.value;
  canScrollPrev.value = api?.canScrollPrev() ?? false;
  canScrollNext.value = api?.canScrollNext() ?? false;
  scrollSnaps.value = api?.scrollSnapList() ?? [];
  selectedIndex.value = api?.selectedScrollSnap() ?? 0;
}

function scrollPrev(): void {
  emblaApi.value?.scrollPrev();
}

function scrollNext(): void {
  emblaApi.value?.scrollNext();
}

function scrollTo(index: number): void {
  emblaApi.value?.scrollTo(index);
}

watch(emblaApi, (api, _, onCleanup) => {
  if (!api) return;

  updateControls();
  api.on("select", updateControls);
  api.on("reInit", updateControls);
  api.on("slidesChanged", updateControls);

  onCleanup(() => {
    api.off("select", updateControls);
    api.off("reInit", updateControls);
    api.off("slidesChanged", updateControls);
  });
}, {immediate: true});
</script>

<template>
  <div
    v-if="freshPromotions.length"
    class="promotions-slider"
    :class="`promotions-slider--${brand}`"
    role="region"
    aria-label="Акции"
  >
    <div class="promotions-slider__stage">
      <div ref="emblaRef" class="promotions-slider__viewport">
        <ul class="promotions-slider__container">
          <Card
            v-for="(promotion, index) in freshPromotions"
            :key="promotion.id"
            v-bonus="{
              name: promotion.nameText,
              enabled: promotion.analytics.bonusImpression,
            }"
            class="promotions-slider__slide"
            :brand="brand"
            :erid="getErid(promotion)"
            :prioritize-image="index < 3"
            :promotion="promotion"
            :show-time="false"
            @promotion-click="publishPromotionClick(promotion)"
          />
        </ul>
      </div>

      <button
        v-if="canScrollPrev || canScrollNext"
        type="button"
        class="promotions-slider__button promotions-slider__button--prev"
        :disabled="!canScrollPrev"
        aria-label="Предыдущие акции"
        @click="scrollPrev"
      >
        <svg
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
          width="9"
          height="8"
          viewBox="0 0 9 8"
          fill="none"
        >
          <path
            d="M3.16667 0.705933L0.5 3.70593L3.16667 6.70593M0.5 3.70593H8.5"
            stroke="#535353"
            stroke-linecap="square"
            stroke-linejoin="round"
          />
        </svg>
      </button>
      <button
        v-if="canScrollPrev || canScrollNext"
        type="button"
        class="promotions-slider__button promotions-slider__button--next"
        :disabled="!canScrollNext"
        aria-label="Следующие акции"
        @click="scrollNext"
      >
        <svg
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
          width="10"
          height="8"
          viewBox="0 0 10 8"
          fill="none"
        >
          <path
            d="M6.33333 0.740234L9 3.74023L6.33333 6.74023M9 3.74023H1"
            stroke="#535353"
            stroke-linecap="square"
            stroke-linejoin="round"
          />
        </svg>
      </button>
    </div>

    <div v-if="scrollSnaps.length > 1" class="promotions-slider__pagination">
      <button
        v-for="(_, index) in scrollSnaps"
        :key="index"
        type="button"
        class="promotions-slider__dot"
        :class="{'promotions-slider__dot--active': index === selectedIndex}"
        :aria-label="`Перейти к позиции ${index + 1}`"
        :aria-current="index === selectedIndex ? 'true' : undefined"
        @click="scrollTo(index)"
      />
    </div>
  </div>
</template>

<style scoped lang="scss">
.promotions-slider {
  width: 100%;

  &__stage {
    position: relative;

    @media (width >= 993px) {
      box-sizing: border-box;
      padding-inline: 15px;
    }
  }

  &__viewport {
    overflow: hidden;
  }

  &__container {
    display: flex;
    gap: 16px;
    margin: 0;
    padding: 0;
    list-style: none;
    touch-action: pan-y pinch-zoom;
  }

  &__slide {
    flex: 0 0 calc((100% - 32px) / 3);
    min-width: 0;

    :deep(.promo-card__content) {
      padding: 24px 42px;
    }

    :deep(.promo-card__title) {
      margin-bottom: 8px;
      font-size: 20px;
    }

    :deep(.promo-card__description) {
      margin-bottom: 24px;
      font-size: 16px;
    }
  }

  &__button {
    position: absolute;
    top: 50%;
    display: none;
    place-items: center;
    width: 50px;
    height: 50px;
    padding: 0;
    background: #fff;
    border: 0;
    border-radius: 8px;
    box-shadow:
      0 6px 16px 0 rgb(0 0 0 / 8%),
      0 3px 6px -4px rgb(0 0 0 / 12%),
      0 9px 28px 8px rgb(0 0 0 / 5%);
    cursor: pointer;
    transform: translateY(-50%);

    &--prev {
      left: -59px;
    }

    &--next {
      right: -59px;
    }

    @media (width >= 993px) {
      display: grid;
    }

    &:focus-visible {
      outline: 2px solid var(--color_Sunmar_Primary);
      outline-offset: 2px;
    }

    &:disabled {
      cursor: default;
      opacity: 0.35;
    }
  }

  &__pagination {
    display: flex;
    gap: 8px;
    justify-content: center;
    margin-top: 30px;
  }

  &__dot {
    position: relative;
    width: 10px;
    height: 10px;
    padding: 0;
    background: #2e3465;
    border: 0;
    border-radius: 5px;
    cursor: pointer;
    opacity: 0.3;

    &--active {
      opacity: 1;

      &::after {
        position: absolute;
        inset: -3px;
        border: 1px solid #2e3465;
        border-radius: 50%;
        content: '';
      }
    }

    &:focus-visible {
      outline: 2px solid var(--color_Sunmar_Primary);
      outline-offset: 2px;
    }
  }
}
</style>
