import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/employer/", "/auth/"],
    },
    sitemap: `${process.env.NEXT_PUBLIC_URL || "https://impjieg.com"}/sitemap.xml`,
  };
}
