import { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/api/"],
      },
      // AI answer-engine / search crawlers: allowed on public pages so KamKhoj
      // content stays citable in ChatGPT Search, Perplexity, Claude, and
      // Google AI Overviews (which read the Google index). NOTE: allowing a
      // bot to *read* pages for answers is separate from granting *training*
      // rights — Google-Extended below currently opts IN to Gemini training
      // use. Flip it to disallow if you want answers without training.
      // Human-readable policy: /llms.txt
      {
        userAgent: ["OAI-SearchBot", "ChatGPT-User", "PerplexityBot", "ClaudeBot", "Google-Extended"],
        allow: "/",
        disallow: ["/admin", "/api/"],
      },
      // GPTBot is OpenAI's training crawler (does not affect ChatGPT answers
      // sourced from search). Blocked: no training on KamKhoj content.
      {
        userAgent: "GPTBot",
        disallow: "/",
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
