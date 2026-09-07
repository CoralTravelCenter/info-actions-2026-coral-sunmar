import {createApp} from "vue";
// import "../data/promotion-settings.js";

import InfoActions from "../components/InfoActions/InfoActions.vue";
import {BRAND} from "../config/brand";
import ymBonus from "../directives/ymbonus.directive";
import Clipboard from "../directives/clipboard.directive";
import {waitForAppPrerequisites} from "./waitForAppPrerequisites";

export default async function infoActions() {
    const readiness = await waitForAppPrerequisites();
    if (readiness.timedOut) {
        const missing = [
            !readiness.hostReady && "React host",
            !readiness.configReady && "window._promotion_settings",
        ].filter(Boolean).join(" и ");
        console.warn(`[info-actions] Ожидание ${missing} превысило 1 секунду.`);
    }

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
