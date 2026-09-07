import type {Brand} from "../config/brand";
import type {Promotion} from "../types/promotion";

const SCRIPT_ID = "info-actions-offer-catalog";

const BRAND_CONFIG = Object.freeze({
  coral: Object.freeze({
    siteUrl: "https://www.coral.ru",
    brandName: "Coral Travel",
    catalogName: "Акции Coral Travel",
    catalogDescription: "Актуальные акции и специальные предложения Coral Travel",
  }),
  sunmar: Object.freeze({
    siteUrl: "https://www.sunmar.ru",
    brandName: "Sunmar",
    catalogName: "Акции Sunmar",
    catalogDescription: "Актуальные акции и специальные предложения Sunmar",
  }),
});

function absoluteUrl(value: string, siteUrl: string): string {
  if (!value) return "";
  return new URL(value, siteUrl).href;
}

function validThrough(value: string): string | undefined {
  return value ? `${value.replace(" ", "T")}:00+03:00` : undefined;
}

export function buildPromotionCatalog(
  promotions: readonly Promotion[],
  brand: Brand,
  pathname: string,
) {
  const config = BRAND_CONFIG[brand];

  return {
    "@context": "https://schema.org",
    "@type": "OfferCatalog",
    name: config.catalogName,
    description: config.catalogDescription,
    url: absoluteUrl(pathname, config.siteUrl),
    provider: {
      "@type": "Organization",
      name: config.brandName,
      url: `${config.siteUrl}/`,
    },
    itemListElement: promotions.map((promotion, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "Offer",
        name: promotion.nameText,
        description: promotion.descriptionText,
        url: absoluteUrl(promotion.url, config.siteUrl),
        image: promotion.visual,
        category: promotion.filters.join(", "),
        seller: {
          "@type": "Organization",
          name: promotion.legal || config.brandName,
        },
        ...(promotion.promoEnd && {validThrough: validThrough(promotion.promoEnd)}),
      },
    })),
  };
}

export function syncPromotionCatalog(
  promotions: readonly Promotion[],
  brand: Brand,
): void {
  document.getElementById(SCRIPT_ID)?.remove();
  if (!promotions.length) return;

  const script = document.createElement("script");
  script.id = SCRIPT_ID;
  script.type = "application/ld+json";
  script.textContent = JSON.stringify(
    buildPromotionCatalog(promotions, brand, location.pathname),
  );
  document.head.append(script);
}
