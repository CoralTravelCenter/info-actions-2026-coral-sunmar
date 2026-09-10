import {createApp} from "vue";
import "../data/promotion-settings-sunmar.js";

import InfoActionsSlider from "../components/InfoActionsSlider/InfoActionsSlider.vue";
import {BRAND_OPTIONS} from "../config/brand";
import clipboard from "../directives/clipboard.directive";
import ymBonus from "../directives/ymbonus.directive";
import {waitForAppPrerequisites} from "./waitForAppPrerequisites";

export default async function infoActionsSlider() {
  const readiness = await waitForAppPrerequisites();
  if (readiness.timedOut) {
    const missing = [
      !readiness.hostReady && "React host",
      !readiness.configReady && "window._promotion_settings",
    ].filter(Boolean).join(" и ");
    console.warn(`[info-actions-slider] Ожидание ${missing} превысило 1 секунду.`);
  }

  const block = document.querySelector("#v-app-info-actions-slider");
  if (!block) return;

  block.dataset.brand = BRAND_OPTIONS.SUNMAR;

  const app = createApp(InfoActionsSlider);
  app.directive("bonus", ymBonus);
  app.directive("clipboard", clipboard);
  app.mount(block);
}
