import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "KamKhoj",
    short_name: "KamKhoj",
    description: "Find the latest jobs and internships in Nepal",
    start_url: "/",
    display: "standalone",
    background_color: "#f8fbff",
    theme_color: "#1769e8",
    icons: [
      {
        src: "/favicon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
  };
}
