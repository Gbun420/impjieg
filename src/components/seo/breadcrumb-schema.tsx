import Script from "next/script";
import { headers } from "next/headers";
import { SITE } from "@/lib/constants";

type Crumb = { name: string; path: string };

/**
 * Emits BreadcrumbList JSON-LD for SEO. Uses the request nonce to stay
 * compatible with the app's nonce-based CSP.
 */
export async function BreadcrumbSchema({
  id,
  items,
}: {
  id: string;
  items: Crumb[];
}) {
  const nonce = (await headers()).get("x-nonce");
  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${SITE.url}${item.path}`,
    })),
  };

  return (
    <Script
      id={id}
      type="application/ld+json"
      nonce={nonce ?? undefined}
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
