import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Dáme Oběd",
    short_name: "Dáme Oběd",
    description: "Polední menu na jednom místě",
    start_url: "/",
    display: "standalone",
    background_color: "#0a0a0a",
    theme_color: "#10b981",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "180x180",
        type: "image/x-icon",
      },
    ],
  };
}
