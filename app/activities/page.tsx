"use client";
import { useEffect, useState } from "react";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { motion } from "framer-motion";
import Image from "next/image";
import { Calendar, Clock, Images, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import { activitiesCopy } from "@/lib/i18n";

interface Activity { id: string; title: string; description: string; date: string; images: string[]; }

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
  return <span className="text-indigo-500 text-xs flex items-center gap-1"><Clock size={12} />{time}</span>;
}

export default function ActivitiesPage() {
  const { language } = useLanguage();
  const copy = activitiesCopy[language];
  const [activities, setActivities] = useState<Activity[]>([]);

  useEffect(() => {
    const q = query(collection(db, "activities"), orderBy("date", "desc"));
    return onSnapshot(q, (snap) =>
      setActivities(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Activity)))
    );
  }, []);

  return (
    <div className="pt-20 sm:pt-24 pb-16 px-3 sm:px-4 max-w-6xl mx-auto">
      <h1 className="text-3xl sm:text-4xl font-bold mb-1">{copy.title}</h1>
      <p className="text-secondary text-sm sm:text-base mb-8 sm:mb-10">{copy.description}</p>
      {activities.length === 0 && <p className="text-muted text-center py-20">{copy.empty}</p>}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {activities.map((a, i) => (
          <motion.div key={a.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} whileHover={{ y: -4 }} transition={{ delay: i * 0.08, type: "spring", stiffness: 260, damping: 20 }}>
            <Link href={`/activities/${a.id}`} className="card block overflow-hidden group">
              <div className="relative w-full h-40 sm:h-48 bg-gray-100 dark:bg-white/5 overflow-hidden">
                {a.images?.[0] ? (
                  <>
                    <Image src={a.images[0]} alt={a.title} fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" className="object-cover group-hover:scale-105 transition duration-500" />
                    {a.images.length > 1 && (
                      <span className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-lg flex items-center gap-1">
                        <Images size={12} /> {a.images.length}
                      </span>
                    )}
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300 dark:text-gray-600">
                    <Images size={32} />
                  </div>
                )}
              </div>
              <div className="p-4 sm:p-5">
                <h3 className="text-base sm:text-lg font-semibold mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition">{a.title}</h3>
                <p className="text-secondary text-sm mb-4 line-clamp-2">{a.description}</p>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1 text-xs text-muted"><Calendar size={12} />{new Date(a.date).toLocaleDateString()}</span>
                  <div className="flex items-center gap-3">
                    <Countdown date={a.date} pastEventLabel={copy.pastEvent} />
                    <span className="text-indigo-500 text-xs flex items-center gap-1 group-hover:gap-2 transition-all">{copy.view} <ArrowRight size={12} /></span>
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
