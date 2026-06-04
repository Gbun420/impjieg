import type { MetadataRoute } from "next";
import { SITE } from "@/lib/constants";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SITE.title,
    short_name: "Impjieg",
    description: SITE.description,
    start_url: "/",
    display: "standalone",
    background_color: "#F5F8FC",
    theme_color: "#0B1220",
    icons: [
      {
        src: "/logo-icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
    ],
  };
}
