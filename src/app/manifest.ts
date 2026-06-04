import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Impjieg - Malta's transparent job board",
    short_name: "Impjieg",
    description:
      "Malta's transparent job board with verified salaries, fresh listings, and direct applications.",
    start_url: "/",
    display: "standalone",
    background_color: "#F6F1E8",
    theme_color: "#123B67",
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
