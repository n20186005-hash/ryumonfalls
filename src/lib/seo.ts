import { faqItems, place } from "@/data/place";

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

export function placeJsonLd(site?: URL | string) {
  const url = pageUrl("/", site);
  const image = toAbsolute("/images/ryumon-falls-hero.webp", site);

  return {
    "@context": "https://schema.org",
    "@type": ["TouristAttraction", "LocalBusiness"],
    name: place.name,
    alternateName: [place.kana, place.englishName],
    description: place.description,
    ...(url ? { url } : {}),
    ...(image ? { image: [image] } : {}),
    telephone: place.telephone,
    address: {
      "@type": "PostalAddress",
      streetAddress: "滝414",
      addressLocality: "那須烏山市",
      addressRegion: "栃木県",
      postalCode: "321-0633",
      addressCountry: "JP"
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: place.latitude,
      longitude: place.longitude
    },
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
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: place.ratingValue,
      reviewCount: place.reviewCount,
      bestRating: "5",
      worstRating: "1"
    }
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
