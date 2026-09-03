<script setup lang="ts">
import {computed, ref, useId} from "vue";
import {
  onClickOutside,
  refAutoReset,
  useEventListener,
  useMediaQuery,
  useTimeoutFn,
} from "@vueuse/core";
import type {Promotion} from "../../../types/promotion";

const props = withDefaults(defineProps<{
  promotion: Promotion;
  brand: "coral" | "sunmar";
  erid?: string;
  prioritizeImage?: boolean;
}>(), {
  erid: "",
  prioritizeImage: false,
});

const emit = defineEmits<{
  "promotion-click": [];
}>();

const copied = refAutoReset(false, 1500);
const isEridOpen = ref(false);
const eridDisclosureRef = ref<HTMLElement | null>(null);
const canHover = useMediaQuery("(hover: hover) and (pointer: fine)");
const eridPopoverId = useId();
const endDate = computed(() => props.promotion.promoEnd.slice(0, 10) || null);
const legalDetails = computed(() => {
  const match = props.promotion.legal.match(/^(.*?)(?:\s+(ИНН\s+\d+))$/i);
  return {
    name: match?.[1] ?? props.promotion.legal,
    taxId: match?.[2] ?? "",
  };
});
const {start: scheduleHoverClose, stop: cancelHoverClose} = useTimeoutFn(() => {
  if (canHover.value) isEridOpen.value = false;
}, 150, {immediate: false});

function openOnHover(): void {
  if (!canHover.value) return;
  cancelHoverClose();
  isEridOpen.value = true;
}

function closeOnHover(): void {
  if (canHover.value) scheduleHoverClose();
}

function closeOnFocusOut(event: FocusEvent): void {
  const nextTarget = event.relatedTarget;
  if (
    nextTarget instanceof Node &&
    eridDisclosureRef.value?.contains(nextTarget)
  ) {
    return;
  }

  closeOnHover();
}

function toggleOnClick(): void {
  if (canHover.value) {
    isEridOpen.value = true;
    return;
  }

  isEridOpen.value = !isEridOpen.value;
}

onClickOutside(eridDisclosureRef, () => {
  isEridOpen.value = false;
});

useEventListener(window, "scroll", () => {
  cancelHoverClose();
  isEridOpen.value = false;
}, {passive: true});
</script>

<template>
  <li class="promo-card">
    <article>
      <div
        v-if="erid"
        ref="eridDisclosureRef"
        class="erid-disclosure"
				@mouseenter="openOnHover"
				@mouseleave="closeOnHover"
				@focusin="openOnHover"
				@focusout="closeOnFocusOut"
        @keydown.esc="isEridOpen = false"
      >
        <button
          type="button"
          class="tooltip-trigger"
          :aria-expanded="isEridOpen"
          :aria-controls="eridPopoverId"
          aria-haspopup="dialog"
          @click="toggleOnClick"
        >
          Реклама
        </button>

        <div
          v-if="isEridOpen"
          :id="eridPopoverId"
          class="erid-popover"
          role="dialog"
          aria-label="Рекламная информация"
					@mouseenter="openOnHover"
					@mouseleave="closeOnHover"
        >
          <div class="content">
            <div class="legal">
              <span class="legal__name">{{ legalDetails.name }}</span>
              <span v-if="legalDetails.taxId" class="legal__tax-id">
                {{ legalDetails.taxId }}
              </span>
            </div>

            <div class="erid-details">
              <span>erid:</span>
              <code class="erid">{{ erid }}</code>
            </div>
            <button
            v-clipboard="erid"
            class="copy"
            type="button"
            :aria-label="copied ? 'ERID скопирован' : 'Скопировать ERID'"
            @clipboard:success="copied = true"
          >
            <svg
              aria-hidden="true"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              :stroke="copied ? 'var(--color_Status_Success)' : 'var(--color_Header_Icon)'"
              stroke-width="2"
            >
              <rect x="9" y="9" width="11" height="11" rx="2" />
              <path d="M15 9V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h3" />
            </svg>
            </button>

            <span class="copy-status" aria-live="polite">
              {{ copied ? "ERID скопирован" : "" }}
            </span>
          </div>
        </div>
      </div>

      <div class="promo-card__visual">
        <img
          class="promo-card__image"
          :src="promotion.visual"
          :alt="promotion.nameText || 'Промо'"
          width="324"
          height="180"
          :loading="prioritizeImage ? 'eager' : 'lazy'"
          :fetchpriority="prioritizeImage ? 'high' : 'auto'"
          decoding="async"
        >
      </div>

      <div class="promo-card__content">
        <h3 class="promo-card__title" v-html="promotion.nameHtml"></h3>
        <p class="promo-card__description" v-html="promotion.descriptionHtml"></p>

        <div class="promo-card__footer">
          <p v-if="promotion.promoEndText" class="promo-card__time">
            <span class="icon" aria-hidden="true">
              <svg
                v-if="brand === 'coral'"
                xmlns="http://www.w3.org/2000/svg"
                width="22"
                height="22"
                viewBox="0 0 22 22"
                fill="none"
              >
                <circle cx="11" cy="11" r="10" stroke="var(--color_Header_Icon)" stroke-linejoin="round" />
                <path d="M11 4V11H16" stroke="var(--color_Header_Icon)" stroke-linejoin="round" />
              </svg>
              <svg
                v-else
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
              >
                <circle
                  cx="12"
                  cy="12"
                  r="9"
                  fill="var(--color_Sunmar_Primary)"
                  fill-opacity="0.2"
                  stroke="var(--color_Sunmar_Primary)"
                  stroke-width="1.5"
                  stroke-linejoin="round"
                />
                <path
                  d="M12 5.69995V12H16.5"
                  stroke="var(--color_Sunmar_Primary)"
                  stroke-width="1.5"
                  stroke-linejoin="round"
                />
              </svg>
            </span>
            <time v-if="endDate" class="time-text" :datetime="endDate">
              {{ promotion.promoEndText }}
            </time>
            <span v-else class="time-text">{{ promotion.promoEndText }}</span>
          </p>

          <a
            v-if="promotion.url"
            class="promo-card__link prime-btn"
            :href="promotion.url"
            :aria-label="`Подробнее: ${promotion.nameText}`"
            target="_blank"
            rel="noopener noreferrer"
            @click="emit('promotion-click')"
          >
            Подробнее
          </a>

          <button
            v-else
            type="button"
            class="promo-card__link prime-btn js-popup-trigger"
            :aria-label="`Подробнее: ${promotion.nameText}`"
            @click="emit('promotion-click')"
          >
            Подробнее
          </button>
        </div>
      </div>
    </article>
  </li>
</template>

<style scoped lang="scss">@use "./Card";</style>
