"use client";
import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { Calendar, Clock, ArrowLeft, X, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import { activityDetailCopy } from "@/lib/i18n";

interface Activity {
  title: string;
  description: string;
  date: string;
  images: string[];
}

function Countdown({ date, pastEventLabel }: { date: string; pastEventLabel: string }) {
  const [time, setTime] = useState("");
  useEffect(() => {
    const tick = () => {
      const diff = new Date(date).getTime() - Date.now();
      if (diff <= 0) { setTime(pastEventLabel); return; }
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      setTime(`${d}d ${h}h ${m}m`);
    };
    tick();
    const id = setInterval(tick, 60000);
    return () => clearInterval(id);
  }, [date, pastEventLabel]);
  return <span className="flex items-center gap-1.5 text-indigo-400"><Clock size={15} />{time}</span>;
}

export default function ActivityDetailClient() {
  const { id } = useParams<{ id: string }>();
  const { language } = useLanguage();
  const copy = activityDetailCopy[language];
  const [activity, setActivity] = useState<Activity | null>(null);
  const [lightbox, setLightbox] = useState<number | null>(null);

  useEffect(() => {
    return onSnapshot(doc(db, "activities", id), (d) => {
      if (d.exists()) setActivity(d.data() as Activity);
    });
  }, [id]);

  const prev = () => setLightbox((i) => (i! > 0 ? i! - 1 : activity!.images.length - 1));
  const next = () => setLightbox((i) => (i! < activity!.images.length - 1 ? i! + 1 : 0));

  if (!activity) return <div className="pt-32 text-center text-muted">{copy.loading}</div>;

  return (
    <div className="pt-20 sm:pt-24 pb-16 px-3 sm:px-4 max-w-4xl mx-auto">
      <Link href="/activities" className="flex items-center gap-2 text-secondary hover:text-indigo-600 mb-6 transition text-sm">
        <ArrowLeft size={16} /> {copy.back}
      </Link>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        {/* Hero image */}
        {activity.images?.[0] && (
          <div className="relative w-full h-56 sm:h-80 rounded-2xl overflow-hidden mb-6 cursor-pointer" onClick={() => setLightbox(0)}>
            <Image src={activity.images[0]} alt={activity.title} fill sizes="(max-width: 640px) 100vw, 896px" className="object-cover hover:scale-105 transition duration-500" />
          </div>
        )}

        {/* Title & meta */}
        <h1 className="text-2xl sm:text-4xl font-bold mb-3">{activity.title}</h1>
        <div className="flex flex-wrap gap-4 text-sm text-secondary mb-6">
          <span className="flex items-center gap-1.5"><Calendar size={15} />{new Date(activity.date).toLocaleDateString(language === "bn" ? "bn-BD" : "en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</span>
          <Countdown date={activity.date} pastEventLabel={copy.pastEvent} />
        </div>

        <p className="text-secondary text-sm sm:text-base leading-relaxed mb-10 whitespace-pre-line">{activity.description}</p>

        {/* Photo gallery */}
        {activity.images?.length > 1 && (
          <div>
            <h2 className="text-lg font-semibold mb-4">{copy.gallery} ({activity.images.length} {copy.photos})</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
              {activity.images.map((img, i) => (
                <motion.div
                  key={i} whileHover={{ scale: 1.02 }}
                  className="relative aspect-square rounded-xl overflow-hidden cursor-pointer"
                  onClick={() => setLightbox(i)}
                >
                  <Image src={img} alt={`${copy.photo} ${i + 1}`} fill sizes="(max-width: 640px) 50vw, 33vw" className="object-cover" />
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </motion.div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox !== null && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center px-4"
            onClick={() => setLightbox(null)}
          >
            <button className="absolute top-4 right-4 text-white/70 hover:text-white z-10" onClick={() => setLightbox(null)}>
              <X size={28} />
            </button>
            {activity.images.length > 1 && (
              <>
                <button className="absolute left-3 sm:left-6 text-white/70 hover:text-white z-10 bg-white/10 rounded-full p-2"
                  onClick={(e) => { e.stopPropagation(); prev(); }}>
                  <ChevronLeft size={24} />
                </button>
                <button className="absolute right-3 sm:right-6 text-white/70 hover:text-white z-10 bg-white/10 rounded-full p-2"
                  onClick={(e) => { e.stopPropagation(); next(); }}>
                  <ChevronRight size={24} />
                </button>
              </>
            )}
            <motion.img
              key={lightbox}
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              src={activity.images[lightbox]}
              alt={`${copy.photo} ${lightbox + 1}`}
              className="max-h-[85vh] max-w-full rounded-xl object-contain"
              onClick={(e) => e.stopPropagation()}
            />
            <p className="absolute bottom-4 text-white/50 text-sm">{lightbox + 1} / {activity.images.length}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
