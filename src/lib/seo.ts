import { faqItems, googleMapsShareUrl, officialLinks, place } from "@/data/place";

export function toAbsolute(path: string, site?: URL | string): string | undefined {
  if (!site) return undefined;
  return new URL(path, site).toString();
}

export function normalizePath(path: string): string {
  if (!path.startsWith("/")) return `/${path}`;
  return path;
}

export function pageUrl(path: string, site?: URL | string): string | undefined {
  return toAbsolute(normalizePath(path), site);
}

/**
 * 観光地エンティティの JSON-LD。
 * 評価（aggregateRating / Review）は掲載元の規約順守のため JSON-LD には含めず、
 * 画面上で出典・同期時期を明示して表示する。
 */
export function placeJsonLd(site?: URL | string) {
  const url = pageUrl("/", site);
  const id = url ? `${url}#attraction` : undefined;
  const image = toAbsolute("/images/ryumon-falls-hero.webp", site);
  const galleryImages = [
    "/images/ryumon-falls-hero.webp",
    "/images/ryumon-falls-train.webp",
    "/images/ryumon-falls-autumn.webp"
  ]
    .map((path) => toAbsolute(path, site))
    .filter((value): value is string => Boolean(value));

  return {
    "@context": "https://schema.org",
    "@type": ["TouristAttraction", "LocalBusiness"],
    ...(id ? { "@id": id } : {}),
    name: place.name,
    alternateName: [
      place.kana,
      place.englishName,
      `${place.city}${place.name}`,
      `${place.englishName} ${place.cityEnglish}`,
      `${place.name} ${place.state}${place.city}`
    ],
    description: `${place.name}（${place.englishName}）は${place.state}${place.city}にある滝。${place.description}`,
    ...(url ? { url } : {}),
    ...(galleryImages.length ? { image: galleryImages } : image ? { image: [image] } : {}),
    isAccessibleForFree: true,
    telephone: place.telephone,
    address: {
      "@type": "PostalAddress",
      streetAddress: place.streetAddress,
      addressLocality: place.city,
      addressRegion: place.state,
      postalCode: place.postalCode,
      addressCountry: place.countryCode
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: place.latitude,
      longitude: place.longitude
    },
    hasMap: googleMapsShareUrl,
    sameAs: [googleMapsShareUrl, ...officialLinks.map((link) => link.url)],
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
        opens: "09:00",
        closes: "16:00",
        description: "隣接する龍門ふるさと民芸館の施設利用時間。屋外の滝見学は天候と足元の安全に注意。"
      }
    ],
    priceRange: "無料",
    availableLanguage: ["ja", "en"]
  };
}

export function faqJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqItems.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer
      }
    }))
  };
}

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export function breadcrumbJsonLd(items: BreadcrumbItem[], site?: URL | string) {
  if (!site) return undefined;

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.label,
      ...(item.href ? { item: pageUrl(item.href, site) } : {})
    }))
  };
}
