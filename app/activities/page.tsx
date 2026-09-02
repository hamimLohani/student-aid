"use client";
import { useEffect, useState } from "react";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { motion } from "framer-motion";
import Image from "next/image";
import {
  Calendar,
  Clock,
  Images,
  ArrowRight,
  Sparkles,
  ChevronDown,
} from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import { activitiesCopy } from "@/lib/i18n";

interface Activity {
  id: string;
  title: string;
  description: string;
  date: string;
  images: string[];
}

/* ── Countdown pill ── */
function Countdown({
  date,
  pastEventLabel,
}: {
  date: string;
  pastEventLabel: string;
}) {
  const [time, setTime] = useState("");
  const [isPast, setIsPast] = useState(false);

  useEffect(() => {
    const tick = () => {
      const diff = new Date(date).getTime() - Date.now();
      if (diff <= 0) {
        setIsPast(true);
        setTime(pastEventLabel);
        return;
      }
      setIsPast(false);
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      setTime(d > 0 ? `${d}d ${h}h ${m}m` : `${h}h ${m}m`);
    };
    tick();
    const id = setInterval(tick, 60000);
    return () => clearInterval(id);
  }, [date, pastEventLabel]);

  return (
    <span className={`countdown-pill ${isPast ? "past" : ""}`}>
      <Clock size={11} />
      {time}
    </span>
  );
}

/* ── Skeleton card ── */
function SkeletonCard() {
  return (
    <div className="card overflow-hidden">
      <div className="skeleton h-48 w-full rounded-none rounded-t-[1.25rem]" />
      <div className="p-5 space-y-3">
        <div className="skeleton h-5 w-3/4 rounded-lg" />
        <div className="skeleton h-4 w-full rounded-lg" />
        <div className="skeleton h-4 w-2/3 rounded-lg" />
        <div className="flex justify-between mt-4">
          <div className="skeleton h-4 w-24 rounded-full" />
          <div className="skeleton h-4 w-20 rounded-full" />
        </div>
      </div>
    </div>
  );
}

const fadeUp = { hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0 } };
const PAGE_SIZE = 9;

export default function ActivitiesPage() {
  const { language } = useLanguage();
  const copy = activitiesCopy[language];
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  useEffect(() => {
    const q = query(collection(db, "activities"), orderBy("date", "desc"));
    return onSnapshot(q, (snap) => {
      setActivities(
        snap.docs.map((d) => ({ id: d.id, ...d.data() } as Activity))
      );
      setLoading(false);
    });
  }, []);

  const visible = activities.slice(0, visibleCount);
  const hasMore = visibleCount < activities.length;

  return (
    <div className="pt-28 sm:pt-32 pb-20 px-4 max-w-6xl mx-auto page-enter">
      {/* Page header */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-12"
      >
        <span className="badge mb-4">
          <Calendar size={12} />
          {copy.title}
        </span>
        <h1
          className="font-display text-4xl sm:text-5xl md:text-6xl font-extrabold mb-4 leading-tight"
          style={{
            background: "linear-gradient(135deg, var(--text-primary) 0%, #6366f1 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          {copy.title}
        </h1>
        <p
          className="text-base sm:text-lg max-w-xl"
          style={{ color: "var(--text-secondary)" }}
        >
          {copy.description}
        </p>
      </motion.div>

      {/* Skeleton loading */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-7">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && activities.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-32 text-center"
        >
          <div
            className="w-20 h-20 rounded-3xl flex items-center justify-center mb-6"
            style={{ background: "var(--bg-section)" }}
          >
            <Sparkles size={36} style={{ color: "var(--text-muted)" }} />
          </div>
          <p
            className="font-display text-xl font-semibold mb-2"
            style={{ color: "var(--text-primary)" }}
          >
            No Activities Yet
          </p>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            {copy.empty}
          </p>
        </motion.div>
      )}

      {/* Activity grid */}
      {!loading && activities.length > 0 && (
        <>
          <motion.div
            initial="hidden"
            animate="show"
            variants={{ show: { transition: { staggerChildren: 0.08 } } }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-7"
          >
            {visible.map((a) => (
              <motion.div
                key={a.id}
                variants={fadeUp}
                whileHover={{ y: -6 }}
                transition={{ type: "spring", stiffness: 280, damping: 22 }}
              >
                <Link
                  href={`/activities/${a.id}`}
                  className="card block overflow-hidden group h-full"
                >
                  {/* Image */}
                  <div className="relative w-full h-48 sm:h-52 overflow-hidden rounded-t-[1.25rem]">
                    {a.images?.[0] ? (
                      <>
                        <Image
                          src={a.images[0]}
                          alt={a.title}
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          className="object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                        {/* Gradient overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        {a.images.length > 1 && (
                          <span className="absolute bottom-3 right-3 flex items-center gap-1 bg-black/60 text-white text-xs px-2.5 py-1.5 rounded-lg backdrop-blur-sm font-medium">
                            <Images size={12} /> {a.images.length}
                          </span>
                        )}
                      </>
                    ) : (
                      <div
                        className="w-full h-full flex items-center justify-center"
                        style={{ background: "var(--bg-section)" }}
                      >
                        <Images
                          size={36}
                          style={{ color: "var(--text-muted)" }}
                        />
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <h3
                      className="font-display text-base sm:text-lg font-bold mb-2 group-hover:text-indigo-500 transition-colors leading-snug"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {a.title}
                    </h3>
                    <p
                      className="text-sm mb-4 line-clamp-2 leading-relaxed"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      {a.description}
                    </p>

                    <div className="flex items-center justify-between">
                      <span
                        className="flex items-center gap-1.5 text-xs font-medium"
                        style={{ color: "var(--text-muted)" }}
                      >
                        <Calendar size={12} />
                        {new Date(a.date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                      <div className="flex items-center gap-2">
                        <Countdown
                          date={a.date}
                          pastEventLabel={copy.pastEvent}
                        />
                        <span className="text-indigo-500 text-xs flex items-center gap-1 font-semibold group-hover:gap-2 transition-all">
                          {copy.view}
                          <ArrowRight size={12} />
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>

          {/* Load more */}
          {hasMore && (
            <div className="flex justify-center mt-12">
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
                className="btn-ghost flex items-center gap-2"
              >
                <ChevronDown size={16} />
                Load More ({activities.length - visibleCount} remaining)
              </motion.button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
