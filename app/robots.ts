import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://student-aid-bdg.vercel.app";
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/members", "/activities", "/announcements", "/join", "/members/donors"],
        disallow: ["/admin", "/admin/login"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
