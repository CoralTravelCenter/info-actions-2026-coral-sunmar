import {describe, expect, it} from "vitest";

import type {Promotion} from "../types/promotion";
import {buildPromotionCatalog} from "./promotionCatalog";

const promotion: Promotion = {
  name: "Акция<br>Coral",
  nameText: "Акция Coral",
  nameHtml: "Акция<br>Coral",
  descriptionHtml: "Описание &amp; условия",
  descriptionText: "Описание & условия",
  visual: "https://cdn.example.com/promo.webp",
  url: "/promotion/example/",
  filters: ["Турция", "Семейные"],
  legal: "ООО «Туроператор»",
  erid: "",
  appErid: "",
  promoStart: "2026-09-01 00:00",
  promoEnd: "2026-09-30 23:59",
  analytics: {bonusImpression: false},
};

describe("promotionCatalog", () => {
  it("создаёт каталог Coral с абсолютными URL и сроком действия", () => {
    const catalog = buildPromotionCatalog([promotion], "coral", "/promotions/");

    expect(catalog).toMatchObject({
      "@type": "OfferCatalog",
      name: "Акции Coral Travel",
      url: "https://www.coral.ru/promotions/",
      itemListElement: [{
        position: 1,
        item: {
          name: "Акция Coral",
          description: "Описание & условия",
          url: "https://www.coral.ru/promotion/example/",
          category: "Турция, Семейные",
          validThrough: "2026-09-30T23:59:00+03:00",
        },
      }],
    });
  });

  it("использует бренд продавца и не добавляет пустой срок", () => {
    const catalog = buildPromotionCatalog(
      [{...promotion, legal: "", promoEnd: ""}],
      "sunmar",
      "/actions/",
    );

    expect(catalog.name).toBe("Акции Sunmar");
    expect(catalog.itemListElement[0].item.seller.name).toBe("Sunmar");
    expect(catalog.itemListElement[0].item).not.toHaveProperty("validThrough");
  });
});
