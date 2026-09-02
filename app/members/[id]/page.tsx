import MemberProfileClient from "./MemberClient";
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
    const snap = await getDoc(doc(db, "members", id));
    if (snap.exists()) {
      const m = snap.data();
      const description = [
        m.memberType,
        m.sscYear && `SSC ${m.sscYear}`,
        m.work,
        m.workplace,
        m.address,
      ].filter(Boolean).join(" · ");
      return {
        title: `${m.name} — Student Aid BDG`,
        description: description || "Member profile on Student Aid BDG community.",
        openGraph: {
          title: `${m.name} — Student Aid BDG`,
          description,
          type: "profile",
          images: m.image ? [{ url: m.image, width: 400, height: 400, alt: m.name }] : [],
          url: `${baseUrl}/members/${id}`,
        },
        twitter: {
          card: "summary",
          title: `${m.name} — Student Aid BDG`,
          description,
          images: m.image ? [m.image] : [],
        },
      };
    }
  } catch { /* fallback */ }
  return { title: "Member Profile — Student Aid BDG" };
}

export default function MemberPage() {
  return <MemberProfileClient />;
}
