import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Impjieg — Malta's Job Board",
    short_name: "Impjieg",
    description:
      "Malta's modern job board with salary transparency. Find verified salaries and fresh listings.",
    start_url: "/",
    display: "standalone",
    background_color: "#F7F8FA",
    theme_color: "#0A2540",
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
