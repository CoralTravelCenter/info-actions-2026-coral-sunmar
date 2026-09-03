import {createApp} from "vue";

// DEV: перед production-сборкой закомментировать этот импорт.
// На боевом сайте window._promotion_settings заполняет внешний скрипт.
import "../data/promotion-settings.js";

import InfoActions from "../components/InfoActions/InfoActions.vue";
import {BRAND} from "../config/brand";
import ymBonus from "../directives/ymbonus.directive";
import Clipboard from "../directives/clipboard.directive";
import {hostReactAppReady} from "./hostReactAppReady.js";

export default async function infoActions() {
    await hostReactAppReady()
    const target = document.querySelector("#info-actions");
    if (!target) return;

    // Бренд задаётся один раз на корне блока: стили цепляются за
    // [data-brand='sunmar'], вместо класса coral/sunmar на каждой карточке.
    target.dataset.brand = BRAND;

    // Компонент синхронно читает window._promotion_settings:
    // локальный импорт заполняет его в dev, внешний скрипт — на боевом сайте.
    const app = createApp(InfoActions);
    app.directive("bonus", ymBonus);
    app.directive("clipboard", Clipboard);
    app.mount(target);
}
