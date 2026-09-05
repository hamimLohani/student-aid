import ActivityDetailClient from "./ActivityClient";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Metadata } from "next";

export async function generateStaticParams() {
  return [];
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://student-aid-bdg.vercel.app";
  try {
    const snap = await getDoc(doc(db, "activities", id));
    if (snap.exists()) {
      const data = snap.data();
      const image = data.images?.[0];
      return {
        title: `${data.title} — Student Aid BDG`,
        description: data.description?.replace(/<[^>]*>?/gm, '').slice(0, 155) || "An activity by Student Aid BDG community.",
        openGraph: {
          title: data.title,
          description: data.description?.replace(/<[^>]*>?/gm, '').slice(0, 155),
          type: "article",
          images: image ? [{ url: image, width: 1200, height: 630, alt: data.title }] : [],
          url: `${baseUrl}/activities/${id}`,
        },
        twitter: {
          card: "summary_large_image",
          title: data.title,
          description: data.description?.replace(/<[^>]*>?/gm, '').slice(0, 155),
          images: image ? [image] : [],
        },
      };
    }
  } catch { /* fallback */ }
  return { title: "Activity — Student Aid BDG" };
}

export default function ActivityPage() {
  return <ActivityDetailClient />;
}
