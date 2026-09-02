import { MetadataRoute } from "next";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://student-aid-bdg.vercel.app";

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${baseUrl}/members`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
    { url: `${baseUrl}/activities`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
    { url: `${baseUrl}/announcements`, lastModified: new Date(), changeFrequency: "daily", priority: 0.8 },
    { url: `${baseUrl}/join`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/members/donors`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.6 },
  ];

  try {
    const [activitySnap, memberSnap] = await Promise.all([
      getDocs(collection(db, "activities")),
      getDocs(collection(db, "members")),
    ]);

    const activityRoutes: MetadataRoute.Sitemap = activitySnap.docs.map((d) => ({
      url: `${baseUrl}/activities/${d.id}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));

    const memberRoutes: MetadataRoute.Sitemap = memberSnap.docs.map((d) => ({
      url: `${baseUrl}/members/${d.id}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    }));

    return [...staticRoutes, ...activityRoutes, ...memberRoutes];
  } catch {
    return staticRoutes;
  }
}
