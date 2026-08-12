<script setup>
import {CopyOutlined} from '@ant-design/icons-vue'
import {refAutoReset, useMediaQuery} from '@vueuse/core'

import {BRAND} from '../../../config/brand.js'

const {
	visual,
	name,
	description,
	url,
	promo_end_text,
	promo_end,
	erid,
	entry_point,
	ligal,
} = defineProps({
	visual: String,
	name: String,
	description: String,
	url: String,
	promo_end_text: String,
	/** Техническая дата окончания (МСК) — для атрибута datetime у <time>. */
	promo_end: String,
	erid: String,
	/** Пустая строка = клик не трекаем (см. entry.directive.js). */
	entry_point: String,
	ligal: String,
})

const isMobile = useMediaQuery('(hover: none), (pointer: coarse)')

/** Флаг «Скопировано!» сам сбрасывается — без ручного setTimeout и очистки. */
const copied = refAutoReset(false, 1500)

/**
 * `name` и `description` приходят из внешнего скрипта сайта, поэтому вставлять
 * их через v-html как есть нельзя. Разрешаем единственный тег, который реально
 * используется в контенте, — перенос строки.
 *
 * @param {string} [value]
 */
function sanitize(value) {
	return String(value ?? '').replace(/<(?!br\s*\/?>)[^>]*>/gi, '')
}

/** "2026-09-20 23:59" → "2026-09-20" для машиночитаемого datetime. */
const endDate = promo_end ? promo_end.slice(0, 10) : null
</script>


<template>
	<li class="promo-card">
		<article>
			<a-tooltip
					v-if="erid"
					placement="bottomRight"
					:overlay-inner-style="{ display: 'flex', alignItems: 'center', padding: 0 }"
					:trigger="isMobile ? 'click' : 'hover'"
			>
				<template #title>
					<span class="copy-status" v-if="copied" :style="{ color: '#52c41a' }">Скопировано!</span>
					<div v-else class="content">
						<span class="ligal">{{ ligal }} erid:</span>&nbsp;
						<span class="erid">{{ erid }}</span>
					</div>
					<button
							class="copy"
							type="button"
							aria-label="Скопировать erid"
							v-clipboard="erid"
							@clipboard:success="copied = true"
					>
						<CopyOutlined :style="{ color: copied ? '#52c41a' : '#535353' }"/>
					</button>
				</template>

				<a-button class="tooltip-trigger">Реклама</a-button>
			</a-tooltip>

			<div class="promo-card__visual">
				<!-- width/height фиксируют пропорции и убирают CLS: без SSR верстка
				     иначе прыгает, пока грузятся картинки. -->
				<img
						class="promo-card__image"
						:src="visual"
						:alt="name || 'Промо'"
						width="324"
						height="180"
						loading="lazy"
						decoding="async"
				/>
			</div>

			<div class="promo-card__content">
				<!-- h3: уровень следует за заголовком секции, а не выбирается по размеру шрифта -->
				<h3 class="promo-card__title" v-html="sanitize(name)"></h3>
				<p class="promo-card__description" v-html="sanitize(description)"></p>
				<div class="promo-card__footer">
					<p v-if="promo_end_text" class="promo-card__time">
						<span class="icon" aria-hidden="true">
							<!-- Рендерим одну иконку вместо двух со скрытием через CSS -->
							<svg v-if="BRAND === 'coral'" xmlns="http://www.w3.org/2000/svg" width="22" height="22"
									 viewBox="0 0 22 22" fill="none">
								<circle cx="11" cy="11" r="10" stroke="#535353" stroke-linejoin="round"/>
								<path d="M11 4V11H16" stroke="#535353" stroke-linejoin="round"/>
							</svg>
							<svg v-else xmlns="http://www.w3.org/2000/svg" width="24" height="24"
									 viewBox="0 0 24 24" fill="none">
								<circle cx="12" cy="12" r="9" fill="#2E3465" fill-opacity="0.2" stroke="#2E3465"
												stroke-width="1.5" stroke-linejoin="round"/>
								<path d="M12 5.69995V12H16.5" stroke="#2E3465" stroke-width="1.5" stroke-linejoin="round"/>
							</svg>
						</span>
						<time v-if="endDate" class="time-text" :datetime="endDate">{{ promo_end_text }}</time>
						<span v-else class="time-text">{{ promo_end_text }}</span>
					</p>

					<!-- aria-label: иначе скринридер читает подряд десятки «Подробнее» -->
					<a
							v-if="url"
							v-entry="entry_point"
							class="promo-card__link prime-btn"
							:href="url"
							:aria-label="`Подробнее: ${name}`"
							target="_blank"
							rel="noopener noreferrer"
					>
						Подробнее
					</a>

					<button
							v-else
							v-entry="entry_point"
							type="button"
							class="promo-card__link prime-btn js-popup-trigger"
							:aria-label="`Подробнее: ${name}`"
					>
						Подробнее
					</button>
				</div>
			</div>
		</article>
	</li>
</template>


<style scoped lang="scss">@use "./Card";</style>
