import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Impjieg - Malta's clearest careers platform",
    short_name: "Impjieg",
    description:
      "Malta's clearest careers platform for tech, iGaming, and digital roles.",
    start_url: "/",
    display: "standalone",
    background_color: "#F6F1E8",
    theme_color: "#17355A",
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
