import {createApp} from "vue";
// Именованные импорты — в бандл попадают только эти компоненты и их общий
// рантайм (Trigger, cssinjs, tinycolor), а не библиотека целиком.
// NB: Alert здесь не регистрируем — он нужен только для служебного
// предупреждения и грузится лениво в InfoActions.vue, чтобы не весить
// в основном бандле (см. комментарий там).
import {Button, Tooltip} from "ant-design-vue";

import InfoActions from "../components/InfoActions/InfoActions.vue";
import {BRAND} from "../config/brand.js";
import ymBonus from "../directives/ymbonus.directive.js";
import Clipboard from "../directives/clipboard.directive.js";
import vEntry from "../directives/entry.directive.js";

export default function infoActions() {
  const target = document.querySelector("#info-actions");
  if (!target) return;

  // Бренд задаётся один раз на корне блока: стили цепляются за
  // [data-brand='sunmar'], вместо класса coral/sunmar на каждой карточке.
  target.dataset.brand = BRAND;

  // Данные акций приходят из внешнего скрипта сайта (window._promotion_settings),
  // в dev — из локальной фикстуры. Загрузка живёт внутри компонента.
  const app = createApp(InfoActions);
  app.use(Tooltip);
  app.use(Button);
  app.directive("bonus", ymBonus);
  app.directive("clipboard", Clipboard);
  app.directive("entry", vEntry);
  app.mount(target);
}
