import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/business";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Der interne Bereich und die API haben in keinem Index etwas zu suchen.
        disallow: ["/intern", "/intern/", "/api/"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
